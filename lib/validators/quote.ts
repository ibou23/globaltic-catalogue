import { z } from "zod";

export const quoteItemSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  product_name: z.string().min(1).max(300),
  quantity: z.number().int().min(1),
  unit_price: z.number().int().min(0),
  total_price: z.number().int().min(0),
  config_snapshot: z.record(z.unknown()).default({}),
  notes: z.string().max(1000).nullable().optional(),
});

export const createQuoteSchema = z.object({
  customer_id: z.string().uuid().nullable().optional(),
  items: z.array(quoteItemSchema).min(1),
  is_urgent: z.boolean().default(false),
  discount_percent: z.number().min(0).max(100).default(0),
  notes: z.string().max(2000).nullable().optional(),
  internal_notes: z.string().max(2000).nullable().optional(),
});

export const updateQuoteStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["brouillon", "envoye", "accepte", "refuse", "expire"]),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;
