import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Home, ImageIcon } from "lucide-react";
import { getSafeProductBySlug } from "@/lib/db/safe-queries";
import { siteConfig } from "@/lib/config/site";
import { ProductCalculator } from "@/components/product/ProductCalculator";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getSafeProductBySlug(slug);

  if (!product) {
    return { title: "Produit introuvable" };
  }

  const title = product.seoTitle || product.name;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    product.description ||
    `Commandez ${product.name} en ligne chez ${siteConfig.name} à Dakar.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/produit/${slug}`,
      images: product.imageUrls[0]
        ? [{ url: product.imageUrls[0], alt: product.name }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getSafeProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = product.category;

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/catalogue" className="hover:text-brand-primary transition-colors">
              Catalogue
            </Link>
            {category && (
              <>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link
                  href={`/catalogue/${category.slug}`}
                  className="hover:text-brand-primary transition-colors"
                >
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Colonne gauche : visuel & description */}
          <div className="lg:col-span-5 space-y-8">
            <div className="aspect-square bg-white rounded-2xl border shadow-sm flex items-center justify-center p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-brand-primary/10 transition-colors z-0"></div>
              {product.imageUrls[0] ? (
                <Image
                  src={product.imageUrls[0]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover relative z-10 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <>
                  <ImageIcon className="w-24 h-24 opacity-10 relative z-10" />
                  <span className="absolute text-brand-secondary/50 font-bold text-2xl tracking-widest uppercase rotate-45 z-10">
                    Aperçu visuel
                  </span>
                </>
              )}
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-black text-brand-secondary mb-4 font-heading tracking-tight">
                {product.name}
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-sm font-medium rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Colonne droite : calculateur */}
          <div className="lg:col-span-7">
            <ProductCalculator product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
