import { ParkingSlot, ParkingSlotType } from "shared-types";

/**
 * ParkingStrategy Interface
 * Strategy Pattern to enable swappable parking slot allocation algorithms.
 */
export interface ParkingStrategy {
  findSlot(slots: ParkingSlot[], type: ParkingSlotType): ParkingSlot | null;
}
