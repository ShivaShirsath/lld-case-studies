import { Movie, Theatre, Show, Booking, Seat, SeatType, SeatStatus } from "shared-types";

/**
 * IMovieRepository Interface
 * Decouples movie, show, theatre cataloging and booking storage.
 */
export interface IMovieRepository {
  getMovies(): Movie[];
  getMovieById(id: string): Movie | null;
  getTheatres(): Theatre[];
  getShowById(id: string): Show | null;
  getShows(): Show[];
  saveBooking(booking: Booking): void;
  getBookingById(id: string): Booking | null;
  getBookingsByUserId(userId: string): Booking[];
}

/**
 * InMemoryMovieRepository
 * Seeds mockup shows, halls, movie titles, and dynamic seat matrix (rows A-E, cols 1-8).
 */
export class InMemoryMovieRepository implements IMovieRepository {
  private movies: Movie[] = [];
  private theatres: Theatre[] = [];
  private shows: Show[] = [];
  private readonly bookings: Map<string, Booking> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    this.movies = [
      {
        id: "movie-1",
        title: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology.",
        durationMinutes: 148,
        language: "English",
        genre: "Sci-Fi / Thriller"
      },
      {
        id: "movie-2",
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space in search of a new home.",
        durationMinutes: 169,
        language: "English",
        genre: "Sci-Fi / Drama"
      },
      {
        id: "movie-3",
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen to seek revenge against the conspirators.",
        durationMinutes: 166,
        language: "English",
        genre: "Sci-Fi / Epic"
      }
    ];

    this.theatres = [
      {
        id: "theatre-1",
        name: "Grand IMAX Dome",
        address: "750 Broadway, New York, NY",
        halls: [
          { id: "hall-1-1", name: "Hall 1 (Laser)", totalSeats: 40 },
          { id: "hall-1-2", name: "Hall 2 (Digital)", totalSeats: 40 }
        ]
      },
      {
        id: "theatre-2",
        name: "Starlight Multiplex",
        address: "101 Hollywood Blvd, Los Angeles, CA",
        halls: [
          { id: "hall-2-1", name: "Screen A", totalSeats: 40 }
        ]
      }
    ];

    const generateSeatMap = (): Record<string, { seat: Seat; status: SeatStatus; lockedBy?: string; lockExpiry?: string }> => {
      const seatMap: Record<string, { seat: Seat; status: SeatStatus }> = {};
      const rows = ["A", "B", "C", "D", "E"];
      for (const row of rows) {
        for (let col = 1; col <= 8; col++) {
          const id = `${row}${col}`;
          let type = SeatType.NORMAL;
          let price = 12.0;

          if (row === "D") {
            type = SeatType.PREMIUM;
            price = 18.0;
          } else if (row === "E") {
            type = SeatType.GOLD;
            price = 25.0;
          }

          seatMap[id] = {
            seat: { id, row, column: col, type, basePrice: price },
            status: SeatStatus.AVAILABLE
          };
        }
      }
      return seatMap;
    };

    const today = new Date();
    const getTime = (offsetHours: number) => {
      const d = new Date(today);
      d.setHours(d.getHours() + offsetHours);
      d.setMinutes(0);
      d.setSeconds(0);
      return d.toISOString();
    };

    this.shows = [
      {
        id: "show-1",
        movie: this.movies[0],
        theatreId: "theatre-1",
        theatreName: "Grand IMAX Dome",
        hall: this.theatres[0].halls[0],
        startTime: getTime(2),
        endTime: getTime(4.5),
        seatMap: generateSeatMap()
      },
      {
        id: "show-2",
        movie: this.movies[1],
        theatreId: "theatre-1",
        theatreName: "Grand IMAX Dome",
        hall: this.theatres[0].halls[1],
        startTime: getTime(5),
        endTime: getTime(8),
        seatMap: generateSeatMap()
      },
      {
        id: "show-3",
        movie: this.movies[2],
        theatreId: "theatre-2",
        theatreName: "Starlight Multiplex",
        hall: this.theatres[1].halls[0],
        startTime: getTime(3),
        endTime: getTime(6),
        seatMap: generateSeatMap()
      }
    ];
  }

  public getMovies(): Movie[] {
    return this.movies;
  }

  public getMovieById(id: string): Movie | null {
    return this.movies.find((m) => m.id === id) || null;
  }

  public getTheatres(): Theatre[] {
    return this.theatres;
  }

  public getShowById(id: string): Show | null {
    return this.shows.find((s) => s.id === id) || null;
  }

  public getShows(): Show[] {
    return this.shows;
  }

  public saveBooking(booking: Booking): void {
    this.bookings.set(booking.id, booking);
  }

  public getBookingById(id: string): Booking | null {
    return this.bookings.get(id) || null;
  }

  public getBookingsByUserId(userId: string): Booking[] {
    const results: Booking[] = [];
    for (const b of this.bookings.values()) {
      if (b.userId === userId) {
        results.push(b);
      }
    }
    return results;
  }
}
