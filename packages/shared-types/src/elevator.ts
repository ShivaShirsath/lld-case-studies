export enum ElevatorDirection {
  UP = "UP",
  DOWN = "DOWN",
  IDLE = "IDLE"
}

export enum ElevatorState {
  IDLE = "IDLE",
  MOVING = "MOVING",
  DOOR_OPEN = "DOOR_OPEN",
  DOOR_CLOSING = "DOOR_CLOSING",
  STOPPED = "STOPPED"
}

export interface ElevatorRequest {
  id: string;
  floor: number;
  direction?: ElevatorDirection;
  isInternal: boolean;
  elevatorId?: string;
  timestamp: number;
}

export interface ElevatorStatus {
  id: string;
  currentFloor: number;
  direction: ElevatorDirection;
  state: ElevatorState;
  minFloor: number;
  maxFloor: number;
  targetFloors: number[];
  doorOpenDurationRemaining: number;
}

export interface ElevatorSystemStatus {
  elevators: ElevatorStatus[];
  pendingExternalRequests: ElevatorRequest[];
  floorsCount: number;
}
