import { ParkingSlotType, Ticket, VehicleType, ParkingLotSummary, ParkingFloor } from "shared-types";
import { IParkingRepository } from "../repositories/ParkingRepository";
import { ParkingStrategy } from "../interfaces/ParkingStrategy";
import { FeeCalculator } from "../interfaces/FeeCalculator";
import { VehicleFactory } from "../models/Vehicle";
import { SlotFullException, ConflictException, NotFoundException } from "../../../exceptions";
import { generateUUID } from "shared-utils";

/**
 * ParkingService
 * Orchestrates parking business logic. Uses composition to decouple
 * strategy and fee calculation.
 */
export class ParkingService {
  constructor(
    private readonly repository: IParkingRepository,
    private readonly strategy: ParkingStrategy,
    private readonly feeCalculator: FeeCalculator
  ) {}

  public park(licensePlate: string, vehicleType: VehicleType, slotType: ParkingSlotType): Ticket {
    const formattedPlate = licensePlate.trim().toUpperCase();
    if (!formattedPlate) {
      throw new Error("License plate is required.");
    }

    // Check if already parked
    const existing = this.repository.getActiveTicketByLicensePlate(formattedPlate);
    if (existing) {
      throw new ConflictException(`Vehicle with license plate ${formattedPlate} is already parked.`);
    }

    // Find slot using the injected strategy
    const slots = this.repository.getSlots();
    const slot = this.strategy.findSlot(slots, slotType);
    if (!slot) {
      throw new SlotFullException(`No vacant slot of type ${slotType} available.`);
    }

    // Instantiate vehicle through factory
    const vehicle = VehicleFactory.createVehicle(formattedPlate, vehicleType);

    // Update slot status
    slot.isOccupied = true;
    slot.currentVehicle = vehicle;
    this.repository.updateSlot(slot);

    // Generate ticket
    const ticket: Ticket = {
      id: `ticket-${generateUUID()}`,
      vehicle,
      slotId: slot.id,
      floorId: slot.floorId,
      entryTime: new Date().toISOString(),
      isPaid: false
    };

    this.repository.saveTicket(ticket);
    return ticket;
  }

  public exit(licensePlate: string): Ticket {
    const formattedPlate = licensePlate.trim().toUpperCase();
    const ticket = this.repository.getActiveTicketByLicensePlate(formattedPlate);
    if (!ticket) {
      throw new NotFoundException(`No active parking record found for license plate: ${formattedPlate}`);
    }

    // Free the slot
    const slot = this.repository.getSlotById(ticket.slotId);
    if (slot) {
      slot.isOccupied = false;
      slot.currentVehicle = null;
      this.repository.updateSlot(slot);
    }

    ticket.exitTime = new Date().toISOString();

    // Calculate elapsed hours. For interactive UI demonstration,
    // if the duration is under 5 seconds (instant exit), we simulate
    // an active stay of 1 to 6 hours so that fee calculation is meaningful.
    const durationMs = new Date(ticket.exitTime).getTime() - new Date(ticket.entryTime).getTime();
    let hours = durationMs / (1000 * 60 * 60);
    if (durationMs < 5000) {
      hours = Math.random() * 5 + 1; // 1 to 6 simulated hours
    }

    ticket.fee = parseFloat(this.feeCalculator.calculateFee(hours, ticket.vehicle.type).toFixed(2));
    ticket.isPaid = true;

    this.repository.saveTicket(ticket);
    return ticket;
  }

  public getFloors(): ParkingFloor[] {
    return this.repository.getFloors();
  }

  public getSummary(): ParkingLotSummary {
    const floors = this.repository.getFloors();
    return {
      id: "parking-lot-1",
      name: "Central LLD Parking Terminal",
      floors: floors.map((f) => {
        const total = f.slots.length;
        const occupied = f.slots.filter((s) => s.isOccupied).length;

        const slotsByType: Record<ParkingSlotType, { total: number; occupied: number }> = {
          [ParkingSlotType.SMALL]: { total: 0, occupied: 0 },
          [ParkingSlotType.MEDIUM]: { total: 0, occupied: 0 },
          [ParkingSlotType.LARGE]: { total: 0, occupied: 0 },
          [ParkingSlotType.EV]: { total: 0, occupied: 0 }
        };

        for (const slot of f.slots) {
          slotsByType[slot.type].total++;
          if (slot.isOccupied) {
            slotsByType[slot.type].occupied++;
          }
        }

        return {
          id: f.id,
          floorNumber: f.floorNumber,
          totalSlots: total,
          occupiedSlots: occupied,
          slotsByType
        };
      })
    };
  }
}
