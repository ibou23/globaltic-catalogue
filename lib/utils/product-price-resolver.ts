import { products } from "@/data/products";

// ─── Mapping CATALOG_PRODUCTS → slugs dans data/products.ts ──────────────────
const CATALOG_NAME_TO_SLUGS: Record<string, string[]> = {
  "Carte de visite":  ["carte-de-visite-recto-verso", "carte-de-visite-recto"],
  "Flyers":           ["flyer-a5-recto-verso", "flyer-a5-recto"],
  "Dépliants":        ["depliant-a4-3-volets", "depliant-a3-4-volets"],
  "Papier à en-tête": ["papier-en-tete-a4"],
  "Bâches":           ["impression-bache"],
  "Vinyles":          ["impression-vinyle"],
  "Stickers":         ["vinyle-pre-decoupe"],
  "Tee-shirts":       ["tee-shirt-personnalise"],
  "Polos":            ["polo-personnalise"],
  "Casquettes":       ["casquette-dtf", "casquette-broderie"],
  "Tote bags":        ["tote-bag"],
};

const ALIAS_MAP: Record<string, string> = {
  "cartes de visite":      "Carte de visite",
  "carte visite":          "Carte de visite",
  "carte de visite":       "Carte de visite",
  "flyer":                 "Flyers",
  "depliant":              "Dépliants",
  "depliants":             "Dépliants",
  "tshirt":                "Tee-shirts",
  "t-shirt":               "Tee-shirts",
  "tee shirt":             "Tee-shirts",
  "polo":                  "Polos",
  "casquette":             "Casquettes",
  "tote bag":              "Tote bags",
  "totebag":               "Tote bags",
  "sac":                   "Tote bags",
  "bache":                 "Bâches",
  "bâche":                 "Bâches",
  "vinyle":                "Vinyles",
  "sticker":               "Stickers",
  "en-tête":               "Papier à en-tête",
  "en tête":               "Papier à en-tête",
  "entete":                "Papier à en-tête",
  "papier entete":         "Papier à en-tête",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[éèê]/g, "e")
    .replace(/[àâä]/g, "a")
    .replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o")
    .replace(/[ùûü]/g, "u")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findTier(
  tiers: Array<{ min: number; max: number; baseUnitPrice: number; label: string }>,
  qty: number
) {
  const sorted = [...tiers].sort((a, b) => a.min - b.min);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const t = sorted[i];
    if (qty >= t.min && qty <= t.max) return t;
  }
  const last = sorted[sorted.length - 1];
  if (last && qty > last.max) return last;
  return sorted[0] ?? null;
}

// Recherche interne partagée par resolveProductPrice et getProductMinQty
function findCatalogProduct(productName: string) {
  const normalizedInput = normalize(productName);

  let canonicalName: string | undefined = CATALOG_NAME_TO_SLUGS[productName]
    ? productName
    : undefined;

  if (!canonicalName) canonicalName = ALIAS_MAP[normalizedInput];

  if (!canonicalName) {
    for (const key of Object.keys(CATALOG_NAME_TO_SLUGS)) {
      if (normalize(key) === normalizedInput) { canonicalName = key; break; }
    }
  }

  if (!canonicalName) {
    for (const key of Object.keys(CATALOG_NAME_TO_SLUGS)) {
      const nKey = normalize(key);
      if (nKey.includes(normalizedInput) || normalizedInput.includes(nKey)) {
        canonicalName = key;
        break;
      }
    }
  }

  let product = null;
  if (canonicalName) {
    for (const slug of CATALOG_NAME_TO_SLUGS[canonicalName]) {
      product = products.find((p) => p.slug === slug) ?? null;
      if (product) break;
    }
  }

  if (!product) {
    product =
      products.find((p) => normalize(p.name) === normalizedInput) ??
      products.find((p) => normalize(p.name).includes(normalizedInput)) ??
      null;
  }

  return product ?? null;
}

export interface PriceResolution {
  unitPrice: number;
  totalPrice: number;
  tierLabel: string;
  catalogName: string;
  source: "auto";
}

/**
 * Retourne la quantité minimale catalogue pour un nom de produit.
 * Retourne null si le produit est inconnu (produit personnalisé → pas de minimum).
 */
export function getProductMinQty(productName: string): number | null {
  if (!productName.trim()) return null;
  const product = findCatalogProduct(productName);
  if (!product?.quantityTiers?.length) return null;
  const sorted = [...product.quantityTiers].sort((a, b) => a.min - b.min);
  return sorted[0]?.min ?? null;
}

/**
 * Cherche le prix unitaire catalogue pour un nom de produit et une quantité.
 * Retourne null si le produit n'est pas trouvé ou si les paliers sont absents.
 */
export function resolveProductPrice(
  productName: string,
  quantity: number
): PriceResolution | null {
  if (!productName.trim() || quantity < 1) return null;
  const product = findCatalogProduct(productName);
  if (!product?.quantityTiers?.length) return null;

  const tier = findTier(product.quantityTiers, quantity);
  if (!tier) return null;

  const unitPrice = tier.baseUnitPrice;
  return {
    unitPrice,
    totalPrice: unitPrice * quantity,
    tierLabel: tier.label,
    catalogName: product.name,
    source: "auto",
  };
}

/**
 * Parse une chaîne de quantité en nombre (ex: "500 pièces" → 500, "1 000" → 1000).
 */
export function parseQuantityString(s: string | null | undefined): number {
  if (!s) return 1;
  const n = parseInt(s.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) || n < 1 ? 1 : n;
}
