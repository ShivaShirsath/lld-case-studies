import { ATMState } from "../interfaces/ATMState";
import type { ATM } from "../models/ATM";
import { Card } from "shared-types";
import { InvalidATMStateException, InvalidPinException, InsufficientCashException } from "../../../exceptions";

/**
 * IdleState
 * ATM is waiting for a card to be inserted.
 */
export class IdleState implements ATMState {
  public insertCard(atm: ATM, card: Card): void {
    if (card.isBlocked) {
      throw new Error("This card is blocked and cannot be used.");
    }
    atm.setActiveCard(card);
    atm.setCurrentState(atm.getCardInsertedState());
  }

  public enterPin(atm: ATM, pin: string): void {
    throw new InvalidATMStateException("Please insert your debit card first.");
  }

  public withdraw(atm: ATM, amount: number): void {
    throw new InvalidATMStateException("Please insert your debit card first.");
  }

  public deposit(atm: ATM, amount: number): void {
    throw new InvalidATMStateException("Please insert your debit card first.");
  }

  public checkBalance(atm: ATM): number {
    throw new InvalidATMStateException("Please insert your debit card first.");
  }

  public ejectCard(atm: ATM): void {
    throw new InvalidATMStateException("There is no card inside the ATM dispenser.");
  }
}

/**
 * CardInsertedState
 * Card is locked inside, awaiting correct PIN entry.
 * Tracks PIN attempts and blocks the card after 3 consecutive failures.
 */
export class CardInsertedState implements ATMState {
  private pinAttempts = 0;

  public insertCard(atm: ATM, card: Card): void {
    throw new InvalidATMStateException("A card is already inserted in the terminal.");
  }

  public enterPin(atm: ATM, pin: string): void {
    const card = atm.getActiveCard();
    if (!card) {
      throw new InvalidATMStateException("Card details missing.");
    }

    const isValid = atm.verifyPin(card.cardNumber, pin);
    if (isValid) {
      this.pinAttempts = 0;
      atm.setCurrentState(atm.getPinVerifiedState());
    } else {
      this.pinAttempts++;
      const left = 3 - this.pinAttempts;
      if (left <= 0) {
        atm.blockCard(card.cardNumber);
        atm.ejectCard();
        throw new InvalidPinException("PIN entered incorrectly 3 times. Card has been blocked and ejected.");
      }
      throw new InvalidPinException(`Incorrect PIN. You have ${left} attempts remaining.`);
    }
  }

  public withdraw(atm: ATM, amount: number): void {
    throw new InvalidATMStateException("Enter card PIN to authorize transactions.");
  }

  public deposit(atm: ATM, amount: number): void {
    throw new InvalidATMStateException("Enter card PIN to authorize transactions.");
  }

  public checkBalance(atm: ATM): number {
    throw new InvalidATMStateException("Enter card PIN to authorize transactions.");
  }

  public ejectCard(atm: ATM): void {
    atm.setActiveCard(null);
    atm.setCurrentState(atm.getIdleState());
  }
}

/**
 * PinVerifiedState
 * Customer authenticated successfully. Allows withdraw, deposit, and balance queries.
 */
export class PinVerifiedState implements ATMState {
  public insertCard(atm: ATM, card: Card): void {
    throw new InvalidATMStateException("A card is already active in this session.");
  }

  public enterPin(atm: ATM, pin: string): void {
    // Already authenticated
  }

  public withdraw(atm: ATM, amount: number): void {
    const card = atm.getActiveCard();
    if (!card) {
      throw new InvalidATMStateException("Session expired. Insert card again.");
    }

    if (amount <= 0) {
      throw new Error("Withdrawal amount must be greater than $0.");
    }

    if (amount % 10 !== 0) {
      throw new Error("ATM only dispenses in multiples of $10 ($10, $20, $50, $100).");
    }

    // Check account balance
    const account = atm.getAccount(card.cardNumber);
    if (!account || account.balance < amount) {
      throw new InsufficientCashException("Insufficient account balance to complete withdrawal.");
    }

    // Check ATM physical inventory
    if (atm.getTotalCash() < amount) {
      throw new InsufficientCashException("ATM dispenser does not have enough physical bills.");
    }

    // 2. Delegate bill split to Dispenser Chain (Chain of Responsibility)
    const split: Record<number, number> = {};
    const tempInv = { ...atm.getCashInventory() };
    const remainder = atm.getDispenserChain().dispense(amount, tempInv, split);

    if (remainder > 0) {
      throw new InsufficientCashException(
        "ATM cannot dispense this exact amount with current bills inventory. Try another value."
      );
    }

    // 3. Complete withdrawal: deduct balances and inventory
    account.balance -= amount;
    atm.deductCashInventory(split);

    // Log transaction
    atm.addTransaction({
      id: `tx-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      accountNumber: account.accountNumber,
      type: "WITHDRAW" as any,
      amount,
      status: "SUCCESS" as any,
      timestamp: new Date().toISOString(),
      notes: `Dispensed: ${Object.entries(split)
        .filter(([_, count]) => count > 0)
        .map(([denom, count]) => `${count}x$${denom}`)
        .join(", ")}`
    });

    if (atm.getTotalCash() === 0) {
      atm.setCurrentState(atm.getOutOfCashState());
    }
  }

  public deposit(atm: ATM, amount: number): void {
    const card = atm.getActiveCard();
    if (!card) {
      throw new InvalidATMStateException("Session expired. Insert card again.");
    }

    if (amount <= 0) {
      throw new Error("Deposit amount must be greater than $0.");
    }

    if (amount % 10 !== 0) {
      throw new Error("Deposit amount must be a multiple of $10.");
    }

    const account = atm.getAccount(card.cardNumber);
    if (!account) {
      throw new Error("Associated account not found.");
    }

    // Update balances
    account.balance += amount;

    // Distribute incoming funds into bills inventory
    let remaining = amount;
    const addedBills: Record<number, number> = { 100: 0, 50: 0, 20: 0, 10: 0 };

    const denominations = [100, 50, 20, 10];
    for (const denom of denominations) {
      const bills = Math.floor(remaining / denom);
      addedBills[denom] = bills;
      remaining %= denom;
    }

    atm.addCashInventory(addedBills);

    // Log transaction
    atm.addTransaction({
      id: `tx-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      accountNumber: account.accountNumber,
      type: "DEPOSIT" as any,
      amount,
      status: "SUCCESS" as any,
      timestamp: new Date().toISOString(),
      notes: `Deposited bills: ${Object.entries(addedBills)
        .filter(([_, count]) => count > 0)
        .map(([denom, count]) => `${count}x$${denom}`)
        .join(", ")}`
    });
  }

  public checkBalance(atm: ATM): number {
    const card = atm.getActiveCard();
    if (!card) {
      throw new InvalidATMStateException("Session expired. Insert card again.");
    }

    const account = atm.getAccount(card.cardNumber);
    if (!account) {
      throw new Error("Account details missing.");
    }

    // Log balance check
    atm.addTransaction({
      id: `tx-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      accountNumber: account.accountNumber,
      type: "BALANCE_INQUIRY" as any,
      status: "SUCCESS" as any,
      timestamp: new Date().toISOString(),
      notes: `Checked balance: $${account.balance}`
    });

    return account.balance;
  }

  public ejectCard(atm: ATM): void {
    atm.setActiveCard(null);
    atm.setCurrentState(atm.getIdleState());
  }
}

/**
 * OutOfCashState
 * Locked terminal state when physical currency dispenser inventory is 0.
 */
export class OutOfCashState implements ATMState {
  public insertCard(atm: ATM, card: Card): void {
    throw new InvalidATMStateException("ATM is currently out of cash and undergoing maintenance.");
  }

  public enterPin(atm: ATM, pin: string): void {
    throw new InvalidATMStateException("ATM is out of cash.");
  }

  public withdraw(atm: ATM, amount: number): void {
    throw new InvalidATMStateException("ATM is out of cash.");
  }

  public deposit(atm: ATM, amount: number): void {
    throw new InvalidATMStateException("ATM is out of cash.");
  }

  public checkBalance(atm: ATM): number {
    throw new InvalidATMStateException("ATM is out of cash.");
  }

  public ejectCard(atm: ATM): void {
    atm.setActiveCard(null);
    atm.setCurrentState(atm.getIdleState());
  }
}
