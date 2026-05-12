import { Product, Format, Paper, Finish } from "@/types/product";
import { CalculatorState, CalculationResult, PriceDetailLine } from "@/types/calculator";

export function calculatePrice(product: Product, state: CalculatorState): CalculationResult {
  const details: PriceDetailLine[] = [];
  
  // 1. Trouver le palier de quantité
  const qty = state.quantity;
  const tier = product.quantityTiers.find(t => qty >= t.min && qty <= t.max) 
    || product.quantityTiers[0]; // Fallback au premier palier (le plus cher) si en dessous du min
    
  let baseUnitPrice = tier ? tier.baseUnitPrice : 0;

  // Règle spécifique Textile : +20% de majoration pour les petites commandes (< 10 unités)
  if (product.categoryId === "cat-textile" && qty < 10) {
    baseUnitPrice *= 1.2;
  }
  
  // 2. Multiplicateurs (Format & Papier)
  const formatMultiplier = state.format ? state.format.priceMultiplier : 1;
  const paperMultiplier = state.paper ? state.paper.priceMultiplier : 1;
  
  let currentUnitPrice = baseUnitPrice * formatMultiplier * paperMultiplier;
  
  details.push({
    label: `Impression de base (${qty} ex.)`,
    amount: currentUnitPrice * qty,
    type: 'base'
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
      type: 'finition'
    });
    
    if (finish.fixedPrice > 0) {
      details.push({
        label: `Frais fixes : ${finish.name}`,
        amount: finish.fixedPrice,
        type: 'frais_fixes'
      });
    }
  }

  // 4. Totaux
  const totalPrice = (currentUnitPrice * qty) + finishesPrice + fixedCosts;
  
  // Délai estimé (+1 jour par finition)
  const estimatedTurnaroundDays = product.baseTurnaroundDays + state.selectedFinishes.length;

  return {
    unitPrice: totalPrice / qty,
    totalPrice: Math.round(totalPrice),
    finishesPrice: finishesPrice + fixedCosts,
    discount: 0, // À implémenter si besoin de codes promo
    estimatedTurnaroundDays,
    details
  };
}
