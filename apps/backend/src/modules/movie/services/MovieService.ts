import { Movie, Show, Booking, BookingStatus, SeatStatus, Seat } from "shared-types";
import { IMovieRepository } from "../repositories/MovieRepository";
import { LockManager } from "./LockManager";
import { SeatAlreadyBookedException, SeatLockedException, NotFoundException, BadRequestException } from "../../../exceptions";
import { generateUUID } from "shared-utils";

/**
 * MovieService
 * Orchestrates movie booking processes, dynamic status checking,
 * seat locks, and payments.
 */
export class MovieService {
  private readonly LOCK_DURATION_MS = 2 * 60 * 1000; // 2 minutes

  constructor(
    private readonly repository: IMovieRepository,
    private readonly lockManager: LockManager
  ) {}

  public getMovies(): Movie[] {
    return this.repository.getMovies();
  }

  public getShows(): Show[] {
    return this.repository.getShows();
  }

  /**
   * getShowDetails()
   * Retrieves show seat layout, overlaying active locks from LockManager
   * so other users see them as blocked/locked in real-time.
   */
  public getShowDetails(showId: string, userId: string): Show {
    const show = this.repository.getShowById(showId);
    if (!show) {
      throw new NotFoundException(`Show with ID ${showId} not found.`);
    }

    // Create a copy to override statuses dynamically without mutating permanent database directly
    const showCopy = JSON.parse(JSON.stringify(show)) as Show;

    for (const key of Object.keys(showCopy.seatMap)) {
      const cell = showCopy.seatMap[key];
      if (cell.status === SeatStatus.AVAILABLE) {
        if (this.lockManager.isLocked(showId, cell.seat.id, userId)) {
          cell.status = SeatStatus.LOCKED;
        }
      }
    }

    return showCopy;
  }

  /**
   * createPendingBooking()
   * Attempts to lock chosen seats. If successful, generates a PENDING booking.
   */
  public createPendingBooking(userId: string, showId: string, seatIds: string[]): Booking {
    const show = this.repository.getShowById(showId);
    if (!show) {
      throw new NotFoundException(`Show with ID ${showId} not found.`);
    }

    if (seatIds.length === 0) {
      throw new BadRequestException("At least one seat must be selected.");
    }

    // 1. Pre-validation check for all seats
    const seatsToBook: Seat[] = [];
    for (const seatId of seatIds) {
      const cell = show.seatMap[seatId];
      if (!cell) {
        throw new NotFoundException(`Seat ${seatId} does not exist in this show hall.`);
      }

      if (cell.status === SeatStatus.BOOKED) {
        throw new SeatAlreadyBookedException(`Seat ${seatId} is already booked.`);
      }

      // Check if locked by someone else
      if (this.lockManager.isLocked(showId, seatId, userId)) {
        throw new SeatLockedException(`Seat ${seatId} is currently reserved by another customer.`);
      }

      seatsToBook.push(cell.seat);
    }

    // 2. Acquire locks in a transactional manner
    for (const seatId of seatIds) {
      const success = this.lockManager.acquireLock(showId, seatId, userId, this.LOCK_DURATION_MS);
      if (!success) {
        // Rollback already acquired locks
        for (const rolledId of seatIds) {
          if (rolledId === seatId) break;
          this.lockManager.releaseLock(showId, rolledId);
        }
        throw new SeatLockedException(`Failed to secure seat locks. Seat ${seatId} was locked concurrently.`);
      }
    }

    // 3. Compute total amount
    const totalAmount = seatsToBook.reduce((sum, seat) => sum + seat.basePrice, 0);

    const lockExpiry = new Date(Date.now() + this.LOCK_DURATION_MS).toISOString();

    // 4. Create booking DTO
    const booking: Booking = {
      id: `booking-${generateUUID()}`,
      userId,
      showId,
      movieTitle: show.movie.title,
      showTime: show.startTime,
      seats: seatsToBook,
      totalAmount,
      status: BookingStatus.PENDING,
      createdAt: new Date().toISOString(),
      lockExpiry
    };

    this.repository.saveBooking(booking);
    return booking;
  }

  /**
   * confirmBooking()
   * Finalizes the payment, marks seats as booked permanently, and clears locks.
   */
  public confirmBooking(bookingId: string, paymentMethod: string): Booking {
    const booking = this.repository.getBookingById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      return booking;
    }

    if (booking.status === BookingStatus.EXPIRED || booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException(`Cannot pay for a booking with status ${booking.status}.`);
    }

    // Check lock expiration
    if (booking.lockExpiry && new Date(booking.lockExpiry).getTime() < Date.now()) {
      booking.status = BookingStatus.EXPIRED;
      this.repository.saveBooking(booking);

      // Release seat locks in registry
      for (const seat of booking.seats) {
        this.lockManager.releaseLock(booking.showId, seat.id);
      }

      throw new BadRequestException("Payment failed. Seat reservation hold has expired.");
    }

    const show = this.repository.getShowById(booking.showId);
    if (!show) {
      throw new NotFoundException(`Show for this booking no longer exists.`);
    }

    // Simulate payment transaction
    const paymentSuccess = Math.random() >= 0.05; // 95% success rate simulation
    if (!paymentSuccess) {
      throw new BadRequestException("Payment gateway returned a failure. Please try again.");
    }

    // Update show seat maps to booked
    for (const seat of booking.seats) {
      const cell = show.seatMap[seat.id];
      if (cell) {
        cell.status = SeatStatus.BOOKED;
      }
      this.lockManager.releaseLock(booking.showId, seat.id);
    }

    booking.status = BookingStatus.CONFIRMED;
    booking.paymentId = `pay-${generateUUID()}`;
    this.repository.saveBooking(booking);

    return booking;
  }

  public getBookingsByUser(userId: string): Booking[] {
    return this.repository.getBookingsByUserId(userId);
  }
}
