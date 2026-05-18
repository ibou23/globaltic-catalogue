import type { Order, PaymentStatus } from "@/lib/types/domain";

/**
 * Total réellement dû par le client = produits + frais livraison.
 * Source de vérité unique pour tous les calculs financiers.
 */
export function getClientTotal(order: Pick<Order, "total" | "deliveryFee">): number {
  return order.total + (order.deliveryFee ?? 0);
}

/**
 * Solde restant à encaisser.
 * Toujours >= 0 (pas de remboursement ici, utiliser paymentStatus "rembourse" si besoin).
 */
export function getRemainingBalance(order: Pick<Order, "total" | "deliveryFee" | "paidAmount">): number {
  return Math.max(0, getClientTotal(order) - order.paidAmount);
}

/**
 * Dérive le statut paiement depuis les montants.
 * Utilisé côté client (CommandeEditForm, QuickPaymentModal) pour l'auto-dérivation.
 */
export function derivePaymentStatus(
  paidAmount: number,
  clientTotal: number
): Exclude<PaymentStatus, "rembourse"> {
  if (paidAmount <= 0) return "non_paye";
  if (paidAmount >= clientTotal) return "paye";
  return "acompte";
}
