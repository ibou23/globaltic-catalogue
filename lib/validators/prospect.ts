import { z } from "zod";

export const CATALOG_PRODUCTS = [
  "Carte de visite",
  "Flyers",
  "Dépliants",
  "Papier à en-tête",
  "Facturiers",
  "Cachets",
  "Bâches",
  "Vinyles",
  "Stickers",
  "Tee-shirts",
  "Polos",
  "Casquettes",
  "Tote bags",
] as const;

export const PROSPECT_STATUSES = [
  "nouveau",
  "devis_envoye",
  "en_negociation",
  "validation_conception",
  "commande_confirmee",
  "en_production",
  "livre",
  "annule",
] as const;

export const prospectPublicSchema = z.object({
  full_name: z.string().min(2, "Le nom est requis").max(200),
  whatsapp: z.string().min(9, "Numéro WhatsApp requis").max(20),
  phone_secondary: z.string().max(20).nullable().optional(),
  email: z.string().email("Email invalide").nullable().optional(),

  company_name: z.string().max(200).nullable().optional(),
  company_address: z.string().max(500).nullable().optional(),
  website: z.string().max(300).nullable().optional(),
  sector: z.string().max(200).nullable().optional(),

  products_services: z.string().max(2000).nullable().optional(),
  preferred_colors: z.string().max(500).nullable().optional(),
  support_text: z.string().max(2000).nullable().optional(),

  requested_products: z.array(z.string().max(100)).default([]),
  other_product: z.string().max(300).nullable().optional(),
  quantity: z.string().max(100).nullable().optional(),
  format_dimensions: z.string().max(200).nullable().optional(),
  finish: z.string().max(200).nullable().optional(),
  desired_deadline: z.string().max(100).nullable().optional(),
  delivery_zone: z.string().max(200).nullable().optional(),
  message: z.string().max(2000).nullable().optional(),
});

export const PROSPECT_PRIORITIES = ["urgent", "chaud", "a_qualifier", "froid", "perdu"] as const;

export const prospectUpdateSchema = z.object({
  // Contact
  full_name: z.string().min(2, "Le nom est requis").max(200).optional(),
  whatsapp: z.string().min(9, "Numéro WhatsApp requis").max(20).optional(),
  phone_secondary: z.string().max(20).nullable().optional(),
  email: z.string().email("Email invalide").nullable().optional(),

  // Entreprise
  company_name: z.string().max(200).nullable().optional(),
  company_address: z.string().max(500).nullable().optional(),
  website: z.string().max(300).nullable().optional(),
  sector: z.string().max(200).nullable().optional(),

  // Conception
  products_services: z.string().max(2000).nullable().optional(),
  preferred_colors: z.string().max(500).nullable().optional(),
  support_text: z.string().max(2000).nullable().optional(),

  // Commande
  requested_products: z.array(z.string().max(100)).optional(),
  other_product: z.string().max(300).nullable().optional(),
  quantity: z.string().max(100).nullable().optional(),
  format_dimensions: z.string().max(200).nullable().optional(),
  finish: z.string().max(200).nullable().optional(),
  desired_deadline: z.string().max(100).nullable().optional(),
  delivery_zone: z.string().max(200).nullable().optional(),
  message: z.string().max(2000).nullable().optional(),

  // Suivi commercial
  status: z.enum(PROSPECT_STATUSES).optional(),
  priority: z.enum(PROSPECT_PRIORITIES).optional(),
  internal_notes: z.string().max(5000).nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  contacted_at: z.string().nullable().optional(),
  converted_customer_id: z.string().uuid().nullable().optional(),

  // Budget & relance
  estimated_budget: z.string().max(200).nullable().optional(),
  next_followup: z.string().nullable().optional(),
});

export type ProspectPublicInput = z.infer<typeof prospectPublicSchema>;
export type ProspectUpdateInput = z.infer<typeof prospectUpdateSchema>;
