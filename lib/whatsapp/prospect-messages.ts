import { siteConfig } from "@/lib/config/site";
import type { Prospect } from "@/lib/types/domain";

function waLink(phone: string, text: string): string {
  const number = phone.replace(/[^0-9]/g, "") || siteConfig.whatsapp;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function buildProspectWelcomeMessage(p: Prospect): string {
  const products = p.requestedProducts.length > 0
    ? p.requestedProducts.join(", ")
    : "vos produits";

  return [
    `Bonjour *${p.fullName}*,`,
    "",
    "Merci pour votre demande.",
    "",
    `Nous avons bien reçu votre besoin concernant : *${products}*.`,
    "",
    "Un conseiller GLOBAL TIC va vous accompagner pour confirmer les détails et vous proposer la meilleure solution.",
    "",
    "*GLOBAL TIC*",
  ].join("\n");
}

export function buildProspectPrecisionMessage(p: Prospect): string {
  return [
    `Bonjour *${p.fullName}*,`,
    "",
    "Merci pour votre intérêt.",
    "",
    "Pour vous proposer un devis précis, pourriez-vous nous préciser :",
    "• La quantité souhaitée",
    "• Le format exact",
    "• Le délai souhaité",
    "",
    "N'hésitez pas à nous envoyer un exemple ou une référence visuelle.",
    "",
    "*GLOBAL TIC*",
  ].join("\n");
}

export function buildProspectFollowUpMessage(p: Prospect): string {
  return [
    `Bonjour *${p.fullName}*,`,
    "",
    "Je reviens vers vous concernant votre demande.",
    "",
    "Avez-vous pu réfléchir à notre proposition ? Souhaitez-vous que je vous envoie un devis ?",
    "",
    "Je reste disponible pour toute question.",
    "",
    "*GLOBAL TIC*",
  ].join("\n");
}

export function buildProspectQuoteFollowUpMessage(p: Prospect): string {
  return [
    `Bonjour *${p.fullName}*,`,
    "",
    "Je me permets de revenir vers vous au sujet du devis que nous vous avons envoyé.",
    "",
    "Avez-vous pu le consulter ? Avez-vous des questions ou des ajustements à apporter ?",
    "",
    "Nous sommes à votre disposition.",
    "",
    "*GLOBAL TIC*",
  ].join("\n");
}

export function buildProspectLostMessage(p: Prospect): string {
  return [
    `Bonjour *${p.fullName}*,`,
    "",
    "Nous n'avons pas eu de vos nouvelles depuis un moment.",
    "",
    "Si votre projet est toujours d'actualité, n'hésitez pas à nous recontacter. Nous serons ravis de vous accompagner.",
    "",
    "Bonne continuation,",
    "*GLOBAL TIC*",
  ].join("\n");
}

export function buildProspectFormLinkMessage(p: Prospect): string {
  return [
    `Bonjour *${p.fullName}*,`,
    "",
    "Pour mieux traiter votre demande, merci de remplir ce formulaire rapide :",
    "",
    "👉 [Formulaire GLOBAL TIC]",
    "",
    "Cela nous permettra de vous envoyer un devis précis rapidement.",
    "",
    "*GLOBAL TIC*",
  ].join("\n");
}

export type ProspectMessageType =
  | "bienvenue"
  | "precision"
  | "relance"
  | "relance_devis"
  | "perdu"
  | "formulaire";

export const PROSPECT_MESSAGE_LABELS: Record<ProspectMessageType, string> = {
  bienvenue: "Message de bienvenue",
  precision: "Demande de précision",
  relance: "Relance après non-réponse",
  relance_devis: "Relance devis",
  perdu: "Reprise de contact",
  formulaire: "Envoi formulaire",
};

export function getProspectMessageText(type: ProspectMessageType, p: Prospect): string {
  switch (type) {
    case "bienvenue": return buildProspectWelcomeMessage(p);
    case "precision": return buildProspectPrecisionMessage(p);
    case "relance": return buildProspectFollowUpMessage(p);
    case "relance_devis": return buildProspectQuoteFollowUpMessage(p);
    case "perdu": return buildProspectLostMessage(p);
    case "formulaire": return buildProspectFormLinkMessage(p);
  }
}

export function getProspectWhatsAppUrl(type: ProspectMessageType, p: Prospect): string {
  return waLink(p.whatsapp, getProspectMessageText(type, p));
}
