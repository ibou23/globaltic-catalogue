"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Printer,
  Copy,
  Maximize,
  Package,
  Signpost,
  Gift,
  Coffee,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import type { Category } from "@/lib/types/domain";

const iconMap: Record<string, React.ReactNode> = {
  printer: <Printer className="h-6 w-6 text-brand-primary" />,
  copy: <Copy className="h-6 w-6 text-brand-primary" />,
  maximize: <Maximize className="h-6 w-6 text-brand-primary" />,
  package: <Package className="h-6 w-6 text-brand-primary" />,
  signpost: <Signpost className="h-6 w-6 text-brand-primary" />,
  gift: <Gift className="h-6 w-6 text-brand-primary" />,
  coffee: <Coffee className="h-6 w-6 text-brand-primary" />,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

interface CatalogueGridProps {
  categories: Category[];
}

export function CatalogueGrid({ categories }: CatalogueGridProps) {
  return (
    <section className="py-24 bg-slate-50 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-secondary tracking-tight font-heading">
              Explorez le Catalogue
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              Des solutions sur mesure pour chaque besoin de communication.
            </p>
          </div>
          <Button
            variant="outline"
            className="hidden md:flex font-bold bg-white"
            asChild
          >
            <Link href="/catalogue">
              Voir tout le catalogue <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link
                href={`/catalogue/${category.slug}`}
                className="block group h-full"
              >
                <Card className="h-full flex flex-col overflow-hidden bg-white hover:border-brand-primary/30 transition-all duration-500">
                  <div className="h-40 sm:h-56 bg-slate-100 relative overflow-hidden group-hover:bg-brand-primary/5 transition-colors duration-500">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        quality={90}
                        className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#529FD7_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-white/50 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 flex items-center justify-center z-10">
                        <div className="opacity-80 group-hover:opacity-100 transition-opacity scale-75 sm:scale-100">
                          {category.iconName
                            ? iconMap[category.iconName]
                            : null}
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <div className="bg-brand-secondary text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center shadow-lg">
                        Explorer <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </div>

                  <CardHeader className="flex-none pt-4 sm:pt-6 pb-1 sm:pb-2 px-3 sm:px-6">
                    <CardTitle className="text-sm sm:text-xl flex items-center justify-between line-clamp-1">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow pt-1 sm:pt-2 px-3 sm:px-6">
                    <CardDescription className="text-[10px] sm:text-sm leading-tight sm:leading-relaxed line-clamp-2">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Button
            size="lg"
            className="h-16 px-10 rounded-2xl text-lg font-black shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all group"
            asChild
          >
            <Link href="/catalogue">
              Voir tout le catalogue{" "}
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
