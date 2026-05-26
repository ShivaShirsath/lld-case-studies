import { ATMState } from "../interfaces/ATMState";
import { IdleState, CardInsertedState, PinVerifiedState, OutOfCashState } from "../states/ConcreteStates";
import { CashDispenser } from "./CashDispenser";
import { Card, Account, ATMTransaction, ATMStatus, ATMStateName } from "shared-types";

/**
 * ATM Aggregate Root
 * Orchestrates transactions. Delegates active behavior to its current State object.
 * Initializes the dispenser chain ($100 -> $50 -> $20 -> $10) via Chain of Responsibility.
 */
export class ATM {
  private readonly idleState: ATMState;
  private readonly cardInsertedState: ATMState;
  private readonly pinVerifiedState: ATMState;
  private readonly outOfCashState: ATMState;

  private currentState: ATMState;

  private readonly cashInventory: Record<number, number> = {
    100: 10, // $1000
    50: 20,  // $1000
    20: 50,  // $1000
    10: 100  // $1000
  }; // Total physical cash inside dispenser = $4000

  private activeCard: Card | null = null;
  private readonly accounts: Map<string, Account> = new Map();
  private readonly transactions: ATMTransaction[] = [];
  private readonly dispenserChain: CashDispenser;

  constructor() {
    this.idleState = new IdleState();
    this.cardInsertedState = new CardInsertedState();
    this.pinVerifiedState = new PinVerifiedState();
    this.outOfCashState = new OutOfCashState();

    this.currentState = this.idleState;

    // Chain setup
    const d100 = new CashDispenser(100);
    const d50 = new CashDispenser(50);
    const d20 = new CashDispenser(20);
    const d10 = new CashDispenser(10);

    d100.setNext(d50);
    d50.setNext(d20);
    d20.setNext(d10);
    this.dispenserChain = d100;

    this.seedDatabase();
  }

  private seedDatabase(): void {
    const card1: Card = {
      cardNumber: "123456789",
      pinHash: "1234",
      cardHolderName: "Shiva",
      isBlocked: false
    };

    const card2: Card = {
      cardNumber: "987654321",
      pinHash: "4321",
      cardHolderName: "Jane Doe",
      isBlocked: false
    };

    this.accounts.set(card1.cardNumber, {
      accountNumber: "ACC-100200",
      card: card1,
      balance: 3500.0,
      pin: "0000"
    });

    this.accounts.set(card2.cardNumber, {
      accountNumber: "ACC-300400",
      card: card2,
      balance: 9500.0,
      pin: "4321"
    });
  }

  public setCurrentState(state: ATMState): void {
    this.currentState = state;
  }

  public getIdleState(): ATMState { return this.idleState; }
  public getCardInsertedState(): ATMState { return this.cardInsertedState; }
  public getPinVerifiedState(): ATMState { return this.pinVerifiedState; }
  public getOutOfCashState(): ATMState { return this.outOfCashState; }

  public getActiveStateName(): ATMStateName {
    if (this.currentState instanceof IdleState) return ATMStateName.IDLE;
    if (this.currentState instanceof CardInsertedState) return ATMStateName.CARD_INSERTED;
    if (this.currentState instanceof PinVerifiedState) return ATMStateName.PIN_VERIFIED;
    if (this.currentState instanceof OutOfCashState) return ATMStateName.OUT_OF_CASH;
    return ATMStateName.IDLE;
  }

  public getActiveCard(): Card | null {
    return this.activeCard;
  }

  public setActiveCard(card: Card | null): void {
    this.activeCard = card;
  }

  public getAccount(cardNumber: string): Account | null {
    return this.accounts.get(cardNumber) || null;
  }

  public verifyPin(cardNumber: string, pin: string): boolean {
    const acc = this.accounts.get(cardNumber);
    return acc ? acc.pin === pin : false;
  }

  public blockCard(cardNumber: string): void {
    const acc = this.accounts.get(cardNumber);
    if (acc) {
      acc.card.isBlocked = true;
    }
  }

  public getCashInventory(): Record<number, number> {
    return this.cashInventory;
  }

  public getTotalCash(): number {
    return Object.entries(this.cashInventory).reduce(
      (sum, [denom, count]) => sum + Number(denom) * count,
      0
    );
  }

  public deductCashInventory(deductions: Record<number, number>): void {
    for (const [denom, count] of Object.entries(deductions)) {
      const val = Number(denom);
      this.cashInventory[val] = (this.cashInventory[val] || 0) - count;
    }
  }

  public addCashInventory(additions: Record<number, number>): void {
    for (const [denom, count] of Object.entries(additions)) {
      const val = Number(denom);
      this.cashInventory[val] = (this.cashInventory[val] || 0) + count;
    }
  }

  public getDispenserChain(): CashDispenser {
    return this.dispenserChain;
  }

  public addTransaction(tx: ATMTransaction): void {
    this.transactions.unshift(tx);
  }

  public getTransactions(): ATMTransaction[] {
    return this.transactions;
  }

  // Delegation / Facade methods
  public insertCard(card: Card): void {
    this.currentState.insertCard(this, card);
  }

  public enterPin(pin: string): void {
    this.currentState.enterPin(this, pin);
  }

  public withdraw(amount: number): void {
    this.currentState.withdraw(this, amount);
  }

  public deposit(amount: number): void {
    this.currentState.deposit(this, amount);
  }

  public checkBalance(): number {
    return this.currentState.checkBalance(this);
  }

  public ejectCard(): void {
    this.currentState.ejectCard(this);
  }

  public getStatus(): ATMStatus {
    const account = this.activeCard ? this.getAccount(this.activeCard.cardNumber) : null;
    return {
      id: "atm-terminal-1",
      currentState: this.getActiveStateName(),
      cashInventory: { ...this.cashInventory },
      totalCash: this.getTotalCash(),
      activeCardNumber: this.activeCard?.cardNumber,
      activeAccountNumber: account?.accountNumber,
      cardHolderName: this.activeCard?.cardHolderName
    };
  }
}
