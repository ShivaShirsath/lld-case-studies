import { ATM } from "../models/ATM";
import { ATMStatus, ATMTransaction } from "shared-types";
import { InvalidCardException } from "../../../exceptions";

/**
 * ATMService
 * Orchestrates ATM operations, delegating calls directly to the ATM aggregate.
 */
export class ATMService {
  constructor(private readonly atm: ATM) {}

  public insertCard(cardNumber: string): ATMStatus {
    const account = this.atm.getAccount(cardNumber);
    if (!account) {
      throw new InvalidCardException(`Debit card number ${cardNumber} is not recognized by this bank.`);
    }
    this.atm.insertCard(account.card);
    return this.atm.getStatus();
  }

  public enterPin(pin: string): ATMStatus {
    this.atm.enterPin(pin);
    return this.atm.getStatus();
  }

  public withdraw(amount: number): ATMStatus {
    this.atm.withdraw(amount);
    return this.atm.getStatus();
  }

  public deposit(amount: number): ATMStatus {
    this.atm.deposit(amount);
    return this.atm.getStatus();
  }

  public checkBalance(): { balance: number; status: ATMStatus } {
    const balance = this.atm.checkBalance();
    return {
      balance,
      status: this.atm.getStatus()
    };
  }

  public ejectCard(): ATMStatus {
    this.atm.ejectCard();
    return this.atm.getStatus();
  }

  public getTransactions(): ATMTransaction[] {
    return this.atm.getTransactions();
  }

  public getStatus(): ATMStatus {
    return this.atm.getStatus();
  }
}
