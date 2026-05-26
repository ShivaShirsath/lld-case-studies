import { VehicleType } from "shared-types";
import { FeeCalculator } from "../interfaces/FeeCalculator";

/**
 * FeeCalculatorImpl
 * Provides standard hourly-rate calculations depending on vehicle types.
 */
export class FeeCalculatorImpl implements FeeCalculator {
  private readonly rates: Record<VehicleType, number> = {
    [VehicleType.MOTORCYCLE]: 1.5, // $1.50 per hour
    [VehicleType.CAR]: 3.0,        // $3.00 per hour
    [VehicleType.EV]: 4.0,         // $4.00 per hour (includes charger usage fee)
    [VehicleType.TRUCK]: 5.0       // $5.00 per hour
  };

  public calculateFee(hours: number, vehicleType: VehicleType): number {
    const rate = this.rates[vehicleType] || 3.0;
    const billableHours = Math.max(1, Math.ceil(hours)); // Minimum 1 hour
    return billableHours * rate;
  }
}
