import { VehicleType } from "shared-types";

/**
 * FeeCalculator Interface
 * Composition over inheritance: Parking Lot delegates pricing to this interface,
 * allowing rate adjustments, promotions, or flat fees without changing core domain rules.
 */
export interface FeeCalculator {
  calculateFee(hours: number, vehicleType: VehicleType): number;
}
