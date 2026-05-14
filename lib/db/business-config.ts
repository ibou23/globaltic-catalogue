import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";

// Toutes les clés connues avec leurs valeurs par défaut
export const CONFIG_DEFAULTS = {
  // Entreprise
  company_name:           "GLOBAL TIC",
  company_tagline:        "Imprimerie Professionnelle",
  company_address:        "Dakar, Sénégal",
  company_phone:          "+221 77 619 04 19",
  whatsapp_number:        "221776190419",
  company_email:          "contact@globalticgroup.com",
  company_website:        "https://imprimerie.globalticgroup.com",
  // Commercial
  default_quote_validity_days: 15,
  default_deposit_percent:     50,
  urgent_surcharge_percent:    30,
  default_turnaround_days:     3,
  min_order_amount:            5000,
  pdf_payment_terms:           "50% d'acompte à la commande, solde à la livraison",
  pdf_conditions: [
    "Les modalités de paiement sont les suivantes : 50 % d'acompte à la validation de la commande, le solde restant étant payable à la livraison.",
    "Ce devis est établi sur la base des informations transmises et reste valable pour la durée indiquée.",
    "Tout délai de production court à compter de la réception de l'acompte et de la validation du BAT.",
    "GLOBAL TIC se réserve le droit de refuser toute commande dont le contenu serait contraire aux lois en vigueur.",
  ],
  pdf_footer_text: "GLOBAL TIC — Imprimerie Professionnelle — Dakar, Sénégal",
  // Livraison
  delivery_zones: [
    { name: "Retrait boutique", fee: 0 },
    { name: "Dakar Plateau", fee: 2000 },
    { name: "Dakar Banlieue", fee: 3500 },
    { name: "Thiès", fee: 7000 },
    { name: "Saint-Louis", fee: 12000 },
  ],
  // Production
  working_hours: { start: "08:30", end: "18:00", days: [1, 2, 3, 4, 5, 6] },
  // Satisfaction client
  google_review_url: "",
  // Messages WhatsApp
  wa_template_devis:        "Bonjour *{client}*,\n\nSuite à notre échange, voici le récapitulatif de votre devis :\n\n*Référence* : {reference}\n*Total estimatif* : {total} FCFA\n\nConfirmez-vous cette commande ? Nous pouvons démarrer la production dès validation.\n\n*GLOBAL TIC*",
  wa_template_confirmation: "Bonjour *{client}*,\n\nNous avons bien enregistré votre commande.\n\n*Référence commande* : {reference}\n*Montant total* : {total} FCFA\n\nNotre équipe vous contactera prochainement pour les prochaines étapes.\n\nMerci pour votre confiance — *GLOBAL TIC*",
  wa_template_pret:         "Bonjour *{client}*,\n\nVotre commande *{reference}* est prête à être livrée ✅\n\nNotre livreur vous contactera pour organiser la livraison.\n\n*GLOBAL TIC*",
  wa_template_livraison:    "Bonjour *{client}*,\n\nVotre commande *{reference}* est en cours de livraison.\nNotre livreur vous contactera pour convenir de l'heure de remise.\n\n*GLOBAL TIC*",
  wa_template_livre:        "Bonjour *{client}*,\n\nVotre commande *{reference}* a bien été livrée.\nNous espérons que tout est à votre satisfaction.\n\nMerci de votre confiance — *GLOBAL TIC*",
  wa_template_paiement:     "Bonjour *{client}*,\n\nNous vous confirmons la réception de votre paiement de *{montant} FCFA* pour la commande *{reference}*.\n\nMerci pour votre confiance.\n\n*GLOBAL TIC*",
  wa_template_bat:          "Bonjour *{client}*,\n\nVotre commande *{reference}* est en cours de préparation du BAT.\nVous recevrez prochainement un fichier de validation à approuver avant l'impression.\n\n*GLOBAL TIC*",
} as const;

export type ConfigKey = keyof typeof CONFIG_DEFAULTS;
export type BusinessConfig = { [K in ConfigKey]: typeof CONFIG_DEFAULTS[K] };

// Charge toutes les clés et fusionne avec les valeurs par défaut
export async function getBusinessConfig(): Promise<BusinessConfig> {
  const supabase = await createClient();
  const { data } = await supabase.from("business_config").select("key, value");

  const config = { ...CONFIG_DEFAULTS } as Record<string, unknown>;

  for (const row of data ?? []) {
    if (row.key in CONFIG_DEFAULTS) {
      config[row.key] = row.value;
    }
  }

  return config as BusinessConfig;
}

// Charge une clé unique avec valeur par défaut
export async function getConfigValue<K extends ConfigKey>(
  key: K
): Promise<typeof CONFIG_DEFAULTS[K]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_config")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (data?.value !== undefined && data.value !== null) {
    return data.value as typeof CONFIG_DEFAULTS[K];
  }
  return CONFIG_DEFAULTS[key];
}

// Met à jour une ou plusieurs clés
export async function updateBusinessConfig(
  updates: Partial<Record<ConfigKey, unknown>>
): Promise<Result<true>> {
  const supabase = await createClient();

  const rows = Object.entries(updates).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("business_config")
    .upsert(rows, { onConflict: "key" });

  if (error) return err(error.message);
  return ok(true);
}
