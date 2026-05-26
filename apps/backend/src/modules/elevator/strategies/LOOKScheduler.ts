import { ElevatorStatus, ElevatorRequest, ElevatorDirection } from "shared-types";
import { ElevatorScheduler } from "../interfaces/ElevatorScheduler";

/**
 * LOOKScheduler
 * Implements ElevatorScheduler.
 * Assigns calls using the classical LOOK scheduling cost heuristic.
 * Minimizes wait times by identifying elevator cabins already headed towards
 * the requested floor in the requested direction.
 */
export class LOOKScheduler implements ElevatorScheduler {
  public assignRequest(elevators: ElevatorStatus[], request: ElevatorRequest): string {
    if (elevators.length === 0) {
      throw new Error("No elevators configured in system.");
    }

    let optimalId = elevators[0].id;
    let minCost = Infinity;

    for (const elevator of elevators) {
      const cost = this.calculateCost(elevator, request);
      if (cost < minCost) {
        minCost = cost;
        optimalId = elevator.id;
      }
    }

    return optimalId;
  }

  private calculateCost(elevator: ElevatorStatus, request: ElevatorRequest): number {
    const { currentFloor, direction, targetFloors } = elevator;
    const reqFloor = request.floor;
    const reqDir = request.direction || ElevatorDirection.IDLE;

    const distance = Math.abs(currentFloor - reqFloor);

    // Case 1: Elevator is IDLE
    if (direction === ElevatorDirection.IDLE || targetFloors.length === 0) {
      return distance;
    }

    // Case 2: Elevator is heading in the requested direction and hasn't passed the floor
    const isUpAndBelow = direction === ElevatorDirection.UP && currentFloor <= reqFloor;
    const isDownAndAbove = direction === ElevatorDirection.DOWN && currentFloor >= reqFloor;
    const alignedDir = reqDir === ElevatorDirection.IDLE || reqDir === direction;

    if ((isUpAndBelow || isDownAndAbove) && alignedDir) {
      return distance; // Pick up along the way
    }

    // Case 3: Aligned, but already passed, or opposite direction.
    // Cost = distance to finish current queue + distance from end of queue to the floor.
    const maxTarget = Math.max(...targetFloors);
    const minTarget = Math.min(...targetFloors);

    if (direction === ElevatorDirection.UP) {
      const turnaround = Math.max(maxTarget, currentFloor);
      return (turnaround - currentFloor) + Math.abs(turnaround - reqFloor);
    } else {
      const turnaround = Math.min(minTarget, currentFloor);
      return (currentFloor - turnaround) + Math.abs(turnaround - reqFloor);
    }
  }
}
