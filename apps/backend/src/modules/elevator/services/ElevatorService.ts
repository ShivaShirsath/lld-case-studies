import { ElevatorSystemStatus, ElevatorRequest, ElevatorDirection, ElevatorState } from "shared-types";
import { IElevatorRepository } from "../repositories/ElevatorRepository";
import { ElevatorScheduler } from "../interfaces/ElevatorScheduler";
import { generateUUID } from "shared-utils";

/**
 * ElevatorService
 * Manages operations across all elevator cabins. Ticks state updates,
 * delegates assignment to ElevatorScheduler, and satisfies pending requests.
 */
export class ElevatorService {
  constructor(
    private readonly repository: IElevatorRepository,
    private readonly scheduler: ElevatorScheduler
  ) {}

  public handleRequest(
    floor: number,
    isInternal: boolean,
    elevatorId?: string,
    direction?: ElevatorDirection
  ): ElevatorRequest {
    const request: ElevatorRequest = {
      id: `req-${generateUUID()}`,
      floor,
      isInternal,
      elevatorId,
      direction,
      timestamp: Date.now()
    };

    if (isInternal) {
      if (!elevatorId) {
        throw new Error("Internal requests must specify target elevator ID.");
      }
      const elevator = this.repository.getElevatorById(elevatorId);
      if (!elevator) {
        throw new Error(`Elevator with ID ${elevatorId} not found.`);
      }
      elevator.addTargetFloor(floor);
    } else {
      // External pickup call.
      // 1. Evaluate and assign request to the best elevator using strategy
      const currentElevators = this.repository.getElevators().map((e) => e.getStatus());
      const optimalElevatorId = this.scheduler.assignRequest(currentElevators, request);

      const elevator = this.repository.getElevatorById(optimalElevatorId);
      if (elevator) {
        request.elevatorId = optimalElevatorId;
        elevator.addTargetFloor(floor);
      }

      this.repository.addPendingRequest(request);
    }

    return request;
  }

  /**
   * tick()
   * Runs the simulation step. Advances all cabins and deletes
   * pending external hallway requests if an elevator door opens on their floor.
   */
  public tick(): void {
    const elevators = this.repository.getElevators();
    const pending = this.repository.getPendingRequests();

    for (const elevator of elevators) {
      elevator.tick();

      // Satisfy request if cabin opens its doors at matching floor
      if (elevator.state === ElevatorState.DOOR_OPEN) {
        const floor = elevator.currentFloor;
        const dir = elevator.direction;

        const satisfied = pending.filter((req) => {
          if (req.floor !== floor) return false;
          if (!req.direction || req.direction === ElevatorDirection.IDLE) return true;
          if (dir === ElevatorDirection.IDLE) return true;
          return req.direction === dir;
        });

        for (const req of satisfied) {
          this.repository.removePendingRequest(req.id);
        }
      }
    }
  }

  public getStatus(): ElevatorSystemStatus {
    return {
      elevators: this.repository.getElevators().map((e) => e.getStatus()),
      pendingExternalRequests: this.repository.getPendingRequests(),
      floorsCount: 11 // Floors 0 to 10
    };
  }
}
