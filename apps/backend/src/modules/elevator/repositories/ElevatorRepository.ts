import { Elevator } from "../models/Elevator";
import { ElevatorRequest } from "shared-types";

/**
 * IElevatorRepository Interface
 * Contracts for managing elevator instances and request queues.
 */
export interface IElevatorRepository {
  getElevators(): Elevator[];
  getElevatorById(id: string): Elevator | null;
  getPendingRequests(): ElevatorRequest[];
  addPendingRequest(request: ElevatorRequest): void;
  removePendingRequest(id: string): void;
  clearPendingRequests(): void;
}

/**
 * InMemoryElevatorRepository
 * Stores elevator state and unfulfilled hallway elevator requests in-memory.
 */
export class InMemoryElevatorRepository implements IElevatorRepository {
  private readonly elevators: Elevator[] = [];
  private pendingRequests: ElevatorRequest[] = [];

  constructor(numElevators: number = 3, minFloor: number = 0, maxFloor: number = 10) {
    for (let i = 1; i <= numElevators; i++) {
      this.elevators.push(new Elevator(`elevator-${i}`, 0, undefined, undefined, minFloor, maxFloor));
    }
  }

  public getElevators(): Elevator[] {
    return this.elevators;
  }

  public getElevatorById(id: string): Elevator | null {
    return this.elevators.find((e) => e.id === id) || null;
  }

  public getPendingRequests(): ElevatorRequest[] {
    return this.pendingRequests;
  }

  public addPendingRequest(request: ElevatorRequest): void {
    // Avoid double requesting the same floor direction
    const duplicate = this.pendingRequests.some(
      (r) => r.floor === request.floor && r.direction === request.direction
    );
    if (!duplicate) {
      this.pendingRequests.push(request);
    }
  }

  public removePendingRequest(id: string): void {
    this.pendingRequests = this.pendingRequests.filter((r) => r.id !== id);
  }

  public clearPendingRequests(): void {
    this.pendingRequests = [];
  }
}
