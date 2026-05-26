import { Request, Response, NextFunction, Router } from "express";
import { MovieService } from "../services/MovieService";
import { InMemoryMovieRepository } from "../repositories/MovieRepository";
import { LockManager } from "../services/LockManager";

/**
 * MovieController
 * Handles incoming Express requests for the Movie Ticket Booking simulation.
 */
export class MovieController {
  private readonly service: MovieService;
  public readonly router: Router;

  constructor() {
    const repository = new InMemoryMovieRepository();
    const lockManager = new LockManager();
    this.service = new MovieService(repository, lockManager);
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get("/movies", this.getMovies.bind(this));
    this.router.get("/shows", this.getShows.bind(this));
    this.router.get("/shows/:showId", this.getShowDetails.bind(this));
    this.router.post("/lock", this.lockSeats.bind(this));
    this.router.post("/book", this.confirmBooking.bind(this));
    this.router.get("/bookings/:userId", this.getBookingsByUser.bind(this));
  }

  public getMovies(req: Request, res: Response, next: NextFunction): void {
    try {
      const movies = this.service.getMovies();
      res.status(200).json(movies);
    } catch (err) {
      next(err);
    }
  }

  public getShows(req: Request, res: Response, next: NextFunction): void {
    try {
      const shows = this.service.getShows();
      res.status(200).json(shows);
    } catch (err) {
      next(err);
    }
  }

  public getShowDetails(req: Request, res: Response, next: NextFunction): void {
    try {
      const { showId } = req.params;
      const userId = (req.query.userId as string) || "anonymous-user";
      const showDetails = this.service.getShowDetails(showId, userId);
      res.status(200).json(showDetails);
    } catch (err) {
      next(err);
    }
  }

  public lockSeats(req: Request, res: Response, next: NextFunction): void {
    try {
      const { userId, showId, seatIds } = req.body;
      if (!userId || !showId || !seatIds || !Array.isArray(seatIds)) {
        res.status(400).json({ error: "Missing parameter: userId, showId, or seatIds array" });
        return;
      }
      const booking = this.service.createPendingBooking(userId, showId, seatIds);
      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  }

  public confirmBooking(req: Request, res: Response, next: NextFunction): void {
    try {
      const { bookingId, paymentMethod } = req.body;
      if (!bookingId || !paymentMethod) {
        res.status(400).json({ error: "Missing parameter: bookingId or paymentMethod" });
        return;
      }
      const booking = this.service.confirmBooking(bookingId, paymentMethod);
      res.status(200).json(booking);
    } catch (err) {
      next(err);
    }
  }

  public getBookingsByUser(req: Request, res: Response, next: NextFunction): void {
    try {
      const { userId } = req.params;
      const bookings = this.service.getBookingsByUser(userId);
      res.status(200).json(bookings);
    } catch (err) {
      next(err);
    }
  }
}
