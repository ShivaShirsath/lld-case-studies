# Design Decisions & LLD Patterns

This document details the engineering rationales, patterns, SOLID violations resolved, and design trade-offs chosen in the monorepo codebase.

---

## 1. Practical Application of SOLID

### Interface Segregation & Dependency Inversion
We use TypeScript interfaces extensively (`ParkingStrategy`, `FeeCalculator`, `ElevatorScheduler`, `ATMState`, `IParkingRepository`, `IMovieRepository`). 
- **Decoupled Strategy**: In the Parking Lot module, `ParkingService` references the `ParkingStrategy` interface, not the concrete `NearestSlotStrategy`. If we want to replace nearest slot allocation with a `CompactFirstStrategy`, we change zero lines of code inside `ParkingService`. We simply instantiate the new strategy and inject it.
- **Decoupled Storage**: In the Movie Ticket Booking module, `MovieService` depends on `IMovieRepository`. This hides whether shows and seat layouts are in memory, in a MySQL database, or in Redis. Testing the service layer becomes trivial since we can pass a mock repository.

---

## 2. Composition Over Inheritance

We strictly prefer composition to avoid brittle, deep inheritance trees:

```typescript
// PREFERRED COMPOSITION
class ParkingSlot {
  constructor(private charger: EVCharger) {} // Injected behavior
}

// AVOID INHERITANCE TREE
class EVSlot extends ParkingSlot { ... }
```

### Why Composition?
1. **Prevents Combinatorial Explosions**: If we used inheritance, adding a slot with an EV Charger + a Vacuum cleaner would require a `CleanEVSlot` subclass. With composition, we inject an array of `Charger` and `Cleaner` behaviors.
2. **Dynamic Behavior Changes**: Inheritance binds properties at compile time. Composition allows behaviors (e.g., adding an EV charger to a standard slot) to be swapped at runtime by mutating slot object composition.
3. **Simplified Testing**: Composed behaviors can be mocked and tested individually.

---

## 3. Custom Exception Mapping

Standard practice of using raw strings for failures (e.g. `throw new Error("slot full")`) makes unified HTTP API responses hard to maintain.
- **Custom Hierarchy**: We established a structured hierarchy extending a custom base `DomainException` which carries an HTTP status code (`statusCode`).
- **Global Catch-All**: In `apps/backend/src/index.ts`, a single Express error middleware catches all exceptions.
  - If it is a `DomainException` (e.g. `SlotFullException`), it formats a clean JSON payload and sets the HTTP status to `409 Conflict`.
  - If it is an unhandled runtime error (e.g. null pointer), it defaults to `500 Internal Server Error`, hiding details from the client.

---

## 4. Architectural Trade-offs

| Choice Made | Advantages | Disadvantages / Mitigations |
| :--- | :--- | :--- |
| **In-Memory Repositories** | - Instant setup, runs without db installs.<br>- Blazing fast simulations. | - Data resets upon server restart.<br>- *Mitigation*: Core logic is abstracted by `IRepository` interfaces, making Database connector integrations easy to swap in. |
| **Timer-Based Elevator Simulator** | - Non-blocking auto-updates feel real-time.<br>- Simpler than socket configurations. | - Short-polling creates overhead.<br>- *Mitigation*: Ticks and polls are throttled to 1-1.5s intervals, which is negligible for local demo setups. |
| **Local Lock Registry (Movie)** | - Direct memory maps block double bookings.<br>- Simple to implement. | - Single node constraint. Cannot scale horizontally across servers.<br>- *Mitigation*: Swap `LockManager` internals to use Redis `SETNX` commands for distributed locking. |
| **State Pattern ATM Machine** | - Keypad/action validations are handled state-by-state.<br>- Prevents conditional statements. | - Increases file counts.<br>- *Mitigation*: Co-located concrete states in `ConcreteStates.ts` to keep structures highly discoverable. |

---

## 5. Extensibility & Scaling

### Adding a new slot type to the Parking Lot:
1. Add the enum to `packages/shared-types/src/parking.ts`.
2. Add rates to `apps/backend/src/modules/parking/services/FeeCalculatorImpl.ts`.
3. The rest of the slot allocation and grid UI handles rendering automatically because they iterate dynamic enums.

### Adding a new Transaction type to the ATM:
1. Implement the method on `ATMState` interface.
2. Add behavior to `PinVerifiedState` (others throw invalid state exceptions).
3. Call the method via the `ATM` facade.
