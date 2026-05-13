import type { ProductWithOptions } from "@/lib/types/domain";
import type { CalculatorState, CalculationResult } from "@/lib/calculator/engine";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";

function getUnitLabel(unitType: string, quantity: number): string {
  if (unitType === "m2") return "mètre carré (m²)";
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
  const unitLabel = getUnitLabel(product.unitType, state.quantity);
  const options = buildOptionsLine(state, product);
  // URL absolue : priorité à l'URL passée en paramètre (window.location.href côté client)
  const url = productUrl?.startsWith("http")
    ? productUrl
    : `${siteConfig.url}/produit/${product.slug}`;
  const delai = `~${result.estimatedTurnaroundDays} jours ouvrés`;

  const prix = formatPrice(result.totalPrice).replace("F CFA", "FCFA");

  // Message construit avec \n — encodeURIComponent appliqué une seule fois à la fin
  const lines = [
    `*NOUVELLE DEMANDE DE DEVIS*`,
    ``,
    `Bonjour l'équipe *GLOBAL TIC*,`,
    ``,
    `*Produit* : ${product.name}`,
    `*Quantité* : ${state.quantity.toLocaleString("fr-SN")} ${unitLabel}`,
    `*Options sélectionnées* : ${options}`,
    `*Prix estimatif* : ${prix}`,
    `*Délai estimé* : ${delai}`,
    ``,
    `*Lien produit* : ${url}`,
    ``,
    `Merci de me confirmer la disponibilité et les prochaines étapes pour lancer ma commande.`,
  ];

  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}
