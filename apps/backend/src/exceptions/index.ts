export class DomainException extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundException extends DomainException {
  constructor(message: string) {
    super(404, message);
  }
}

export class BadRequestException extends DomainException {
  constructor(message: string) {
    super(400, message);
  }
}

export class ConflictException extends DomainException {
  constructor(message: string) {
    super(409, message);
  }
}

// Parking exceptions
export class SlotFullException extends ConflictException {
  constructor(message: string = "No available parking slots matching criteria.") {
    super(message);
  }
}

// Movie booking exceptions
export class SeatAlreadyBookedException extends ConflictException {
  constructor(message: string = "One or more selected seats are already booked.") {
    super(message);
  }
}

export class SeatLockedException extends ConflictException {
  constructor(message: string = "One or more selected seats are temporarily locked.") {
    super(message);
  }
}

// ATM exceptions
export class InvalidPinException extends BadRequestException {
  constructor(message: string = "The entered PIN is invalid.") {
    super(message);
  }
}

export class InsufficientCashException extends BadRequestException {
  constructor(message: string = "Insufficient physical cash in ATM or account balance.") {
    super(message);
  }
}

export class CardBlockedException extends BadRequestException {
  constructor(message: string = "Card is blocked.") {
    super(message);
  }
}

export class InvalidCardException extends BadRequestException {
  constructor(message: string = "Invalid card number.") {
    super(message);
  }
}

export class InvalidATMStateException extends BadRequestException {
  constructor(message: string = "Action invalid for current ATM state.") {
    super(message);
  }
}

// Elevator exceptions
export class ElevatorException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}
