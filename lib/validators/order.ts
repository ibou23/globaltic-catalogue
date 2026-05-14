import { z } from "zod";

const deliveryMethodEnum = z.enum([
  "retrait", "livraison_dakar", "livraison_region", "livraison_coursier", "autre",
]);

export const createOrderSchema = z.object({
  quote_id: z.string().uuid(),
  customer_id: z.string().uuid().nullable().optional(),
  total: z.number().int().min(0),
  notes: z.string().max(2000).nullable().optional(),
  internal_notes: z.string().max(2000).nullable().optional(),
  delivery_method: deliveryMethodEnum.default("retrait"),
});

export const updateOrderSchema = z.object({
  status: z.enum([
    "en_attente", "confirmee", "bat_en_cours", "bat_valide",
    "en_production", "controle_qualite", "pret", "en_livraison",
    "livre", "annulee",
  ]),
  payment_status: z.enum(["non_paye", "acompte", "paye", "rembourse"]),
  paid_amount: z.number().int().min(0).default(0),
  payment_method: z.enum(["wave", "orange_money", "especes", "virement", "cheque"]).nullable().optional(),
  payment_reference: z.string().max(200).nullable().optional(),
  payment_note: z.string().max(1000).nullable().optional(),
  delivery_method: deliveryMethodEnum,
  delivery_address: z.string().max(500).nullable().optional(),
  estimated_delivery: z.string().nullable().optional(),
  actual_delivery: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  internal_notes: z.string().max(2000).nullable().optional(),
});

export const updateDeliverySchema = z.object({
  delivery_method: deliveryMethodEnum,
  delivery_status: z.enum(["non_planifiee", "planifiee", "en_cours", "livree", "echec", "reportee"]),
  delivery_address: z.string().max(500).nullable().optional(),
  delivery_recipient_name: z.string().max(200).nullable().optional(),
  delivery_recipient_phone: z.string().max(50).nullable().optional(),
  delivery_driver: z.string().max(200).nullable().optional(),
  delivery_fee: z.number().int().min(0).default(0),
  estimated_delivery: z.string().nullable().optional(),
  actual_delivery: z.string().nullable().optional(),
  delivery_notes: z.string().max(1000).nullable().optional(),
});

export type CreateOrderInput  = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput  = z.infer<typeof updateOrderSchema>;
export type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>;
