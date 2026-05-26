export enum VehicleType {
  MOTORCYCLE = "MOTORCYCLE",
  CAR = "CAR",
  TRUCK = "TRUCK",
  EV = "EV"
}

export enum ParkingSlotType {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  EV = "EV"
}

export interface Vehicle {
  licensePlate: string;
  type: VehicleType;
}

export interface ParkingSlot {
  id: string;
  type: ParkingSlotType;
  isOccupied: boolean;
  floorId: string;
  currentVehicle: Vehicle | null;
}

export interface ParkingFloor {
  id: string;
  floorNumber: number;
  slots: ParkingSlot[];
}

export interface Ticket {
  id: string;
  vehicle: Vehicle;
  slotId: string;
  floorId: string;
  entryTime: string;
  exitTime?: string;
  fee?: number;
  isPaid: boolean;
}

export interface ParkingLotSummary {
  id: string;
  name: string;
  floors: {
    id: string;
    floorNumber: number;
    totalSlots: number;
    occupiedSlots: number;
    slotsByType: Record<ParkingSlotType, { total: number; occupied: number }>;
  }[];
}
