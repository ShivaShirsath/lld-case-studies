# LLD Case Studies: Production-Style Monorepo

Welcome to the **Low Level Design (LLD) Case Studies** project. This monorepo is a production-style, interview-ready demonstration of practical LLD concepts using **TypeScript**, **React**, and **Node.js**.

The project contains four completely independent, interactive LLD simulations accessible from a unified dashboard:
1. **Parking Lot System** (Strategy Pattern, Factory Pattern)
2. **Elevator System** (State Pattern, SCAN/LOOK Scheduling)
3. **Movie Ticket Booking System** (Lock Registry Pattern, State Pattern, Concurrency Control)
4. **ATM System** (State Pattern, Chain of Responsibility Pattern, Facade Pattern)

---

## Technical Stack

- **Frontend**: React (Strict Mode), TypeScript (Strict Mode), Vite, Lucide icons, styled with type-safe style objects (CJS styled-objects passed to the React `style` prop).
- **Backend**: Node.js, Express, TypeScript, Layered Architecture, background simulation auto-ticking.
- **Monorepo structure**: npm workspaces.
- **Shared modules**: `shared-types` (common interfaces/enums), `shared-utils` (helpers).

---

## Folder Structure

```txt
/lld-case-studies
  /apps
    /frontend       - Vite client application (pages, components, themes)
    /backend        - Express API modules (controllers, services, repos, states)
  /packages
    /shared-types   - Shared domain entities and DTO contracts (types/enums)
    /shared-utils   - Shared helper code (formatters, UUID generators)
  /docs             - Extended design patterns & architectures
```

---

## Core LLD Concept Applications

1. **Object Modeling**: Rich object modeling representing physical systems. For details and UML diagrams, see [object-modeling.md](file:///Users/shiva/Desktop/Training/lld-case-studies/docs/object-modeling.md).
2. **SOLID Principles**: Strict decoupling. High cohesion, dependency inversion via interfaces, open-closed strategy handlers.
3. **Composition over Inheritance**: Behaviors are injected at runtime instead of hardcoding compile-time subclasses. See [design-decisions.md](file:///Users/shiva/Desktop/Training/lld-case-studies/docs/design-decisions.md).
4. **Exception Handling**: Standardized error mappings. Domain errors extend `DomainException` to return accurate HTTP codes (400, 404, 409) in Express error middleware.
5. **Interactive Concurrency Locking**: Seat locks are held in-memory with countdown limits in the Movie Booking module, preventing double bookings during checkouts.
6. **Keypad States (ATM)**: Card insertion, pin validations, and transaction states execute using the State Pattern.
7. **Greedy Cash Split (ATM)**: Dispensing bill splits ($100, $50, $20, $10) are handled by a CashDispenser chain (Chain of Responsibility).
8. **LOOK/SCAN Scheduler (Elevator)**: Elevator routing optimizes transit times using direction alignment heuristics. See [pseudocode.md](file:///Users/shiva/Desktop/Training/lld-case-studies/docs/pseudocode.md).

---

## Setup & Running Locally

### Prerequisites
- Node.js (version 18 or above recommended)
- npm (installed with Node)

### 1. Installation
In the project root, run:
```bash
npm install
```
This automatically boots all dependencies and establishes symbolic workspace links between the applications and local packages.

### 2. Start Development Servers
Run both frontend and backend concurrently in development mode:
```bash
npm run dev
```
- **Frontend client** runs on: `http://localhost:5173`
- **Backend API** runs on: `http://localhost:3000`

---

## API Demonstration Examples

For details, check [architecture.md](file:///Users/shiva/Desktop/Training/lld-case-studies/docs/architecture.md) and [interactions.md](file:///Users/shiva/Desktop/Training/lld-case-studies/docs/interactions.md).

### 1. Parking a Vehicle
```http
POST /api/parking/park
Content-Type: application/json

{
  "licensePlate": "MH-12-DE-9999",
  "vehicleType": "CAR",
  "slotType": "MEDIUM"
}
```

### 2. Lock Cinema Seats
```http
POST /api/movie/lock
Content-Type: application/json

{
  "userId": "user-1",
  "showId": "show-1",
  "seatIds": ["C3", "C4"]
}
```
