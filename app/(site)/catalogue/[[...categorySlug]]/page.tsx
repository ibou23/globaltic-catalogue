import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getSafeCategories,
  getSafeCategoryBySlug,
  getSafeProducts,
  getSafeMinPrices,
} from "@/lib/db/safe-queries";
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
    const category = await getSafeCategoryBySlug(slug);
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

  const categories = await getSafeCategories();
  const products = await getSafeProducts();

  let initialCategoryId = "all";

  if (slug) {
    const category = categories.find((c) => c.slug === slug);
    if (!category) {
      notFound();
    }
    initialCategoryId = category.id;
  }

  const minPrices = await getSafeMinPrices(products);

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
