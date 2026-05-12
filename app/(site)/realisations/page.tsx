import type { Metadata } from "next";
import {
  getSafeRealisations,
  getSafeRealisationCategories,
} from "@/lib/db/safe-queries";
import { siteConfig } from "@/lib/config/site";
import { RealisationsHeader } from "@/components/realisations/RealisationsHeader";
import { RealisationsGallery } from "@/components/realisations/RealisationsGallery";
import { FullCatalogueCTA } from "@/components/sections/FullCatalogueCTA";

export const metadata: Metadata = {
  title: `Nos Réalisations | ${siteConfig.name} Imprimerie Dakar`,
  description:
    "Découvrez nos projets réalisés : branding véhicule, packaging, textile, signalétique et plus. Qualité professionnelle made in Dakar.",
  openGraph: {
    title: `Réalisations - ${siteConfig.name}`,
    description:
      "Galerie de projets d'impression réalisés par GLOBAL TIC à Dakar.",
    url: `${siteConfig.url}/realisations`,
  },
};

export default async function RealisationsPage() {
  const realisations = await getSafeRealisations();
  const categories = await getSafeRealisationCategories();

  return (
    <div className="flex flex-col flex-1 bg-slate-50/50 pb-24">
      <RealisationsHeader />
      <RealisationsGallery
        realisations={realisations}
        categories={categories}
      />
      <FullCatalogueCTA />
    </div>
  );
}
