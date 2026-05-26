import { ElevatorStatus, ElevatorState, ElevatorDirection } from "shared-types";

/**
 * Elevator Entity Class
 * Encapsulates the state machine and core movement/door logic of an individual elevator cabin.
 */
export class Elevator implements ElevatorStatus {
  public targetFloors: number[] = [];
  public doorOpenDurationRemaining: number = 0;

  constructor(
    public id: string,
    public currentFloor: number = 0,
    public direction: ElevatorDirection = ElevatorDirection.IDLE,
    public state: ElevatorState = ElevatorState.IDLE,
    public minFloor: number = 0,
    public maxFloor: number = 10
  ) {}

  public getStatus(): ElevatorStatus {
    return {
      id: this.id,
      currentFloor: this.currentFloor,
      direction: this.direction,
      state: this.state,
      minFloor: this.minFloor,
      maxFloor: this.maxFloor,
      targetFloors: [...this.targetFloors].sort((a, b) => a - b),
      doorOpenDurationRemaining: this.doorOpenDurationRemaining
    };
  }

  public addTargetFloor(floor: number): void {
    if (floor < this.minFloor || floor > this.maxFloor) {
      return;
    }
    if (!this.targetFloors.includes(floor)) {
      this.targetFloors.push(floor);
    }

    if (this.state === ElevatorState.IDLE) {
      this.state = ElevatorState.STOPPED;
      this.updateDirectionAndState();
    }
  }

  /**
   * tick()
   * Increments the elevator's timeline by one simulation tick.
   * Updates coordinates, direction, open door timeouts, and floor vacancy.
   */
  public tick(): void {
    if (this.state === ElevatorState.DOOR_OPEN) {
      if (this.doorOpenDurationRemaining > 0) {
        this.doorOpenDurationRemaining--;
        return;
      }
      this.state = ElevatorState.DOOR_CLOSING;
      return;
    }

    if (this.state === ElevatorState.DOOR_CLOSING) {
      this.state = ElevatorState.STOPPED;
      this.updateDirectionAndState();
      return;
    }

    if (this.state === ElevatorState.MOVING) {
      const nextStop = this.getNextStop();
      if (nextStop !== null) {
        if (this.currentFloor < nextStop) {
          this.currentFloor++;
        } else if (this.currentFloor > nextStop) {
          this.currentFloor--;
        }

        // Arrived at next target floor?
        if (this.currentFloor === nextStop) {
          this.state = ElevatorState.DOOR_OPEN;
          this.doorOpenDurationRemaining = 2; // Stays open for 2 ticks
          this.targetFloors = this.targetFloors.filter((f) => f !== nextStop);
          this.updateDirectionAndState();
        }
      } else {
        this.state = ElevatorState.IDLE;
        this.direction = ElevatorDirection.IDLE;
      }
      return;
    }

    if (this.state === ElevatorState.STOPPED) {
      this.updateDirectionAndState();
      return;
    }
  }

  private getNextStop(): number | null {
    if (this.targetFloors.length === 0) return null;

    // LOOK Heuristic Routing:
    // If moving UP, prioritize next highest floor stop. If none, turnaround.
    if (this.direction === ElevatorDirection.UP) {
      const stopsAhead = this.targetFloors.filter((f) => f >= this.currentFloor).sort((a, b) => a - b);
      if (stopsAhead.length > 0) return stopsAhead[0];
      const stopsBehind = this.targetFloors.filter((f) => f < this.currentFloor).sort((a, b) => b - a);
      return stopsBehind.length > 0 ? stopsBehind[0] : null;
    } else if (this.direction === ElevatorDirection.DOWN) {
      const stopsAhead = this.targetFloors.filter((f) => f <= this.currentFloor).sort((a, b) => b - a);
      if (stopsAhead.length > 0) return stopsAhead[0];
      const stopsBehind = this.targetFloors.filter((f) => f > this.currentFloor).sort((a, b) => a - b);
      return stopsBehind.length > 0 ? stopsBehind[0] : null;
    } else {
      // Pick closest overall floor
      let closest = this.targetFloors[0];
      let minDistance = Math.abs(this.currentFloor - closest);
      for (const f of this.targetFloors) {
        const d = Math.abs(this.currentFloor - f);
        if (d < minDistance) {
          minDistance = d;
          closest = f;
        }
      }
      return closest;
    }
  }

  private updateDirectionAndState(): void {
    if (this.targetFloors.length === 0) {
      if (this.state !== ElevatorState.DOOR_OPEN && this.state !== ElevatorState.DOOR_CLOSING) {
        this.state = ElevatorState.IDLE;
        this.direction = ElevatorDirection.IDLE;
      }
      return;
    }

    const nextStop = this.getNextStop();
    if (nextStop === null) {
      if (this.state !== ElevatorState.DOOR_OPEN && this.state !== ElevatorState.DOOR_CLOSING) {
        this.state = ElevatorState.IDLE;
        this.direction = ElevatorDirection.IDLE;
      }
      return;
    }

    if (nextStop > this.currentFloor) {
      this.direction = ElevatorDirection.UP;
      if (this.state !== ElevatorState.DOOR_OPEN && this.state !== ElevatorState.DOOR_CLOSING) {
        this.state = ElevatorState.MOVING;
      }
    } else if (nextStop < this.currentFloor) {
      this.direction = ElevatorDirection.DOWN;
      if (this.state !== ElevatorState.DOOR_OPEN && this.state !== ElevatorState.DOOR_CLOSING) {
        this.state = ElevatorState.MOVING;
      }
    } else {
      // Request floor is current floor
      if (this.state !== ElevatorState.DOOR_OPEN && this.state !== ElevatorState.DOOR_CLOSING) {
        this.state = ElevatorState.DOOR_OPEN;
        this.doorOpenDurationRemaining = 2;
        this.targetFloors = this.targetFloors.filter((f) => f !== nextStop);
      }
    }
  }
}
