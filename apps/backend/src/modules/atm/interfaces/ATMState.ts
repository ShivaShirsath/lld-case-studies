import { ATM } from "../models/ATM";
import { Card } from "shared-types";

/**
 * ATMState
 * Interface for State Pattern. Each concrete state class implements
 * these methods, throwing DomainExceptions if the action is invalid in that state.
 */
export interface ATMState {
  insertCard(atm: ATM, card: Card): void;
  enterPin(atm: ATM, pin: string): void;
  withdraw(atm: ATM, amount: number): void;
  deposit(atm: ATM, amount: number): void;
  checkBalance(atm: ATM): number;
  ejectCard(atm: ATM): void;
}
