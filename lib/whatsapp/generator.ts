import type { ProductWithOptions } from "@/lib/types/domain";
import type { CalculatorState, CalculationResult } from "@/lib/calculator/engine";
import { formatPrice } from "@/lib/utils";

const WHATSAPP_NUMBER = "221776190419";

export function generateWhatsAppLink(
  product: ProductWithOptions,
  state: CalculatorState,
  result: CalculationResult
): string {
  const nl = "%0A";

  const isM2 = product.unitType === "m2";
  const unit = isM2 ? "m²" : "exemplaires";
  const unitLabel = isM2 ? "m²" : "unité";

  let text = `*NOUVELLE DEMANDE DE DEVIS* 🖨️${nl}${nl}`;
  text += `*Produit :* ${product.name}${nl}`;
  text += `*Quantité :* ${state.quantity} ${unit}${nl}`;

  if (state.format) {
    text += `*Format :* ${state.format.name}${nl}`;
  }

  if (state.paper) {
    text += `*Papier :* ${state.paper.name}${nl}`;
  }

  if (state.selectedFinishes.length > 0) {
    text += `*Finitions :* ${state.selectedFinishes.map((f) => f.name).join(", ")}${nl}`;
  }

  text += `${nl}---------------------------${nl}`;
  text += `*Délai estimé :* ~${result.estimatedTurnaroundDays} jours ouvrés${nl}`;
  text += `*Prix unitaire :* ${formatPrice(result.unitPrice)} / ${unitLabel}${nl}`;
  text += `*Budget estimé :* ${formatPrice(result.totalPrice)}${nl}`;
  text += `---------------------------${nl}${nl}`;

  text += `Bonjour l'équipe GLOBAL TIC, je souhaite valider cette configuration et lancer la production.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
