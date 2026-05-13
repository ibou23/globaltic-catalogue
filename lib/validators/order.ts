import { z } from "zod";

export const createOrderSchema = z.object({
  quote_id: z.string().uuid(),
  customer_id: z.string().uuid().nullable().optional(),
  total: z.number().int().min(0),
  notes: z.string().max(2000).nullable().optional(),
  internal_notes: z.string().max(2000).nullable().optional(),
  delivery_method: z
    .enum(["retrait", "livraison_dakar", "livraison_region"])
    .default("retrait"),
});

export const updateOrderSchema = z.object({
  status: z.enum([
    "en_attente", "confirmee", "bat_en_cours", "bat_valide",
    "en_production", "controle_qualite", "pret", "en_livraison",
    "livre", "annulee",
  ]),
  payment_status: z.enum(["non_paye", "acompte", "paye", "rembourse"]),
  paid_amount: z.number().int().min(0).default(0),
  delivery_method: z.enum(["retrait", "livraison_dakar", "livraison_region"]),
  delivery_address: z.string().max(500).nullable().optional(),
  estimated_delivery: z.string().nullable().optional(),
  actual_delivery: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  internal_notes: z.string().max(2000).nullable().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
