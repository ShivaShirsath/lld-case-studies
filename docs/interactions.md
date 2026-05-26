# Object Interaction & Sequence Diagrams

This document outlines the lifecycles, service communications, and interaction sequences for key flows in all four modules.

---

## 1. Parking Lot System (Entry Flow)

This sequence diagram depicts how a vehicle enters the parking lot, is assigned a slot by a strategy, and receives a ticket.

```mermaid
sequenceDiagram
  autonumber
  actor User as Vehicle Owner
  participant Ctrl as ParkingController
  participant Service as ParkingService
  participant Repo as ParkingRepository
  participant Strat as NearestSlotStrategy
  participant Factory as VehicleFactory

  User->>Ctrl: POST /park { licensePlate, vehicleType, slotType }
  Ctrl->>Service: park(licensePlate, vehicleType, slotType)
  Service->>Repo: getActiveTicketByLicensePlate(licensePlate)
  Repo-->>Service: null (not already parked)
  Service->>Repo: getSlots()
  Repo-->>Service: slots[]
  Service->>Strat: findSlot(slots, slotType)
  Strat-->>Service: ParkingSlot (vacant)
  
  Service->>Factory: createVehicle(licensePlate, vehicleType)
  Factory-->>Service: Vehicle instance
  
  Service->>Repo: updateSlot(slot with isOccupied=true)
  Service->>Repo: saveTicket(Ticket)
  Service-->>Ctrl: Ticket DTO
  Ctrl-->>User: 201 Created (Ticket Details)
```

---

## 2. Elevator System (Corridor Request & Auto-Tick Movement)

This sequence demonstrates an external request dispatch and the background movement loop tick.

```mermaid
sequenceDiagram
  autonumber
  actor User as Hallway Passenger
  participant Ctrl as ElevatorController
  participant Service as ElevatorService
  participant Repo as ElevatorRepository
  participant Strat as LOOKScheduler
  participant Timer as Background Tick Loop

  User->>Ctrl: POST /request { floor: 4, direction: 'UP', isInternal: false }
  Ctrl->>Service: handleRequest(4, false, undefined, 'UP')
  Service->>Repo: getElevators()
  Repo-->>Service: Elevator instances
  Service->>Strat: assignRequest(elevators, Request)
  Strat-->>Service: "elevator-2" (optimal cabin ID)
  Service->>Repo: getElevatorById("elevator-2")
  Repo-->>Service: Elevator 2 instance
  Service->>Elevator2: addTargetFloor(4)
  Service->>Repo: addPendingRequest(Request)
  Service-->>Ctrl: Request instance
  Ctrl-->>User: 201 Dispatch Confirmed

  Note over Timer, Service: Runs automatically every 1.5 seconds
  Timer->>Service: tick()
  Service->>Elevator2: tick()
  Note over Elevator2: Elevator 2 moves from floor 2 towards 4
  Service->>Elevator2: getStatus()
  Note over Service: Checks if doors opened on Floor 4, satisfies requests
  Service->>Repo: removePendingRequest(reqId)
```

---

## 3. Movie Ticket Booking System (Concurrent Hold & Payment)

This sequence diagrams seat selection, temporary locks, payment processing, and final checkouts.

```mermaid
sequenceDiagram
  autonumber
  actor User as Customer A
  participant Ctrl as MovieController
  participant Service as MovieService
  participant Lock as LockManager
  participant Repo as MovieRepository

  User->>Ctrl: POST /lock { userId: "user-1", showId: "show-1", seatIds: ["C3", "C4"] }
  Ctrl->>Service: createPendingBooking("user-1", "show-1", ["C3", "C4"])
  Service->>Repo: getShowById("show-1")
  Repo-->>Service: Show instance

  loop For each Seat C3, C4
    Service->>Lock: isLocked("show-1", seatId, "user-1")
    Lock-->>Service: false (not locked by others)
  end

  loop For each Seat C3, C4
    Service->>Lock: acquireLock("show-1", seatId, "user-1", 120000)
    Lock-->>Service: true (lock acquired)
  end

  Service->>Repo: saveBooking(Booking status=PENDING, lockExpiry)
  Service-->>Ctrl: Booking DTO
  Ctrl-->>User: 210 Held (Timer Starts)

  Note over User, Ctrl: Payment process initiated
  User->>Ctrl: POST /book { bookingId, paymentMethod: "CREDIT_CARD" }
  Ctrl->>Service: confirmBooking(bookingId, "CREDIT_CARD")
  Service->>Repo: getBookingById(bookingId)
  Repo-->>Service: Booking instance
  Note over Service: Verifies lockExpiry is not past now
  Note over Service: Simulates Payment Gateway Call (succeeds)
  
  loop For each Seat C3, C4 in Booking
    Service->>Repo: Mark Show SeatStatus = BOOKED
    Service->>Lock: releaseLock("show-1", seatId)
  end

  Service->>Repo: saveBooking(Booking status=CONFIRMED, paymentId)
  Service-->>Ctrl: Confirmed Booking DTO
  Ctrl-->>User: 200 Paid (Tickets Emailed)
```

---

## 4. ATM System (Withdrawal Flow via State Pattern)

This sequence details card insertion, PIN checks, and Cash Dispenser Chain routing.

```mermaid
sequenceDiagram
  autonumber
  actor User as Debit Cardholder
  participant Ctrl as ATMController
  participant Service as ATMService
  participant Model as ATM (Context)
  participant State as PinVerifiedState (State)
  participant Chain as CashDispenser (Chain of Responsibility)

  User->>Ctrl: POST /withdraw { amount: 240 }
  Ctrl->>Service: withdraw(240)
  Service->>Model: withdraw(240)
  Model->>State: withdraw(atm, 240)
  
  Note over State: Verifies account balance >= 240
  Note over State: Verifies ATM total physical cash >= 240

  State->>Chain: dispense(240, inventoryCopy, result)
  Note over Chain: Dispenser100 takes 2x$100 (remaining: $40)
  Chain->>Dispenser50: dispense(40, inventoryCopy, result)
  Note over Dispenser50: Dispenser50 takes 0x$50 (remaining: $40)
  Dispenser50->>Dispenser20: dispense(40, inventoryCopy, result)
  Note over Dispenser20: Dispenser20 takes 2x$20 (remaining: $0)
  Dispenser20-->>Chain: Returns remainder 0 (Success)
  Chain-->>State: Returns remainder 0

  State->>Model: deductCashInventory(result)
  Note over Model: Updates cashInventory to match split
  State->>Model: getAccount(cardNum).deduct(240)
  State->>Model: addTransaction(Transaction)
  Model-->>Service: void
  Service->>Model: getStatus()
  Model-->>Service: ATMStatus DTO
  Service-->>Ctrl: ATMStatus DTO
  Ctrl-->>User: 200 Cash Dispensed (Dispenser split logs included)
```
