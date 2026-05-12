import type {
  ProductWithOptions,
  ProductFormat,
  ProductPaper,
  ProductFinish,
  ProductQuantityTier,
  PriceCalculation,
} from "@/lib/types/domain";

interface PricingInput {
  product: ProductWithOptions;
  quantity: number;
  formatId: string | null;
  paperId: string | null;
  finishIds: string[];
}

export function calculatePrice(input: PricingInput): PriceCalculation {
  const { product, quantity, formatId, paperId, finishIds } = input;

  if (quantity < 1) {
    return zeroPriceResult(product.baseTurnaroundDays);
  }

  const tier = findTier(product.quantityTiers, quantity);
  const baseUnitPrice = tier?.baseUnitPrice ?? 0;

  const format = formatId
    ? product.formats.find((f) => f.id === formatId)
    : null;
  const paper = paperId
    ? product.papers.find((p) => p.id === paperId)
    : null;

  const formatMultiplier = format?.priceMultiplier ?? 1;
  const paperMultiplier = paper?.priceMultiplier ?? 1;

  const selectedFinishes = product.finishes.filter((f) =>
    finishIds.includes(f.id)
  );
  const finishesUnitTotal = selectedFinishes.reduce(
    (sum, f) => sum + f.unitPrice,
    0
  );
  const finishesFixedTotal = selectedFinishes.reduce(
    (sum, f) => sum + f.fixedPrice,
    0
  );
  const finishExtraDays = selectedFinishes.reduce(
    (sum, f) => sum + f.extraDays,
    0
  );

  const computedUnitPrice = Math.round(
    baseUnitPrice * formatMultiplier * paperMultiplier + finishesUnitTotal
  );
  const subtotal = computedUnitPrice * quantity + finishesFixedTotal;
  const totalPrice = Math.round(subtotal);
  const unitPrice = Math.round(totalPrice / quantity);
  const turnaroundDays = product.baseTurnaroundDays + finishExtraDays;

  return {
    baseUnitPrice,
    formatMultiplier,
    paperMultiplier,
    finishesTotal: finishesUnitTotal * quantity,
    finishesFixedTotal,
    subtotal,
    unitPrice,
    totalPrice,
    turnaroundDays,
    quantity,
  };
}

function findTier(
  tiers: ProductQuantityTier[],
  quantity: number
): ProductQuantityTier | null {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);

  for (let i = sorted.length - 1; i >= 0; i--) {
    const tier = sorted[i];
    if (quantity >= tier.minQty) {
      if (tier.maxQty === null || quantity <= tier.maxQty) {
        return tier;
      }
    }
  }

  // Quantité supérieure au max du dernier palier : appliquer le dernier (meilleur prix)
  if (sorted.length > 0) {
    const lastTier = sorted[sorted.length - 1];
    if (quantity > (lastTier.maxQty ?? Infinity)) {
      return lastTier;
    }
  }

  return sorted[0] ?? null;
}

function zeroPriceResult(baseDays: number): PriceCalculation {
  return {
    baseUnitPrice: 0,
    formatMultiplier: 1,
    paperMultiplier: 1,
    finishesTotal: 0,
    finishesFixedTotal: 0,
    subtotal: 0,
    unitPrice: 0,
    totalPrice: 0,
    turnaroundDays: baseDays,
    quantity: 0,
  };
}
