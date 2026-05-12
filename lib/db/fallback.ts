import { categories as rawCategories } from "@/data/categories";
import { products as rawProducts } from "@/data/products";
import { realisations as rawRealisations } from "@/data/realisations";
import type {
  Category,
  Product,
  ProductWithOptions,
  ProductFormat,
  ProductPaper,
  ProductFinish,
  ProductQuantityTier,
} from "@/lib/types/domain";

function mapStaticCategory(raw: (typeof rawCategories)[number]): Category {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    imageUrl: raw.imageUrl,
    iconName: raw.iconName,
    displayOrder: raw.order,
    isActive: true,
  };
}

function mapStaticProduct(raw: (typeof rawProducts)[number]): Product {
  return {
    id: raw.id,
    categoryId: raw.categoryId,
    slug: raw.slug,
    name: raw.name,
    shortDescription: raw.shortDescription,
    description: raw.description,
    imageUrls: raw.imageUrls,
    baseTurnaroundDays: raw.baseTurnaroundDays,
    minOrderQuantity: raw.quantityTiers[0]?.min ?? 1,
    unitType: raw.tags.includes("m2") ? "m2" : "piece",
    isPopular: raw.isPopular,
    isActive: true,
    tags: raw.tags,
    seoTitle: null,
    seoDescription: null,
    displayOrder: 0,
  };
}

function mapStaticProductWithOptions(
  raw: (typeof rawProducts)[number]
): ProductWithOptions {
  const product = mapStaticProduct(raw);
  const category = rawCategories.find((c) => c.id === raw.categoryId);

  const formats: ProductFormat[] = raw.formats.map((f, i) => ({
    id: f.id,
    productId: raw.id,
    name: f.name,
    widthMm: f.width,
    heightMm: f.height,
    priceMultiplier: f.priceMultiplier,
    displayOrder: i,
  }));

  const papers: ProductPaper[] = raw.papers.map((p, i) => ({
    id: p.id,
    productId: raw.id,
    name: p.name,
    weightGsm: p.weight,
    paperType: p.type,
    priceMultiplier: p.priceMultiplier,
    displayOrder: i,
  }));

  const finishes: ProductFinish[] = raw.finishes.map((f, i) => ({
    id: f.id,
    productId: raw.id,
    name: f.name,
    description: f.description,
    unitPrice: f.unitPrice,
    fixedPrice: f.fixedPrice,
    extraDays: 0,
    incompatibleWith: f.incompatibleWith,
    displayOrder: i,
  }));

  const quantityTiers: ProductQuantityTier[] = raw.quantityTiers.map(
    (t, i) => ({
      id: `${raw.id}-tier-${i}`,
      productId: raw.id,
      minQty: t.min,
      maxQty: t.max,
      baseUnitPrice: t.baseUnitPrice,
      label: t.label,
    })
  );

  return {
    ...product,
    category: category
      ? mapStaticCategory(category)
      : {
          id: "",
          slug: "",
          name: "",
          description: null,
          imageUrl: null,
          iconName: null,
          displayOrder: 0,
          isActive: true,
        },
    formats,
    papers,
    finishes,
    quantityTiers,
  };
}

export function getFallbackCategories(): Category[] {
  return rawCategories
    .map(mapStaticCategory)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getFallbackProducts(): Product[] {
  return rawProducts.map(mapStaticProduct);
}

export function getFallbackProductsByCategory(categoryId: string): Product[] {
  return rawProducts
    .filter((p) => p.categoryId === categoryId)
    .map(mapStaticProduct);
}

export function getFallbackPopularProducts(): Product[] {
  return rawProducts.filter((p) => p.isPopular).map(mapStaticProduct);
}

export function getFallbackProductBySlug(
  slug: string
): ProductWithOptions | null {
  const raw = rawProducts.find((p) => p.slug === slug);
  if (!raw) return null;
  return mapStaticProductWithOptions(raw);
}

export function getFallbackCategoryBySlug(slug: string): Category | null {
  const raw = rawCategories.find((c) => c.slug === slug);
  if (!raw) return null;
  return mapStaticCategory(raw);
}

export interface FallbackRealisation {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  client: string | null;
}

export function getFallbackRealisations(): FallbackRealisation[] {
  return rawRealisations.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    imageUrl: r.imageUrl,
    client: r.client ?? null,
  }));
}

export function getFallbackRealisationCategories(): string[] {
  const cats = new Set(rawRealisations.map((r) => r.category));
  return ["Tous", ...Array.from(cats).sort()];
}
