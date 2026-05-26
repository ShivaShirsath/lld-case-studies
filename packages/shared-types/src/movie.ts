export enum SeatType {
  NORMAL = "NORMAL",
  PREMIUM = "PREMIUM",
  GOLD = "GOLD"
}

export enum SeatStatus {
  AVAILABLE = "AVAILABLE",
  LOCKED = "LOCKED",
  BOOKED = "BOOKED"
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  language: string;
  genre: string;
}

export interface Theatre {
  id: string;
  name: string;
  address: string;
  halls: Hall[];
}

export interface Hall {
  id: string;
  name: string;
  totalSeats: number;
}

export interface Seat {
  id: string;
  row: string;
  column: number;
  type: SeatType;
  basePrice: number;
}

export interface Show {
  id: string;
  movie: Movie;
  theatreId: string;
  theatreName: string;
  hall: Hall;
  startTime: string;
  endTime: string;
  seatMap: Record<string, { seat: Seat; status: SeatStatus; lockedBy?: string; lockExpiry?: string }>;
}

export interface Booking {
  id: string;
  userId: string;
  showId: string;
  movieTitle: string;
  showTime: string;
  seats: Seat[];
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  paymentId?: string;
  lockExpiry?: string;
}

export interface PaymentDetails {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  status: "SUCCESS" | "FAILED";
  timestamp: string;
}
