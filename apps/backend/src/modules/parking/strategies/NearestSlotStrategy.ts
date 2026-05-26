import { ParkingSlot, ParkingSlotType } from "shared-types";
import { ParkingStrategy } from "../interfaces/ParkingStrategy";

/**
 * NearestSlotStrategy
 * Implements ParkingStrategy. Allocates the first free slot of the matching type.
 * Because slots are stored sorted by floor number and slot ID, this naturally
 * chooses the "nearest" or lowest floor/index slot.
 */
export class NearestSlotStrategy implements ParkingStrategy {
  public findSlot(slots: ParkingSlot[], type: ParkingSlotType): ParkingSlot | null {
    const matched = slots.find((slot) => !slot.isOccupied && slot.type === type);
    return matched || null;
  }
}
