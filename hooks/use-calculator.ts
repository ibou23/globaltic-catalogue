"use client";

import { useState, useMemo } from "react";
import type { ProductWithOptions, ProductFormat, ProductPaper, ProductFinish } from "@/lib/types/domain";
import { calculatePrice, type CalculatorState, type CalculationResult } from "@/lib/calculator/engine";

export function useCalculator(product: ProductWithOptions) {
  const [state, setState] = useState<CalculatorState>(() => {
    const tierMin = product.quantityTiers[0]?.minQty || 1;
    const effectiveMin = Math.max(product.minOrderQuantity, tierMin);
    return {
      format: product.formats[0] || null,
      paper: product.papers[0] || null,
      quantity: effectiveMin || 100,
      selectedFinishes: [],
    };
  });

  const setQuantity = (quantity: number) => {
    setState((prev) => ({ ...prev, quantity }));
  };

  const setFormat = (formatId: string) => {
    const format = product.formats.find((f) => f.id === formatId) || null;
    setState((prev) => ({ ...prev, format }));
  };

  const setPaper = (paperId: string) => {
    const paper = product.papers.find((p) => p.id === paperId) || null;
    setState((prev) => ({ ...prev, paper }));
  };

  const toggleFinish = (finishId: string) => {
    const finish = product.finishes.find((f) => f.id === finishId);
    if (!finish) return;

    setState((prev) => {
      const isSelected = prev.selectedFinishes.some((f) => f.id === finishId);

      if (isSelected) {
        return {
          ...prev,
          selectedFinishes: prev.selectedFinishes.filter((f) => f.id !== finishId),
        };
      } else {
        const newFinishes = prev.selectedFinishes.filter(
          (f) =>
            !finish.incompatibleWith.includes(f.id) &&
            !f.incompatibleWith.includes(finish.id)
        );
        return {
          ...prev,
          selectedFinishes: [...newFinishes, finish],
        };
      }
    });
  };

  const result: CalculationResult = useMemo(() => {
    return calculatePrice(product, state);
  }, [product, state]);

  return {
    state,
    result,
    actions: { setQuantity, setFormat, setPaper, toggleFinish },
  };
}
