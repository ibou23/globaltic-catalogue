import { Product } from "@/types/product";
import { CalculatorState, CalculationResult } from "@/types/calculator";
import { formatPrice } from "@/lib/utils";

const WHATSAPP_NUMBER = "221776190419"; // Numéro GLOBAL TIC

export function generateWhatsAppLink(
  product: Product,
  state: CalculatorState,
  result: CalculationResult
): string {
  const nl = "%0A";
  
  const unit = (product.tags.includes("m2") || product.slug === "vinyle-pre-decoupe") ? "m²" : "exemplaires";
  const unitLabel = (product.tags.includes("m2") || product.slug === "vinyle-pre-decoupe") ? "m²" : "unité";

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
    text += `*Finitions :* ${state.selectedFinishes.map(f => f.name).join(", ")}${nl}`;
  }
  
  text += `${nl}---------------------------${nl}`;
  text += `*Délai estimé :* ~${result.estimatedTurnaroundDays} jours ouvrés${nl}`;
  text += `*Prix unitaire :* ${formatPrice(result.unitPrice)} / ${unitLabel}${nl}`;
  text += `*Budget estimé :* ${formatPrice(result.totalPrice)}${nl}`;
  text += `---------------------------${nl}${nl}`;
  
  text += `Bonjour l'équipe GLOBAL TIC, je souhaite valider cette configuration et lancer la production.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
