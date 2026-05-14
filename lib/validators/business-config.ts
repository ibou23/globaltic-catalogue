import { z } from "zod";

export const companyInfoSchema = z.object({
  company_name:      z.string().min(1).max(100),
  company_tagline:   z.string().max(200),
  company_address:   z.string().max(300),
  company_phone:     z.string().max(30),
  whatsapp_number:   z.string().min(8).max(20).regex(/^\d+$/, "Chiffres uniquement"),
  company_email:     z.string().email().max(254),
  company_website:   z.string().url().max(300).or(z.literal("")),
  google_review_url: z.string().url().max(500).or(z.literal("")),
});

export const commercialSchema = z.object({
  default_quote_validity_days: z.number().int().min(1).max(365),
  default_deposit_percent:     z.number().int().min(0).max(100),
  urgent_surcharge_percent:    z.number().int().min(0).max(200),
  default_turnaround_days:     z.number().int().min(1).max(365),
  min_order_amount:            z.number().int().min(0),
  pdf_payment_terms:           z.string().max(500),
});

export const pdfContentSchema = z.object({
  pdf_conditions:  z.array(z.string().max(500)).min(1).max(10),
  pdf_footer_text: z.string().max(300),
});

export const waTemplatesSchema = z.object({
  wa_template_devis:        z.string().max(1000),
  wa_template_confirmation: z.string().max(1000),
  wa_template_pret:         z.string().max(1000),
  wa_template_livraison:    z.string().max(1000),
  wa_template_livre:        z.string().max(1000),
  wa_template_paiement:     z.string().max(1000),
  wa_template_bat:          z.string().max(1000),
});

export type CompanyInfoInput    = z.infer<typeof companyInfoSchema>;
export type CommercialInput     = z.infer<typeof commercialSchema>;
export type PdfContentInput     = z.infer<typeof pdfContentSchema>;
export type WaTemplatesInput    = z.infer<typeof waTemplatesSchema>;
