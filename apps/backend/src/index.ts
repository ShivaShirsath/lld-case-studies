import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { ParkingController } from "./modules/parking/controllers/ParkingController";
import { ElevatorController } from "./modules/elevator/controllers/ElevatorController";
import { MovieController } from "./modules/movie/controllers/MovieController";
import { ATMController } from "./modules/atm/controllers/ATMController";
import { DomainException } from "./exceptions";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Controllers (Layered Architecture entrypoints)
const parkingController = new ParkingController();
const elevatorController = new ElevatorController();
const movieController = new MovieController();
const atmController = new ATMController();

// Mount Routes
app.use("/api/parking", parkingController.router);
app.use("/api/elevator", elevatorController.router);
app.use("/api/movie", movieController.router);
app.use("/api/atm", atmController.router);

// Health Check API
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Setup Elevator Simulation Auto-Ticking in Background
// Ticks once every 1.5 seconds to simulate cabin transitions
const tickInterval = setInterval(() => {
  try {
    elevatorController.service.tick();
  } catch (err) {
    console.error("Error in elevator simulator auto-tick loop:", err);
  }
}, 1500);

// Global Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DomainException) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message
    });
    return;
  }

  // Fallback for standard system errors
  console.error("Unhandled Exception caught by Express middleware:", err);
  res.status(500).json({
    error: "InternalServerError",
    message: err.message || "An unexpected error occurred."
  });
});

const server = app.listen(PORT, () => {
  console.log(`[LLD Backend Server] running on http://localhost:${PORT}`);
});

// Graceful cleanup
process.on("SIGTERM", () => {
  clearInterval(tickInterval);
  server.close(() => {
    console.log("Server terminated gracefully.");
  });
});
