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

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
