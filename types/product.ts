export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  iconName: string; // for lucide-react mapping
  order: number;
}

export interface Format {
  id: string;
  name: string; // ex: "85 x 55 mm"
  width: number;
  height: number;
  priceMultiplier: number; // Multiplicateur appliqué au prix de base
}

export interface Paper {
  id: string;
  name: string; // ex: "Couché brillant 350g"
  weight: number;
  type: 'couche' | 'offset' | 'recycle' | 'texture' | 'special';
  priceMultiplier: number;
}

export interface Finish {
  id: string;
  name: string; // ex: "Pelliculage mat"
  description: string;
  unitPrice: number; // Prix par unité
  fixedPrice: number; // Frais fixes de calage
  incompatibleWith: string[]; // IDs of incompatible finishes
}

export interface QuantityTier {
  min: number;
  max: number;
  baseUnitPrice: number; // Prix de base par unité à ce palier
  label: string; // ex: "100 - 499 ex."
}

export interface Product {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  shortDescription: string;
  description: string;
  imageUrls: string[];
  formats: Format[];
  papers: Paper[];
  finishes: Finish[];
  quantityTiers: QuantityTier[];
  baseTurnaroundDays: number; // Délai de base en jours ouvrés
  isPopular: boolean;
  tags: string[];
}
