import { Request, Response, NextFunction, Router } from "express";
import { ElevatorService } from "../services/ElevatorService";
import { InMemoryElevatorRepository } from "../repositories/ElevatorRepository";
import { LOOKScheduler } from "../strategies/LOOKScheduler";
import { ElevatorDirection } from "shared-types";

/**
 * ElevatorController
 * Routes user elevator requests and exposes simulation ticks.
 */
export class ElevatorController {
  public readonly service: ElevatorService;
  public readonly router: Router;

  constructor() {
    const repository = new InMemoryElevatorRepository(3, 0, 10); // 3 cabins, floors 0-10
    const scheduler = new LOOKScheduler();
    this.service = new ElevatorService(repository, scheduler);
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get("/status", this.getStatus.bind(this));
    this.router.post("/request", this.requestElevator.bind(this));
    this.router.post("/tick", this.manualTick.bind(this));
  }

  public getStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      const status = this.service.getStatus();
      res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  }

  public requestElevator(req: Request, res: Response, next: NextFunction): void {
    try {
      const { floor, isInternal, elevatorId, direction } = req.body;
      if (floor === undefined || isInternal === undefined) {
        res.status(400).json({ error: "Missing required parameters: floor, isInternal" });
        return;
      }

      const request = this.service.handleRequest(
        parseInt(floor, 10),
        Boolean(isInternal),
        elevatorId,
        direction as ElevatorDirection
      );
      res.status(201).json(request);
    } catch (err) {
      next(err);
    }
  }

  public manualTick(req: Request, res: Response, next: NextFunction): void {
    try {
      this.service.tick();
      res.status(200).json({
        message: "Simulation tick triggered.",
        status: this.service.getStatus()
      });
    } catch (err) {
      next(err);
    }
  }
}
