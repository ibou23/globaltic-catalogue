import type { GlobalDiscountType } from "@/lib/types/domain";

export interface LineInput {
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

export interface LineResult {
  grossAmount: number;
  discountPercent: number;
  discountAmount: number;
  netAmount: number;
}

export interface QuoteDiscountResult {
  lines: LineResult[];
  subtotal: number;
  globalDiscountType: GlobalDiscountType | null;
  globalDiscountValue: number;
  globalDiscountAmount: number;
  total: number;
}

export function computeLineDiscount(line: LineInput): LineResult {
  const gross = Math.round(line.quantity * line.unitPrice);
  const discountAmount = line.discountPercent > 0
    ? Math.round(gross * line.discountPercent / 100)
    : 0;
  return {
    grossAmount: gross,
    discountPercent: line.discountPercent,
    discountAmount,
    netAmount: gross - discountAmount,
  };
}

export function computeGlobalDiscount(
  subtotal: number,
  type: GlobalDiscountType | null | undefined,
  value: number
): number {
  if (!type || value <= 0 || subtotal <= 0) return 0;
  if (type === "percentage") return Math.round(subtotal * (value / 100));
  return Math.min(Math.round(value), subtotal);
}

export function computeQuoteDiscounts(
  lines: LineInput[],
  globalDiscountType: GlobalDiscountType | null | undefined,
  globalDiscountValue: number
): QuoteDiscountResult {
  const lineResults = lines.map(computeLineDiscount);
  const subtotal = lineResults.reduce((sum, l) => sum + l.netAmount, 0);
  const type = globalDiscountType ?? null;
  const globalAmount = computeGlobalDiscount(subtotal, type, globalDiscountValue);
  return {
    lines: lineResults,
    subtotal,
    globalDiscountType: type,
    globalDiscountValue,
    globalDiscountAmount: globalAmount,
    total: subtotal - globalAmount,
  };
}
