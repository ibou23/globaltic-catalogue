"use client";

import { useState, useEffect, useMemo } from "react";
import { Product, Format, Paper, Finish } from "@/types/product";
import { CalculatorState, CalculationResult } from "@/types/calculator";
import { calculatePrice } from "@/lib/calculator/engine";

export function useCalculator(product: Product) {
  // État initial par défaut
  const [state, setState] = useState<CalculatorState>({
    format: product.formats[0] || null,
    paper: product.papers[0] || null,
    quantity: product.quantityTiers[0]?.min || 100,
    selectedFinishes: []
  });

  // Mise à jour de la quantité
  const setQuantity = (quantity: number) => {
    setState(prev => ({ ...prev, quantity }));
  };

  // Mise à jour du format
  const setFormat = (formatId: string) => {
    const format = product.formats.find(f => f.id === formatId) || null;
    setState(prev => ({ ...prev, format }));
  };

  // Mise à jour du papier
  const setPaper = (paperId: string) => {
    const paper = product.papers.find(p => p.id === paperId) || null;
    setState(prev => ({ ...prev, paper }));
  };

  // Toggle d'une finition
  const toggleFinish = (finishId: string) => {
    const finish = product.finishes.find(f => f.id === finishId);
    if (!finish) return;

    setState(prev => {
      const isSelected = prev.selectedFinishes.some(f => f.id === finishId);
      
      if (isSelected) {
        // Remove
        return {
          ...prev,
          selectedFinishes: prev.selectedFinishes.filter(f => f.id !== finishId)
        };
      } else {
        // Add (while removing incompatible finishes)
        const newFinishes = prev.selectedFinishes.filter(
          f => !finish.incompatibleWith.includes(f.id) && !f.incompatibleWith.includes(finish.id)
        );
        return {
          ...prev,
          selectedFinishes: [...newFinishes, finish]
        };
      }
    });
  };

  // Calcul du prix mémorisé (ne se recalcule que si l'état ou le produit change)
  const result: CalculationResult = useMemo(() => {
    return calculatePrice(product, state);
  }, [product, state]);

  return {
    state,
    result,
    actions: {
      setQuantity,
      setFormat,
      setPaper,
      toggleFinish
    }
  };
}
