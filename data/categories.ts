import { Category } from "@/types/product";

export const categories: Category[] = [
  {
    id: "cat-num-gf",
    slug: "numerique-et-grand-format",
    name: "Numérique et Grand Format",
    description: "De l'impression petit format express aux bâches et vinyles XXL pour votre communication.",
    imageUrl: "/images/products/a787db0a98148bfb7bac3868a8a11629.jpg",
    iconName: "printer",
    order: 1,
  },
  {
    id: "cat-papeterie",
    slug: "papeterie",
    name: "Papeterie & Offset",
    description: "Le meilleur rapport qualité/prix pour vos moyens et grands tirages (catalogues, flyers en masse, en-têtes).",
    imageUrl: "/images/products/Depliant-3-volets.jpg",
    iconName: "copy",
    order: 2,
  },
  {
    id: "cat-packaging",
    slug: "packaging",
    name: "Packaging",
    description: "Valorisez vos produits avec des emballages sur mesure, boîtes et étuis personnalisés.",
    imageUrl: "/images/products/chemises à rabat.jpg",
    iconName: "package",
    order: 3,
  },
  {
    id: "cat-textile",
    slug: "textile",
    name: "Textile",
    description: "Impression sur vêtements professionnels, t-shirts, polos et casquettes.",
    imageUrl: "/images/products/Polo.webp",
    iconName: "gift",
    order: 4,
  },
  {
    id: "cat-goodies",
    slug: "objets-publicitaires",
    name: "Goodies & Objets",
    description: "Mugs, clés USB, porte-clés et objets personnalisés pour votre visibilité.",
    imageUrl: "/images/products/Mug-en-céramique-340-ml.webp",
    iconName: "coffee",
    order: 5,
  },
  {
    id: "cat-signaletique",
    slug: "signaletique",
    name: "Signalétique",
    description: "Orientez et informez avec nos solutions de signalétique intérieure et extérieure.",
    imageUrl: "/images/products/signal.jpg",
    iconName: "signpost",
    order: 6,
  }
];
