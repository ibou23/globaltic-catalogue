import { Product } from "./product";
import { CalculatorState, CalculationResult } from "./calculator";

export interface WhatsAppOrderContext {
  product: Product;
  state: CalculatorState;
  calculation: CalculationResult;
  customerNotes?: string;
}
