# Object Modeling Documentation

This document describes the domain entities, properties, and relationships for each of the four LLD modules, accompanied by UML class diagrams.

---

## 1. Parking Lot System

### UML Class Diagram
```mermaid
classDiagram
  class Vehicle {
    +string licensePlate
    +VehicleType type
  }
  class ParkingSlot {
    +string id
    +ParkingSlotType type
    +boolean isOccupied
    +string floorId
    +Vehicle currentVehicle
    +park(Vehicle vehicle)
    +vacate()
  }
  class ParkingFloor {
    +string id
    +number floorNumber
    +ParkingSlot[] slots
  }
  class ParkingLot {
    +string id
    +string name
    +ParkingFloor[] floors
  }
  class Ticket {
    +string id
    +Vehicle vehicle
    +string slotId
    +string floorId
    +string entryTime
    +string exitTime
    +number fee
    +boolean isPaid
  }

  ParkingLot "1" *-- "many" ParkingFloor : Composition
  ParkingFloor "1" *-- "many" ParkingSlot : Composition
  ParkingSlot "1" o-- "0..1" Vehicle : Aggregation
  Ticket o-- Vehicle : References
```

### Key Relationships
- **ParkingLot & ParkingFloor (Composition)**: The parking lot is composed of floors. If the parking lot is destroyed, the floors cease to exist.
- **ParkingFloor & ParkingSlot (Composition)**: Each floor manages its own slots.
- **ParkingSlot & Vehicle (Aggregation)**: A vehicle is parked in a slot. The vehicle can exist independently of the slot (when not parked).

---

## 2. Elevator System

### UML Class Diagram
```mermaid
classDiagram
  class Elevator {
    +string id
    +number currentFloor
    +ElevatorDirection direction
    +ElevatorState state
    +number minFloor
    +number maxFloor
    +number[] targetFloors
    +number doorOpenDurationRemaining
    +tick()
    +addTargetFloor(number floor)
  }
  class ElevatorController {
    +Elevator[] elevators
    +ElevatorRequest[] pendingRequests
    +ElevatorScheduler scheduler
    +handleRequest(ElevatorRequest req)
    +tick()
  }
  class ElevatorRequest {
    +string id
    +number floor
    +ElevatorDirection direction
    +boolean isInternal
    +string elevatorId
  }
  class ElevatorScheduler {
    <<interface>>
    +assignRequest(ElevatorStatus[] elevators, ElevatorRequest req) string
  }

  ElevatorController "1" *-- "many" Elevator : Composition
  ElevatorController "1" o-- "many" ElevatorRequest : Aggregation
  ElevatorController --> ElevatorScheduler : Strategy Delegation
```

### Key Relationships
- **ElevatorController & Elevator (Composition)**: The controller manages the lifetime of a fixed set of elevator cabins.
- **ElevatorController & ElevatorRequest (Aggregation)**: Requests are queued and scheduled by the controller.
- **ElevatorController & ElevatorScheduler (Strategy)**: The controller delegates dispatcher scheduling logic to a swappable `ElevatorScheduler` implementation.

---

## 3. Movie Ticket Booking System

### UML Class Diagram
```mermaid
classDiagram
  class Movie {
    +string id
    +string title
    +string description
    +number durationMinutes
    +string language
    +string genre
  }
  class Theatre {
    +string id
    +string name
    +string address
    +Hall[] halls
  }
  class Hall {
    +string id
    +string name
    +number totalSeats
  }
  class Seat {
    +string id
    +string row
    +number column
    +SeatType type
    +number basePrice
  }
  class Show {
    +string id
    +Movie movie
    +string theatreId
    +string theatreName
    +Hall hall
    +string startTime
    +string endTime
    +Record~string-SeatCell~ seatMap
  }
  class Booking {
    +string id
    +string userId
    +string showId
    +string movieTitle
    +string showTime
    +Seat[] seats
    +number totalAmount
    +BookingStatus status
    +string lockExpiry
    +string paymentId
  }

  Theatre "1" *-- "many" Hall : Composition
  Show "1" o-- "1" Movie : Association
  Show "1" o-- "1" Hall : Association
  Show "1" *-- "many" Seat : Composition (within seatMap)
  Booking "1" o-- "many" Seat : Aggregation (holds copy)
```

### Key Relationships
- **Theatre & Hall (Composition)**: A theatre owns its screen halls.
- **Show & Movie/Hall (Association)**: A show combines a movie, a screening time, and a physical hall.
- **Booking & Seat (Aggregation)**: Bookings reference the seats reserved. The seats exist independently in the Show layout.

---

## 4. ATM System

### UML Class Diagram
```mermaid
classDiagram
  class Card {
    +string cardNumber
    +string pinHash
    +string cardHolderName
    +boolean isBlocked
  }
  class Account {
    +string accountNumber
    +Card card
    +number balance
    +string pin
  }
  class ATMState {
    <<interface>>
    +insertCard(ATM atm, Card card)
    +enterPin(ATM atm, string pin)
    +withdraw(ATM atm, number amount)
    +deposit(ATM atm, number amount)
    +checkBalance(ATM atm) number
    +ejectCard(ATM atm)
  }
  class ATM {
    -ATMState currentState
    -Record~number-number~ cashInventory
    -Card activeCard
    +setCurrentState(ATMState state)
    +insertCard(Card card)
    +enterPin(string pin)
    +withdraw(number amount)
    +deposit(number amount)
    +checkBalance() number
    +ejectCard()
  }
  class CashDispenser {
    +number denomination
    -CashDispenser nextDispenser
    +setNext(CashDispenser next)
    +dispense(number amount, Record inventory, Record result) number
  }

  ATM "1" o-- "1" Card : Session Aggregation
  ATM "1" o-- "1" ATMState : State Pattern Delegator
  ATM "1" *-- "1" CashDispenser : Composition (Dispenser Chain)
  CashDispenser o-- CashDispenser : Unidirectional Chain
```

### Key Relationships
- **ATM & ATMState (State Pattern)**: The ATM delegates behavior to a state interface. The ATM class behaves like a Context, and active classes (Idle, CardInserted, PinVerified, OutOfCash) execute transitions.
- **ATM & CashDispenser (Chain of Responsibility)**: The ATM references the head node of a dispenser chain. The head node delegates remaining balances to down-stream dispensers.
