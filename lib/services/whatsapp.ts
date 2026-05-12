import type { ProductWithOptions, PriceCalculation } from "@/lib/types/domain";
import { formatPrice } from "@/lib/utils/format";

const WHATSAPP_NUMBER = "221776190419";

interface QuoteMessageInput {
  product: ProductWithOptions;
  quantity: number;
  formatName: string | null;
  paperName: string | null;
  finishNames: string[];
  calculation: PriceCalculation;
}

export function buildQuoteWhatsAppUrl(input: QuoteMessageInput): string {
  const { product, quantity, formatName, paperName, finishNames, calculation } =
    input;

  const nl = "%0A";
  const isM2 =
    product.unitType === "m2" || product.tags.includes("m2");
  const unitLabel = isM2 ? "m²" : "unité";
  const qtyLabel = isM2 ? "m²" : "exemplaires";

  let text = `*DEMANDE DE DEVIS* ${nl}${nl}`;
  text += `*Produit :* ${product.name}${nl}`;
  text += `*Quantité :* ${quantity} ${qtyLabel}${nl}`;

  if (formatName) {
    text += `*Format :* ${formatName}${nl}`;
  }
  if (paperName) {
    text += `*Papier :* ${paperName}${nl}`;
  }
  if (finishNames.length > 0) {
    text += `*Finitions :* ${finishNames.join(", ")}${nl}`;
  }

  text += `${nl}---${nl}`;
  text += `*Délai :* ~${calculation.turnaroundDays} jours ouvrés${nl}`;
  text += `*Prix unitaire :* ${formatPrice(calculation.unitPrice)} / ${unitLabel}${nl}`;
  text += `*Total estimé :* ${formatPrice(calculation.totalPrice)}${nl}`;
  text += `---${nl}${nl}`;
  text += `Bonjour, je souhaite valider ce devis et lancer la commande.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function buildOrderStatusWhatsAppUrl(
  customerPhone: string,
  reference: string,
  status: string
): string {
  const nl = "%0A";
  const phone = customerPhone.replace(/[^0-9]/g, "");

  let text = `*GLOBAL TIC - Mise à jour commande*${nl}${nl}`;
  text += `Référence : ${reference}${nl}`;
  text += `Nouveau statut : ${status}${nl}${nl}`;
  text += `Pour toute question, répondez à ce message.`;

  return `https://wa.me/${phone}?text=${text}`;
}

export function getBusinessWhatsAppUrl(): string {
  return `https://wa.me/${WHATSAPP_NUMBER}`;
}
