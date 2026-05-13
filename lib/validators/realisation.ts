import { z } from "zod";

export const realisationSchema = z.object({
  title: z.string().min(2, "Le titre doit faire au moins 2 caractères"),
  category: z.string().min(2, "La catégorie est requise"),
  client_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().min(1, "L'image est requise"),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
});

export type RealisationInput = z.infer<typeof realisationSchema>;
