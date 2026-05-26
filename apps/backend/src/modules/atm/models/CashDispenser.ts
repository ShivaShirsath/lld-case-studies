/**
 * CashDispenser
 * Implements the Chain of Responsibility pattern for dispensing cash bills.
 * Distributes the withdrawal amount across denominations ($100, $50, $20, $10).
 */
export class CashDispenser {
  private nextDispenser: CashDispenser | null = null;

  constructor(public readonly denomination: number) {}

  public setNext(next: CashDispenser): CashDispenser {
    this.nextDispenser = next;
    return next;
  }

  /**
   * dispense()
   * Recursively attempts to dispense cash.
   * If a remainder exists and a next dispenser is set, passes responsibility.
   * Returns the remaining remainder (should be 0 for complete success).
   */
  public dispense(
    amount: number,
    inventory: Record<number, number>,
    result: Record<number, number>
  ): number {
    const available = inventory[this.denomination] || 0;
    const needed = Math.floor(amount / this.denomination);
    const bills = Math.min(available, needed);

    if (bills > 0) {
      result[this.denomination] = bills;
      amount -= bills * this.denomination;
    }

    if (amount > 0 && this.nextDispenser) {
      return this.nextDispenser.dispense(amount, inventory, result);
    }

    return amount;
  }
}
