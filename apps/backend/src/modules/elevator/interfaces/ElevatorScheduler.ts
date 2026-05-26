import { ElevatorStatus, ElevatorRequest } from "shared-types";

/**
 * ElevatorScheduler Interface
 * Strategy Pattern to choose which elevator serves which pickup requests.
 */
export interface ElevatorScheduler {
  assignRequest(elevators: ElevatorStatus[], request: ElevatorRequest): string;
}
