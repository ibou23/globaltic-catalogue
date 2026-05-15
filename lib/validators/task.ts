import { z } from "zod";

export const taskSchema = z.object({
  title:       z.string().min(2).max(300),
  description: z.string().max(2000).nullable().optional(),
  task_type:   z.enum(["relancer_devis", "relancer_paiement", "envoyer_bat", "verifier_production", "confirmer_livraison", "appeler_client", "autre"]).default("autre"),
  priority:    z.enum(["basse", "normale", "haute", "urgente"]).default("normale"),
  status:      z.enum(["a_faire", "en_cours", "terminee", "annulee"]).default("a_faire"),
  due_date:    z.string().nullable().optional(),
  customer_id: z.string().uuid().nullable().optional(),
  prospect_id: z.string().uuid().nullable().optional(),
  quote_id:    z.string().uuid().nullable().optional(),
  order_id:    z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
});

export const updateTaskStatusSchema = z.object({
  id:     z.string().uuid(),
  status: z.enum(["a_faire", "en_cours", "terminee", "annulee"]),
});

export type TaskInput = z.infer<typeof taskSchema>;
