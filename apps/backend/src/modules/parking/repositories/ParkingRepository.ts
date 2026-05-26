import { ParkingFloor, ParkingSlot, Ticket } from "shared-types";

/**
 * IParkingRepository Interface
 * Decouples the storage mechanism from business logic (Dependency Inversion).
 */
export interface IParkingRepository {
  getFloors(): ParkingFloor[];
  getSlots(): ParkingSlot[];
  getSlotById(id: string): ParkingSlot | null;
  getTicketById(id: string): Ticket | null;
  saveTicket(ticket: Ticket): void;
  updateSlot(slot: ParkingSlot): void;
  getActiveTicketByLicensePlate(licensePlate: string): Ticket | null;
}

/**
 * InMemoryParkingRepository
 * Standard mock database implementing the repository pattern.
 * Initializes with 3 floors, each having various slot types (Small, Medium, Large, EV).
 */
export class InMemoryParkingRepository implements IParkingRepository {
  private floors: ParkingFloor[] = [];
  private slots: ParkingSlot[] = [];
  private tickets: Map<string, Ticket> = new Map();

  constructor() {
    // Generate pre-populated floors and slots
    const distribution = [
      { type: "SMALL", count: 3 },
      { type: "MEDIUM", count: 6 },
      { type: "LARGE", count: 2 },
      { type: "EV", count: 2 }
    ];

    for (let f = 0; f < 3; f++) {
      const floorId = `floor-${f}`;
      const floorSlots: ParkingSlot[] = [];
      let index = 1;

      for (const dist of distribution) {
        for (let i = 0; i < dist.count; i++) {
          const slotId = `${floorId}-slot-${dist.type.toLowerCase()}-${index++}`;
          const slot: ParkingSlot = {
            id: slotId,
            type: dist.type as any,
            isOccupied: false,
            floorId,
            currentVehicle: null
          };
          floorSlots.push(slot);
          this.slots.push(slot);
        }
      }

      this.floors.push({
        id: floorId,
        floorNumber: f,
        slots: floorSlots
      });
    }
  }

  public getFloors(): ParkingFloor[] {
    return this.floors;
  }

  public getSlots(): ParkingSlot[] {
    return this.slots;
  }

  public getSlotById(id: string): ParkingSlot | null {
    return this.slots.find((slot) => slot.id === id) || null;
  }

  public getTicketById(id: string): Ticket | null {
    return this.tickets.get(id) || null;
  }

  public saveTicket(ticket: Ticket): void {
    this.tickets.set(ticket.id, ticket);
  }

  public updateSlot(slot: ParkingSlot): void {
    const idx = this.slots.findIndex((s) => s.id === slot.id);
    if (idx !== -1) {
      this.slots[idx] = slot;
    }

    const floor = this.floors.find((f) => f.id === slot.floorId);
    if (floor) {
      const sIdx = floor.slots.findIndex((s) => s.id === slot.id);
      if (sIdx !== -1) {
        floor.slots[sIdx] = slot;
      }
    }
  }

  public getActiveTicketByLicensePlate(licensePlate: string): Ticket | null {
    const normalized = licensePlate.trim().toUpperCase();
    for (const ticket of this.tickets.values()) {
      if (ticket.vehicle.licensePlate.toUpperCase() === normalized && !ticket.isPaid) {
        return ticket;
      }
    }
    return null;
  }
}
