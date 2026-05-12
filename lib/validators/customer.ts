import { z } from "zod";

export const customerSchema = z.object({
  company_name: z.string().max(200).nullable().optional(),
  contact_name: z.string().min(2).max(200),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  whatsapp: z.string().min(9).max(20),
  address: z.string().max(500).nullable().optional(),
  city: z.string().max(100).default("Dakar"),
  customer_type: z.enum(["particulier", "entreprise", "revendeur"]).default("particulier"),
  source: z.enum(["site", "whatsapp", "terrain", "parrainage", "autre"]).default("site"),
  notes: z.string().max(2000).nullable().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
