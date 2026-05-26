import { ParkingSlot as IParkingSlot, ParkingSlotType, Vehicle } from "shared-types";

/**
 * ParkingSlot Model
 * Represents a single parking space. Using composition, it holds a reference
 * to the currently parked Vehicle instead of extending Vehicle.
 */
export class ParkingSlot implements IParkingSlot {
  constructor(
    public id: string,
    public type: ParkingSlotType,
    public floorId: string,
    public isOccupied: boolean = false,
    public currentVehicle: Vehicle | null = null
  ) {}

  public park(vehicle: Vehicle): void {
    this.isOccupied = true;
    this.currentVehicle = vehicle;
  }

  public vacate(): void {
    this.isOccupied = false;
    this.currentVehicle = null;
  }
}
