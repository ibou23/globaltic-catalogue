import { z } from "zod";

export const categorySchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(200),
  description: z.string().max(500).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  icon_name: z.string().max(50).nullable().optional(),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const productSchema = z.object({
  category_id: z.string().uuid(),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(300),
  short_description: z.string().max(500).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  image_urls: z.array(z.string()).default([]),
  base_turnaround_days: z.number().int().min(1).max(60).default(3),
  min_order_quantity: z.number().int().min(1).default(1),
  unit_type: z.enum(["piece", "m2", "lot"]).default("piece"),
  is_popular: z.boolean().default(false),
  is_active: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  seo_title: z.string().max(70).nullable().optional(),
  seo_description: z.string().max(160).nullable().optional(),
  display_order: z.number().int().min(0).default(0),
});

export const productFormatSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  width_mm: z.number().positive().nullable().optional(),
  height_mm: z.number().positive().nullable().optional(),
  price_multiplier: z.number().positive().default(1.0),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const productPaperSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  weight_gsm: z.number().int().positive().nullable().optional(),
  paper_type: z.enum(["couche", "offset", "recycle", "texture", "special"]).default("couche"),
  price_multiplier: z.number().positive().default(1.0),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const productFinishSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(300).nullable().optional(),
  unit_price: z.number().int().min(0).default(0),
  fixed_price: z.number().int().min(0).default(0),
  extra_days: z.number().int().min(0).default(0),
  incompatible_with: z.array(z.string().uuid()).default([]),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const quantityTierSchema = z.object({
  product_id: z.string().uuid(),
  min_qty: z.number().int().min(1),
  max_qty: z.number().int().positive().nullable().optional(),
  base_unit_price: z.number().int().min(0),
  label: z.string().max(100).nullable().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductFormatInput = z.infer<typeof productFormatSchema>;
export type ProductPaperInput = z.infer<typeof productPaperSchema>;
export type ProductFinishInput = z.infer<typeof productFinishSchema>;
export type QuantityTierInput = z.infer<typeof quantityTierSchema>;
