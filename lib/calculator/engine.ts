"use client";

import type {
  ProductWithOptions,
  ProductFormat,
  ProductPaper,
  ProductFinish,
  ProductQuantityTier,
} from "@/lib/types/domain";

export interface CalculatorState {
  format: ProductFormat | null;
  paper: ProductPaper | null;
  quantity: number;
  selectedFinishes: ProductFinish[];
}

export interface PriceDetailLine {
  label: string;
  amount: number;
  type: "base" | "finition" | "frais_fixes" | "remise";
}

export interface CalculationResult {
  unitPrice: number;
  totalPrice: number;
  finishesPrice: number;
  discount: number;
  estimatedTurnaroundDays: number;
  details: PriceDetailLine[];
}

export function calculatePrice(
  product: ProductWithOptions,
  state: CalculatorState
): CalculationResult {
  const details: PriceDetailLine[] = [];
  const qty = state.quantity;

  // 1. Trouver le palier de quantité applicable
  const tier =
    product.quantityTiers.find(
      (t) => qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty)
    ) || product.quantityTiers[0];

  const baseUnitPrice = tier ? tier.baseUnitPrice : 0;

  // 2. Multiplicateurs (Format & Papier)
  const formatMultiplier = state.format ? state.format.priceMultiplier : 1;
  const paperMultiplier = state.paper ? state.paper.priceMultiplier : 1;

  const currentUnitPrice = baseUnitPrice * formatMultiplier * paperMultiplier;

  details.push({
    label: `Impression de base (${qty} ex.)`,
    amount: currentUnitPrice * qty,
    type: "base",
  });

  // 3. Calcul des finitions
  let finishesPrice = 0;
  let fixedCosts = 0;

  for (const finish of state.selectedFinishes) {
    const finishTotalUnit = finish.unitPrice * qty;
    finishesPrice += finishTotalUnit;
    fixedCosts += finish.fixedPrice;

    details.push({
      label: `Option : ${finish.name}`,
      amount: finishTotalUnit,
      type: "finition",
    });

    if (finish.fixedPrice > 0) {
      details.push({
        label: `Frais fixes : ${finish.name}`,
        amount: finish.fixedPrice,
        type: "frais_fixes",
      });
    }
  }

  // 4. Totaux
  const totalPrice = currentUnitPrice * qty + finishesPrice + fixedCosts;

  // Délai estimé (+extraDays par finition sélectionnée)
  const extraDays = state.selectedFinishes.reduce(
    (acc, f) => acc + f.extraDays,
    0
  );
  const estimatedTurnaroundDays = product.baseTurnaroundDays + extraDays;

  return {
    unitPrice: qty > 0 ? totalPrice / qty : 0,
    totalPrice: Math.round(totalPrice),
    finishesPrice: finishesPrice + fixedCosts,
    discount: 0,
    estimatedTurnaroundDays,
    details,
  };
}
