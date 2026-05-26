# Core Algorithms & Pseudocode

This document outlines the core algorithms powering each of the four LLD modules, formatted for readability in technical interviews.

---

## 1. Parking Lot System (Slot Allocation Strategy)

**Goal**: Find the first available parking slot matching the requested slot type, sorted by floor number and slot index (Nearest Slot Strategy).

```txt
ALGORITHM AllocateParkingSlot(slots: List<ParkingSlot>, requestedType: ParkingSlotType)
    INPUT:
        slots: Sorted list of all slots (sorted by floor ASC, index ASC)
        requestedType: Small, Medium, Large, or EV
    OUTPUT:
        The nearest vacant slot of the matching type, or NULL if full

    BEGIN
        FOR EACH slot IN slots DO
            IF slot.isOccupied IS FALSE AND slot.type IS requestedType THEN
                RETURN slot
            END IF
        END FOR
        
        RETURN NULL
    END
```

---

## 2. Elevator System (LOOK Scheduling Cost Heuristic)

**Goal**: Evaluate all elevator cabins to find the one with the minimum cost to dispatch.

```txt
ALGORITHM CalculateLOOKCost(elevator: ElevatorStatus, request: ElevatorRequest)
    INPUT:
        elevator: Contains currentFloor, direction (UP/DOWN/IDLE), targetFloors queue
        request: Contains floor, direction (UP/DOWN/IDLE)
    OUTPUT:
        A numeric cost (lower is better) representing simulated wait time

    BEGIN
        distance = ABS(elevator.currentFloor - request.floor)

        // Case 1: Elevator is stationary with no targets
        IF elevator.direction IS IDLE OR elevator.targetFloors IS EMPTY THEN
            RETURN distance
        END IF

        // Case 2: Elevator is heading in the same direction and has not passed the floor
        isUpAndBelow = (elevator.direction IS UP AND elevator.currentFloor <= request.floor)
        isDownAndAbove = (elevator.direction IS DOWN AND elevator.currentFloor >= request.floor)
        isAligned = (request.direction IS IDLE OR request.direction IS elevator.direction)

        IF (isUpAndBelow OR isDownAndAbove) AND isAligned THEN
            RETURN distance // Pickup along the way
        END IF

        // Case 3: Aligned but already passed, or opposite direction.
        // Cost = distance to furthest target in current direction + distance from turnaround to requested floor.
        IF elevator.direction IS UP THEN
            turnaroundFloor = MAX(elevator.targetFloors.max, elevator.currentFloor)
            RETURN (turnaroundFloor - elevator.currentFloor) + ABS(turnaroundFloor - request.floor)
        ELSE
            turnaroundFloor = MIN(elevator.targetFloors.min, elevator.currentFloor)
            RETURN (elevator.currentFloor - turnaroundFloor) + ABS(turnaroundFloor - request.floor)
        END IF
    END
```

---

## 3. Movie Ticket Booking System (Seat Locking & Concurrency)

**Goal**: Secure temporary seat holds for 2 minutes before payment. Uses a lock manager to guarantee concurrency checks.

```txt
ALGORITHM AcquireSeatLocks(userId: String, showId: String, seatIds: List<String>, lockDurationMs: Integer)
    INPUT:
        userId: Unique ID of the customer requesting seats
        showId: Cinema showtime ID
        seatIds: List of seats (e.g. ["C3", "C4"])
        lockDurationMs: Expiry timer duration (120,000 ms)
    OUTPUT:
        True if all seats successfully locked, throws error if any fails

    BEGIN
        // Step 1: Pre-verify all seats are vacant and unlocked
        FOR EACH seatId IN seatIds DO
            IF SeatIsBooked(showId, seatId) THEN
                THROW SeatAlreadyBookedException
            END IF
            
            IF SeatIsLockedByOther(showId, seatId, userId) THEN
                THROW SeatLockedException
            END IF
        END FOR

        // Step 2: Acquire locks transactionally (all-or-nothing)
        acquiredList = EmptyList()
        
        FOR EACH seatId IN seatIds DO
            success = LockRegistry.TryAcquire(showId, seatId, userId, lockDurationMs)
            IF success IS TRUE THEN
                ADD seatId TO acquiredList
            ELSE
                // Rollback acquired locks on concurrency clash
                FOR EACH acquiredId IN acquiredList DO
                    LockRegistry.Release(showId, acquiredId)
                END FOR
                THROW SeatLockedException("Clash during concurrent selection.")
            END IF
        END FOR

        RETURN TRUE
    END
```

---

## 4. ATM System (Chain of Responsibility Cash Dispenser)

**Goal**: Split a withdrawal amount into bill counts of $100, $50, $20, $10.

```txt
ALGORITHM DispenseCash(amount: Integer, inventory: Map[Denomination, Count], result: Map[Denomination, Count])
    INPUT:
        amount: Requested cash value (e.g. 240)
        inventory: Active count of bills inside the vault
        result: Empty map to collect dispensed bill counts
    OUTPUT:
        The remainder amount (0 = successful exact split, > 0 = dispenser failure)

    // Run recursively down the chain
    FUNCTION ProcessNode(node: DispenserNode, remainingAmount: Integer)
        denom = node.denomination
        available = inventory.GetCount(denom)
        needed = Floor(remainingAmount / denom)
        billsToDispense = MIN(available, needed)

        IF billsToDispense > 0 THEN
            result.SetCount(denom, billsToDispense)
            remainingAmount = remainingAmount - (billsToDispense * denom)
        END IF

        // If remainder remains and there is a next dispenser node, pass down
        IF remainingAmount > 0 AND node.hasNext IS TRUE THEN
            RETURN ProcessNode(node.next, remainingAmount)
        END IF

        RETURN remainingAmount
    END

    BEGIN
        // Start from head dispenser ($100 node)
        headNode = DispenserChain.GetHead()
        remainder = ProcessNode(headNode, amount)
        
        RETURN remainder
    END
```
