import { Request, Response, NextFunction, Router } from "express";
import { ParkingService } from "../services/ParkingService";
import { InMemoryParkingRepository } from "../repositories/ParkingRepository";
import { NearestSlotStrategy } from "../strategies/NearestSlotStrategy";
import { FeeCalculatorImpl } from "../services/FeeCalculatorImpl";
import { VehicleType, ParkingSlotType } from "shared-types";

/**
 * ParkingController
 * Coordinates incoming REST requests for the Parking Lot simulation.
 */
export class ParkingController {
  private readonly service: ParkingService;
  public readonly router: Router;

  constructor() {
    const repository = new InMemoryParkingRepository();
    const strategy = new NearestSlotStrategy();
    const feeCalculator = new FeeCalculatorImpl();
    this.service = new ParkingService(repository, strategy, feeCalculator);
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post("/park", this.park.bind(this));
    this.router.post("/exit", this.exit.bind(this));
    this.router.get("/summary", this.getSummary.bind(this));
    this.router.get("/floors", this.getFloors.bind(this));
  }

  public park(req: Request, res: Response, next: NextFunction): void {
    try {
      const { licensePlate, vehicleType, slotType } = req.body;
      const ticket = this.service.park(
        licensePlate,
        vehicleType as VehicleType,
        slotType as ParkingSlotType
      );
      res.status(201).json(ticket);
    } catch (err) {
      next(err);
    }
  }

  public exit(req: Request, res: Response, next: NextFunction): void {
    try {
      const { licensePlate } = req.body;
      const ticket = this.service.exit(licensePlate);
      res.status(200).json(ticket);
    } catch (err) {
      next(err);
    }
  }

  public getSummary(req: Request, res: Response, next: NextFunction): void {
    try {
      const summary = this.service.getSummary();
      res.status(200).json(summary);
    } catch (err) {
      next(err);
    }
  }

  public getFloors(req: Request, res: Response, next: NextFunction): void {
    try {
      const floors = this.service.getFloors();
      res.status(200).json(floors);
    } catch (err) {
      next(err);
    }
  }
}
