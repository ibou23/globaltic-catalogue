import { z } from "zod";

export const createAdminUserSchema = z.object({
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().email("Email invalide").max(254),
  role: z.enum(["patron", "admin", "commercial", "production", "infographiste"]),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(72),
  is_active: z.boolean().default(true),
});

export const updateAdminUserSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  role: z.enum(["patron", "admin", "commercial", "production", "infographiste"]).optional(),
  is_active: z.boolean().optional(),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
