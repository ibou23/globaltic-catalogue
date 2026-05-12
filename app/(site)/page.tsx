import type { Metadata } from "next";
import { getFallbackCategories } from "@/lib/db/fallback";
import { siteConfig, seoDefaults } from "@/lib/config/site";
import { HeroSection } from "@/components/sections/HeroSection";
import { CatalogueGrid } from "@/components/sections/CatalogueGrid";
import { StatsCounter } from "@/components/sections/StatsCounter";
import { Testimonials } from "@/components/sections/Testimonials";
import { QuickQuote } from "@/components/sections/QuickQuote";

export const metadata: Metadata = {
  title: seoDefaults.defaultTitle,
  description: seoDefaults.description,
  openGraph: {
    title: seoDefaults.defaultTitle,
    description: seoDefaults.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: "fr_SN",
  },
};

export default function Home() {
  const categories = getFallbackCategories();

  return (
    <div className="flex flex-col flex-1 bg-background overflow-hidden">
      <HeroSection />
      <StatsCounter />
      <CatalogueGrid categories={categories} />
      <Testimonials />
      <QuickQuote />
    </div>
  );
}
