import { Request, Response, NextFunction, Router } from "express";
import { ATMService } from "../services/ATMService";
import { ATM } from "../models/ATM";

/**
 * ATMController
 * Handles incoming Express requests for the ATM System simulation.
 */
export class ATMController {
  private readonly service: ATMService;
  public readonly router: Router;

  constructor() {
    const atm = new ATM();
    this.service = new ATMService(atm);
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get("/status", this.getStatus.bind(this));
    this.router.post("/insert", this.insertCard.bind(this));
    this.router.post("/pin", this.enterPin.bind(this));
    this.router.post("/withdraw", this.withdraw.bind(this));
    this.router.post("/deposit", this.deposit.bind(this));
    this.router.get("/balance", this.checkBalance.bind(this));
    this.router.post("/eject", this.ejectCard.bind(this));
    this.router.get("/transactions", this.getTransactions.bind(this));
  }

  public getStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      const status = this.service.getStatus();
      res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  }

  public insertCard(req: Request, res: Response, next: NextFunction): void {
    try {
      const { cardNumber } = req.body;
      if (!cardNumber) {
        res.status(400).json({ error: "Missing required parameter: cardNumber" });
        return;
      }
      const status = this.service.insertCard(cardNumber);
      res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  }

  public enterPin(req: Request, res: Response, next: NextFunction): void {
    try {
      const { pin } = req.body;
      if (!pin) {
        res.status(400).json({ error: "Missing required parameter: pin" });
        return;
      }
      const status = this.service.enterPin(pin);
      res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  }

  public withdraw(req: Request, res: Response, next: NextFunction): void {
    try {
      const { amount } = req.body;
      if (amount === undefined) {
        res.status(400).json({ error: "Missing required parameter: amount" });
        return;
      }
      const status = this.service.withdraw(parseInt(amount, 10));
      res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  }

  public deposit(req: Request, res: Response, next: NextFunction): void {
    try {
      const { amount } = req.body;
      if (amount === undefined) {
        res.status(400).json({ error: "Missing required parameter: amount" });
        return;
      }
      const status = this.service.deposit(parseInt(amount, 10));
      res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  }

  public checkBalance(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = this.service.checkBalance();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  public ejectCard(req: Request, res: Response, next: NextFunction): void {
    try {
      const status = this.service.ejectCard();
      res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  }

  public getTransactions(req: Request, res: Response, next: NextFunction): void {
    try {
      const transactions = this.service.getTransactions();
      res.status(200).json(transactions);
    } catch (err) {
      next(err);
    }
  }
}
