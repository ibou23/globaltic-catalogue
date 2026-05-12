export const siteConfig = {
  name: "GLOBAL TIC",
  tagline: "Imprimerie Professionnelle à Dakar",
  description:
    "Solutions d'impression professionnelle au Sénégal. Cartes de visite, flyers, banderoles, PLV et plus. Devis instantané, livraison rapide.",
  url: "https://imprimerie.globalticgroup.com",
  whatsapp: "221776190419",
  phone: "+221 77 619 04 19",
  email: "contact@globalticgroup.com",
  address: "Dakar, Sénégal",
  locale: "fr-SN",
  currency: "XOF",
  workingHours: {
    weekdays: "08h - 18h",
    saturday: "09h - 14h",
    sunday: "Fermé",
  },
  social: {
    facebook: "https://facebook.com/globaltic",
    instagram: "https://instagram.com/globaltic",
  },
} as const;

export const seoDefaults = {
  titleTemplate: "%s | GLOBAL TIC Imprimerie Dakar",
  defaultTitle: "GLOBAL TIC - Imprimerie Professionnelle à Dakar",
  description: siteConfig.description,
  openGraph: {
    type: "website" as const,
    locale: "fr_SN",
    siteName: siteConfig.name,
  },
};
