"use server";

import { createOrderSchema, updateOrderSchema } from "@/lib/validators/order";
import { createOrder, updateOrder, getOrderByQuoteId, getOrderById } from "@/lib/db/orders";
import { getQuoteById } from "@/lib/db/quotes";
import { generateReference } from "@/lib/services/reference";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { logOrderEvent } from "@/lib/db/activity-log";
import { getActiveAdminProfiles } from "@/lib/db/admin-users";
import { createAdminNotifications } from "@/lib/db/notifications";
import { syncInvoicePayment } from "@/lib/db/invoices";
import { err, type Result } from "@/lib/utils/result";
import type { Order } from "@/lib/types/domain";

export async function convertQuoteToOrderAction(
  quoteId: string
): Promise<Result<Order>> {
  const adminCheck = await getCurrentAdmin();
  const denied = requireRole(adminCheck.data?.role, "devis:convert");
  if (denied) return err(denied);

  if (!quoteId) return err("Identifiant du devis manquant");

  const quoteResult = await getQuoteById(quoteId);
  if (!quoteResult.data) {
    return err(quoteResult.error ?? "Devis introuvable");
  }

  const quote = quoteResult.data;

  if (quote.status !== "accepte") {
    return err("Seuls les devis acceptés peuvent être convertis en commande");
  }

  const existingResult = await getOrderByQuoteId(quoteId);
  if (existingResult.data) {
    return err(`Une commande existe déjà pour ce devis (${existingResult.data.reference})`);
  }

  const parsed = createOrderSchema.safeParse({
    quote_id: quote.id,
    customer_id: quote.customerId,
    total: quote.total,
    notes: quote.notes,
    internal_notes: null,
    delivery_method: "retrait",
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const reference = await generateReference("CMD");
  const result = await createOrder(parsed.data, reference);

  if (result.data) {
    await logOrderEvent(adminCheck.data?.userId ?? null, result.data.id, "commande_creee", {
      reference: result.data.reference,
      devis: quote.reference,
      total: result.data.total,
    });

    const profiles = await getActiveAdminProfiles();
    await createAdminNotifications({
      eventKey: "commande_creee",
      title: "Nouvelle commande",
      body: `Commande ${result.data.reference} créée (${result.data.total.toLocaleString("fr-SN")} FCFA)`,
      entityType: "order",
      entityId: result.data.id,
      link: "/admin/commandes",
      adminProfiles: profiles,
    });
  }

  return result;
}

export async function updateOrderAction(
  id: string,
  formData: unknown
): Promise<Result<Order>> {
  const adminCheck = await getCurrentAdmin();
  const deniedStatus = requireRole(adminCheck.data?.role, "commande:edit_status");
  if (deniedStatus) return err(deniedStatus);

  if (!id) return err("Identifiant de la commande manquant");

  const parsed = updateOrderSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const previousResult = await getOrderById(id);
  const previous = previousResult.data;

  if (previous) {
    const paymentChanged =
      parsed.data.paid_amount !== previous.paidAmount ||
      parsed.data.payment_method !== previous.paymentMethod ||
      parsed.data.payment_reference !== previous.paymentReference ||
      parsed.data.payment_note !== previous.paymentNote ||
      parsed.data.payment_status !== previous.paymentStatus;
    if (paymentChanged) {
      const deniedPayment = requireRole(adminCheck.data?.role, "commande:edit_payment");
      if (deniedPayment) return err(deniedPayment);
    }
  }

  const result = await updateOrder(id, parsed.data);

  if (result.data && previous) {
    const uid = adminCheck.data?.userId ?? null;
    const order = result.data;
    const logEvents: Array<{ action: string; meta: Record<string, unknown> }> = [];

    if (previous.status !== order.status) {
      logEvents.push({ action: "statut_change", meta: { de: previous.status, vers: order.status } });
    }
    if (previous.paidAmount !== order.paidAmount) {
      logEvents.push({
        action: "paiement_mis_a_jour",
        meta: {
          montant_precedent: previous.paidAmount,
          montant_nouveau: order.paidAmount,
          statut_paiement: order.paymentStatus,
          mode: order.paymentMethod ?? null,
        },
      });
    }
    if (previous.internalNotes !== order.internalNotes && order.internalNotes) {
      logEvents.push({ action: "note_interne_modifiee", meta: {} });
    }

    for (const { action, meta } of logEvents) {
      await logOrderEvent(uid, id, action, meta);
    }

    // Synchroniser le statut de la facture si le paiement a changé
    if (previous.paidAmount !== order.paidAmount || previous.paymentStatus !== order.paymentStatus) {
      syncInvoicePayment(id, order.paidAmount, order.total);
    }

    // Notifications selon événements clés
    const profiles = await getActiveAdminProfiles();
    const ref = order.reference;
    const notifJobs: Array<Parameters<typeof createAdminNotifications>[0]> = [];

    if (previous.paidAmount !== order.paidAmount && order.paidAmount > 0) {
      const balance = order.total - order.paidAmount;
      if (balance > 0) {
        notifJobs.push({
          eventKey: "paiement_mis_a_jour",
          title: "Acompte reçu",
          body: `Commande ${ref} — acompte ${order.paidAmount.toLocaleString("fr-SN")} FCFA, solde ${balance.toLocaleString("fr-SN")} FCFA`,
          entityType: "order", entityId: id, link: "/admin/commandes",
          adminProfiles: profiles,
        });
        notifJobs.push({
          eventKey: "solde_restant",
          title: "Solde restant à encaisser",
          body: `Commande ${ref} — solde de ${balance.toLocaleString("fr-SN")} FCFA restant`,
          entityType: "order", entityId: id, link: "/admin/commandes",
          adminProfiles: profiles,
        });
      } else {
        notifJobs.push({
          eventKey: "paiement_mis_a_jour",
          title: "Paiement complet",
          body: `Commande ${ref} entièrement réglée (${order.total.toLocaleString("fr-SN")} FCFA)`,
          entityType: "order", entityId: id, link: "/admin/commandes",
          adminProfiles: profiles,
        });
      }
    }

    if (previous.status !== order.status) {
      const statusNotifs: Partial<Record<string, { eventKey: string; title: string; body: string }>> = {
        bat_en_cours:   { eventKey: "bat_en_cours",          title: "BAT à préparer",        body: `Commande ${ref} — préparation du BAT en cours` },
        bat_valide:     { eventKey: "bat_valide",            title: "BAT validé",             body: `Commande ${ref} — BAT validé, prête pour la production` },
        pret:           { eventKey: "commande_prete",        title: "Commande prête",         body: `Commande ${ref} est prête à être livrée` },
        en_livraison:   { eventKey: "en_livraison",          title: "En livraison",           body: `Commande ${ref} est en cours de livraison` },
      };
      const notif = statusNotifs[order.status];
      if (notif) {
        notifJobs.push({ ...notif, entityType: "order", entityId: id, link: "/admin/commandes", adminProfiles: profiles });
      }
    }

    for (const job of notifJobs) {
      await createAdminNotifications(job);
    }
  }

  return result;
}
