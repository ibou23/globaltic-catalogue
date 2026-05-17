"use server";

import { createQuoteSchema, updateQuoteStatusSchema, updateQuoteSchema } from "@/lib/validators/quote";
import { createQuote, updateQuote, updateQuoteStatus, getQuotesEnrichedByCustomer } from "@/lib/db/quotes";
import { generateReference } from "@/lib/services/reference";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireActionDynamic } from "@/lib/auth/check-access";
import { getActiveAdminProfiles } from "@/lib/db/admin-users";
import { createAdminNotifications } from "@/lib/db/notifications";
import { createQuoteFollowUpTasks } from "@/lib/services/auto-tasks";
import { logAdminEvent } from "@/lib/db/activity-log";
import { getProspectById, updateProspect } from "@/lib/db/prospects";
import { getCustomerById, getCustomerByWhatsapp, createCustomer } from "@/lib/db/customers";
import { err, ok, type Result } from "@/lib/utils/result";
import type { Quote, QuoteEnriched } from "@/lib/types/domain";
import { getProductMinQty } from "@/lib/utils/product-price-resolver";

export async function createQuoteAction(
  formData: unknown
): Promise<Result<Quote>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "devis:create");
  if (denied) return err(denied);

  const parsed = createQuoteSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const reference = await generateReference("DEV");
  const result = await createQuote(parsed.data, reference);

  if (result.data) {
    const profiles = await getActiveAdminProfiles();
    await createAdminNotifications({
      eventKey: "devis_cree",
      title: "Nouveau devis créé",
      body: `Devis ${result.data.reference} créé par ${admin.data?.fullName ?? "un admin"}`,
      entityType: "quote",
      entityId: result.data.id,
      link: "/admin/devis",
      adminProfiles: profiles,
    });
  }

  return result;
}

export async function updateQuoteAction(
  id: string,
  formData: unknown
): Promise<Result<Quote>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "devis:edit");
  if (denied) return err(denied);

  if (!id) return err("Identifiant du devis manquant");
  const parsed = updateQuoteSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }
  return updateQuote(id, parsed.data);
}

export async function updateQuoteStatusAction(
  formData: unknown
): Promise<Result<Quote>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "devis:edit");
  if (denied) return err(denied);

  const parsed = updateQuoteStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await updateQuoteStatus(parsed.data.id, parsed.data.status);

  if (result.data && parsed.data.status === "envoye") {
    createQuoteFollowUpTasks({
      quoteId: result.data.id,
      quoteRef: result.data.reference,
      customerId: result.data.customerId,
      assignedTo: admin.data?.userId ?? "",
      isUrgent: result.data.isUrgent,
    });
  }

  if (result.data && parsed.data.status === "accepte") {
    const profiles = await getActiveAdminProfiles();
    await createAdminNotifications({
      eventKey: "devis_accepte",
      title: "Devis accepté",
      body: `Le devis ${result.data.reference} a été accepté — à convertir en commande`,
      entityType: "quote",
      entityId: result.data.id,
      link: "/admin/devis",
      adminProfiles: profiles,
    });
  }

  return result;
}

// ─── Créer un devis depuis un prospect ───────────────────────────────────────

export interface QuoteLineInput {
  product_name: string;
  quantity: number;
  unit_price: number;
  options?: string;
  discount_percent?: number;
}

export interface CreateQuoteFromProspectInput {
  prospect_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  options?: string;
  delai?: string;
  notes?: string;
  internal_notes?: string;
  is_urgent?: boolean;
  discount_percent?: number;
  extra_lines?: QuoteLineInput[];
}

export async function createQuoteFromProspectAction(
  input: CreateQuoteFromProspectInput
): Promise<Result<{ quoteId: string; quoteRef: string }>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "devis:create");
  if (denied) return err(denied);

  if (!input.prospect_id) return err("Identifiant du prospect manquant");

  // Validation quantités minimales catalogue
  const allLines = [
    { product_name: input.product_name, quantity: input.quantity },
    ...(input.extra_lines ?? []),
  ];
  for (const line of allLines) {
    if (line.quantity < 1) return err(`La quantité doit être ≥ 1 pour "${line.product_name}".`);
    const minQty = getProductMinQty(line.product_name);
    if (minQty !== null && line.quantity < minQty) {
      return err(`La quantité minimale pour "${line.product_name}" est de ${minQty} exemplaires.`);
    }
  }

  const prospectResult = await getProspectById(input.prospect_id);
  if (!prospectResult.data) return err("Prospect introuvable");
  const prospect = prospectResult.data;

  // Trouver ou créer le client lié
  let customerId: string | null = prospect.convertedCustomerId ?? null;

  if (!customerId) {
    const existingCustomer = await getCustomerByWhatsapp(prospect.whatsapp);
    if (existingCustomer.data) {
      customerId = existingCustomer.data.id;
      await updateProspect(prospect.id, { converted_customer_id: existingCustomer.data.id });
    } else {
      const newCustomer = await createCustomer({
        contact_name: prospect.fullName,
        whatsapp: prospect.whatsapp,
        email: prospect.email ?? undefined,
        phone: prospect.phoneSecondary ?? undefined,
        company_name: prospect.companyName ?? undefined,
        city: prospect.deliveryZone ?? "Dakar",
        customer_type: prospect.companyName ? "entreprise" : "particulier",
        source: "whatsapp",
        notes: prospect.internalNotes ?? undefined,
      });
      if (!newCustomer.data) return err(newCustomer.error ?? "Erreur création client");
      customerId = newCustomer.data.id;
      await updateProspect(prospect.id, { converted_customer_id: customerId });
    }
  }

  const totalPrice = input.quantity * input.unit_price;

  const configSnapshot: Record<string, unknown> = {};
  if (input.options?.trim()) configSnapshot.options = input.options.trim();
  if (input.delai?.trim()) configSnapshot.delai = input.delai.trim();
  if (prospect.formatDimensions) configSnapshot.format = prospect.formatDimensions;
  if (prospect.finish) configSnapshot.finition = prospect.finish;
  if (prospect.preferredColors) configSnapshot.couleurs = prospect.preferredColors;

  // Notes internes enrichies avec les données du prospect
  const internalParts: string[] = [];
  if (input.internal_notes?.trim()) internalParts.push(input.internal_notes.trim());
  if (prospect.message) internalParts.push(`Message prospect : ${prospect.message}`);
  if (prospect.productsServices) internalParts.push(`Activité : ${prospect.productsServices}`);
  if (prospect.estimatedBudget) internalParts.push(`Budget estimé : ${prospect.estimatedBudget}`);
  if (prospect.supportText) internalParts.push(`Texte support : ${prospect.supportText}`);

  const extraItems = (input.extra_lines ?? []).map((l) => ({
    product_name: l.product_name,
    quantity: l.quantity,
    unit_price: l.unit_price,
    total_price: Math.round(l.quantity * l.unit_price * (1 - (l.discount_percent ?? 0) / 100)),
    config_snapshot: l.options?.trim() ? { options: l.options.trim() } : {},
  }));

  const reference = await generateReference("DEV");
  const quoteResult = await createQuote(
    {
      customer_id: customerId,
      items: [
        {
          product_name: input.product_name,
          quantity: input.quantity,
          unit_price: input.unit_price,
          total_price: totalPrice,
          config_snapshot: configSnapshot,
        },
        ...extraItems,
      ],
      is_urgent: input.is_urgent ?? false,
      discount_percent: input.discount_percent ?? 0,
      notes: input.notes?.trim() || null,
      internal_notes: internalParts.length > 0 ? internalParts.join("\n\n") : null,
    },
    reference
  );

  if (!quoteResult.data) return err(quoteResult.error ?? "Erreur création devis");

  // Mettre le statut prospect à "devis_envoye"
  await updateProspect(prospect.id, { status: "devis_envoye" });

  if (admin.data) {
    await logAdminEvent(admin.data.userId, "devis_cree_depuis_prospect", quoteResult.data.id, {
      prospectId: prospect.id,
      prospectName: prospect.fullName,
      quoteRef: quoteResult.data.reference,
    });
  }

  const profiles = await getActiveAdminProfiles();
  await createAdminNotifications({
    eventKey: "devis_cree",
    title: "Nouveau devis créé",
    body: `Devis ${quoteResult.data.reference} créé pour ${prospect.fullName} (prospect)`,
    entityType: "quote",
    entityId: quoteResult.data.id,
    link: "/admin/devis",
    adminProfiles: profiles,
  });

  return ok({ quoteId: quoteResult.data.id, quoteRef: quoteResult.data.reference });
}

// ─── Créer un devis depuis un client ─────────────────────────────────────────

export interface CreateQuoteFromClientInput {
  customer_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  options?: string;
  delai?: string;
  notes?: string;
  internal_notes?: string;
  is_urgent?: boolean;
  discount_percent?: number;
}

export async function createQuoteFromClientAction(
  input: CreateQuoteFromClientInput
): Promise<Result<{ quoteId: string; quoteRef: string }>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "devis:create");
  if (denied) return err(denied);

  if (!input.customer_id) return err("Identifiant du client manquant");

  // Validation quantité minimale catalogue
  if (input.quantity < 1) return err(`La quantité doit être ≥ 1 pour "${input.product_name}".`);
  const minQtyClient = getProductMinQty(input.product_name);
  if (minQtyClient !== null && input.quantity < minQtyClient) {
    return err(`La quantité minimale pour "${input.product_name}" est de ${minQtyClient} exemplaires.`);
  }

  const customerResult = await getCustomerById(input.customer_id);
  if (!customerResult.data) return err("Client introuvable");

  const totalPrice = input.quantity * input.unit_price;

  const configSnapshot: Record<string, unknown> = {};
  if (input.options?.trim()) configSnapshot.options = input.options.trim();
  if (input.delai?.trim()) configSnapshot.delai = input.delai.trim();

  const reference = await generateReference("DEV");
  const quoteResult = await createQuote(
    {
      customer_id: input.customer_id,
      items: [
        {
          product_name: input.product_name,
          quantity: input.quantity,
          unit_price: input.unit_price,
          total_price: totalPrice,
          config_snapshot: configSnapshot,
        },
      ],
      is_urgent: input.is_urgent ?? false,
      discount_percent: input.discount_percent ?? 0,
      notes: input.notes?.trim() || null,
      internal_notes: input.internal_notes?.trim() || null,
    },
    reference
  );

  if (!quoteResult.data) return err(quoteResult.error ?? "Erreur création devis");

  if (admin.data) {
    await logAdminEvent(admin.data.userId, "devis_cree_depuis_client", quoteResult.data.id, {
      customerId: input.customer_id,
      customerName: customerResult.data.contactName,
      quoteRef: quoteResult.data.reference,
    });
  }

  const profiles = await getActiveAdminProfiles();
  await createAdminNotifications({
    eventKey: "devis_cree",
    title: "Nouveau devis créé",
    body: `Devis ${quoteResult.data.reference} créé pour ${customerResult.data.contactName} (client)`,
    entityType: "quote",
    entityId: quoteResult.data.id,
    link: "/admin/devis",
    adminProfiles: profiles,
  });

  return ok({ quoteId: quoteResult.data.id, quoteRef: quoteResult.data.reference });
}

// ─── Devis liés à un prospect ─────────────────────────────────────────────────

export async function getProspectLinkedQuotesAction(
  prospectId: string
): Promise<Result<QuoteEnriched[]>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");

  const prospectResult = await getProspectById(prospectId);
  if (!prospectResult.data) return err("Prospect introuvable");

  const customerId = prospectResult.data.convertedCustomerId;
  if (!customerId) return ok([]);

  return getQuotesEnrichedByCustomer(customerId);
}
