import type { ProductWithOptions } from "@/lib/types/domain";
import type { CalculatorState, CalculationResult } from "@/lib/calculator/engine";
import { formatPrice } from "@/lib/utils";

const WHATSAPP_NUMBER = "221776190419";

function generateReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `GT-${timestamp}${random}`;
}

function getUnitLabel(unitType: string, quantity: number): string {
  if (unitType === "m2") return "m²";
  if (unitType === "piece") return quantity > 1 ? "unités" : "unité";
  return "exemplaires";
}

function buildOptionsLine(
  state: CalculatorState,
  product: ProductWithOptions
): string {
  const parts: string[] = [];
  if (state.format) parts.push(state.format.name);
  if (state.paper) parts.push(state.paper.name);
  if (state.selectedFinishes.length > 0) {
    parts.push(state.selectedFinishes.map((f) => f.name).join(", "));
  }
  if (product.unitType === "m2" && state.quantity > 0) {
    parts.push("Grand format");
  }
  return parts.length > 0 ? parts.join(" / ") : "Configuration standard";
}

export function generateWhatsAppLink(
  product: ProductWithOptions,
  state: CalculatorState,
  result: CalculationResult,
  productUrl?: string
): string {
  const nl = "%0A";
  const reference = generateReference();
  const unitLabel = getUnitLabel(product.unitType, state.quantity);
  const options = buildOptionsLine(state, product);
  const url = productUrl || `/produit/${product.slug}`;
  const delai = `~${result.estimatedTurnaroundDays} jours ouvrés`;

  let text = `NOUVELLE DEMANDE DE PRIX 🖨️${nl}${nl}`;
  text += `Référence configuration : ${reference}${nl}${nl}`;
  text += `Produit : ${product.name}${nl}`;
  text += `Quantité : ${state.quantity} ${unitLabel}${nl}`;
  text += `Options : ${options}${nl}`;
  text += `Prix estimatif : ${formatPrice(result.totalPrice)}${nl}`;
  text += `Délai estimé : ${delai}${nl}${nl}`;
  text += `Lien produit : ${url}${nl}${nl}`;
  text += `Bonjour l'équipe GLOBAL TIC, je souhaite confirmer cette configuration avec un conseiller et recevoir les prochaines étapes pour lancer ma commande.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
