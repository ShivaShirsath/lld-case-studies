import { Vehicle as IVehicle, VehicleType } from "shared-types";

/**
 * Base abstract class for Vehicles.
 * Demonstrates standard inheritance for subtyping, but composition is preferred for behaviors.
 * For example, we avoid adding payment behaviors directly into this class, and instead
 * pass the Vehicle to a strategy-based FeeCalculator or PaymentService (composition).
 */
export abstract class Vehicle implements IVehicle {
  constructor(
    public licensePlate: string,
    public type: VehicleType
  ) {}
}

export class Motorcycle extends Vehicle {
  constructor(licensePlate: string) {
    super(licensePlate, VehicleType.MOTORCYCLE);
  }
}

export class Car extends Vehicle {
  constructor(licensePlate: string) {
    super(licensePlate, VehicleType.CAR);
  }
}

export class Truck extends Vehicle {
  constructor(licensePlate: string) {
    super(licensePlate, VehicleType.TRUCK);
  }
}

export class EV extends Vehicle {
  constructor(licensePlate: string) {
    super(licensePlate, VehicleType.EV);
  }
}

/**
 * VehicleFactory - Factory Method Pattern
 * Encapsulates the vehicle creation logic. If a new vehicle type is added,
 * we only need to modify this factory and the VehicleType enum.
 */
export class VehicleFactory {
  public static createVehicle(licensePlate: string, type: VehicleType): Vehicle {
    switch (type) {
      case VehicleType.MOTORCYCLE:
        return new Motorcycle(licensePlate);
      case VehicleType.CAR:
        return new Car(licensePlate);
      case VehicleType.TRUCK:
        return new Truck(licensePlate);
      case VehicleType.EV:
        return new EV(licensePlate);
      default:
        throw new Error(`Unsupported vehicle type: ${type}`);
    }
  }
}
