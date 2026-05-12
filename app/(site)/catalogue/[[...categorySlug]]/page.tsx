import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFallbackCategories,
  getFallbackProducts,
  getFallbackCategoryBySlug,
} from "@/lib/db/fallback";
import { products as rawProducts } from "@/data/products";
import { siteConfig } from "@/lib/config/site";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";
import { CatalogueHeader } from "@/components/catalogue/CatalogueHeader";

interface PageProps {
  params: Promise<{ categorySlug?: string[] }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const slug = categorySlug?.[0];

  if (slug) {
    const category = getFallbackCategoryBySlug(slug);
    if (category) {
      return {
        title: `${category.name} | ${siteConfig.name} Imprimerie Dakar`,
        description:
          category.description ??
          `Découvrez nos produits ${category.name} : impression professionnelle à Dakar.`,
        openGraph: {
          title: `${category.name} - ${siteConfig.name}`,
          description:
            category.description ??
            `Solutions d'impression ${category.name} au Sénégal.`,
          url: `${siteConfig.url}/catalogue/${slug}`,
        },
      };
    }
  }

  return {
    title: `Catalogue | ${siteConfig.name} Imprimerie Dakar`,
    description:
      "Parcourez notre catalogue complet : cartes de visite, flyers, banderoles, packaging, textile et plus. Devis instantané.",
    openGraph: {
      title: `Catalogue - ${siteConfig.name}`,
      description:
        "Solutions d'impression professionnelle au Sénégal. Configurez et commandez en ligne.",
      url: `${siteConfig.url}/catalogue`,
    },
  };
}

export default async function CataloguePage({ params }: PageProps) {
  const { categorySlug } = await params;
  const slug = categorySlug?.[0];

  const categories = getFallbackCategories();
  const products = getFallbackProducts();

  let initialCategoryId = "all";

  if (slug) {
    const category = categories.find((c) => c.slug === slug);
    if (!category) {
      notFound();
    }
    initialCategoryId = category.id;
  }

  const minPrices: Record<string, number> = {};
  for (const product of products) {
    const rawProduct = rawProducts.find((p) => p.id === product.id);
    minPrices[product.id] = rawProduct?.quantityTiers[0]?.baseUnitPrice ?? 0;
  }

  return (
    <div className="flex flex-col flex-1 bg-background pb-24">
      <CatalogueHeader />
      <CatalogueClient
        categories={categories}
        products={products}
        initialCategoryId={initialCategoryId}
        initialMinPrices={minPrices}
      />
    </div>
  );
}
