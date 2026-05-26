/**
 * LockManager
 * Handles temporary seat locks for Movie Ticket Booking system to prevent double-booking.
 * Simulates a redis-style distributed locking mechanism locally.
 */
export class LockManager {
  // Key format: "showId:seatId" -> { userId, expiryTimestamp }
  private readonly locks: Map<string, { userId: string; expiry: number }> = new Map();

  /**
   * acquireLock()
   * Attempts to lock a seat for a user.
   * Returns true if successful, false if already locked by another active user.
   */
  public acquireLock(showId: string, seatId: string, userId: string, durationMs: number): boolean {
    const key = `${showId}:${seatId}`;
    const now = Date.now();
    const existing = this.locks.get(key);

    if (existing) {
      if (existing.userId === userId) {
        // Extend/renew lock
        existing.expiry = now + durationMs;
        return true;
      }
      if (existing.expiry > now) {
        // Locked by someone else and not expired
        return false;
      }
    }

    this.locks.set(key, { userId, expiry: now + durationMs });
    return true;
  }

  public isLocked(showId: string, seatId: string, userId: string): boolean {
    const key = `${showId}:${seatId}`;
    const existing = this.locks.get(key);
    if (!existing) return false;

    if (existing.expiry <= Date.now()) {
      this.locks.delete(key);
      return false; // Lock expired
    }

    return existing.userId !== userId; // Locked if active and owned by someone else
  }

  public releaseLock(showId: string, seatId: string): void {
    this.locks.delete(`${showId}:${seatId}`);
  }
}
