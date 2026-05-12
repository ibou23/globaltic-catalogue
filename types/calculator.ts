import { Format, Paper, Finish, QuantityTier } from "./product";

export interface CalculatorState {
  format: Format | null;
  paper: Paper | null;
  quantity: number;
  selectedFinishes: Finish[];
}

export interface PriceDetailLine {
  label: string;
  amount: number;
  type: 'base' | 'finition' | 'frais_fixes' | 'remise';
}

export interface CalculationResult {
  unitPrice: number;
  totalPrice: number;
  finishesPrice: number;
  discount: number;
  estimatedTurnaroundDays: number;
  details: PriceDetailLine[];
}
