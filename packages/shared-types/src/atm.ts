export enum ATMStateName {
  IDLE = "IDLE",
  CARD_INSERTED = "CARD_INSERTED",
  PIN_VERIFIED = "PIN_VERIFIED",
  TRANSACTION_IN_PROGRESS = "TRANSACTION_IN_PROGRESS",
  OUT_OF_CASH = "OUT_OF_CASH"
}

export enum TransactionType {
  WITHDRAW = "WITHDRAW",
  DEPOSIT = "DEPOSIT",
  BALANCE_INQUIRY = "BALANCE_INQUIRY"
}

export enum TransactionStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PENDING = "PENDING"
}

export interface Card {
  cardNumber: string;
  pinHash: string;
  cardHolderName: string;
  isBlocked: boolean;
}

export interface Account {
  accountNumber: string;
  card: Card;
  balance: number;
  pin: string;
}

export interface ATMTransaction {
  id: string;
  accountNumber: string;
  type: TransactionType;
  amount?: number;
  status: TransactionStatus;
  timestamp: string;
  notes?: string;
}

export interface ATMStatus {
  id: string;
  currentState: ATMStateName;
  cashInventory: Record<number, number>;
  totalCash: number;
  activeCardNumber?: string;
  activeAccountNumber?: string;
  cardHolderName?: string;
}
