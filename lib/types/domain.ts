export type UnitType = "piece" | "m2" | "lot";
export type PaperType = "couche" | "offset" | "recycle" | "texture" | "special";
export type CustomerType = "particulier" | "entreprise" | "revendeur";
export type CustomerSource = "site" | "whatsapp" | "terrain" | "parrainage" | "autre";
export type LoyaltyTier = "nouveau" | "regulier" | "vip" | "premium";
export type QuoteStatus = "brouillon" | "envoye" | "accepte" | "refuse" | "expire";
export type OrderStatus =
  | "en_attente"
  | "confirmee"
  | "bat_en_cours"
  | "bat_valide"
  | "en_production"
  | "controle_qualite"
  | "pret"
  | "en_livraison"
  | "livre"
  | "annulee";
export type PaymentStatus = "non_paye" | "acompte" | "paye" | "rembourse";
export type PaymentMethod = "wave" | "orange_money" | "especes" | "virement" | "cheque";
export type DeliveryMethod = "retrait" | "livraison_dakar" | "livraison_region";
export type FileType = "bat_client" | "bat_valide" | "maquette" | "bon_livraison" | "facture";
export type FileStatus = "en_attente" | "valide" | "refuse";
export type AdminRole = "patron" | "admin" | "commercial" | "production" | "infographiste";
export type NotificationChannel = "whatsapp" | "email" | "in_app";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  iconName: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  imageUrls: string[];
  baseTurnaroundDays: number;
  minOrderQuantity: number;
  unitType: UnitType;
  isPopular: boolean;
  isActive: boolean;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  displayOrder: number;
}

export interface ProductFormat {
  id: string;
  productId: string;
  name: string;
  widthMm: number | null;
  heightMm: number | null;
  priceMultiplier: number;
  displayOrder: number;
}

export interface ProductPaper {
  id: string;
  productId: string;
  name: string;
  weightGsm: number | null;
  paperType: PaperType;
  priceMultiplier: number;
  displayOrder: number;
}

export interface ProductFinish {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  unitPrice: number;
  fixedPrice: number;
  extraDays: number;
  incompatibleWith: string[];
  displayOrder: number;
}

export interface ProductQuantityTier {
  id: string;
  productId: string;
  minQty: number;
  maxQty: number | null;
  baseUnitPrice: number;
  label: string | null;
}

export interface ProductWithOptions extends Product {
  category: Category;
  formats: ProductFormat[];
  papers: ProductPaper[];
  finishes: ProductFinish[];
  quantityTiers: ProductQuantityTier[];
}

export interface Customer {
  id: string;
  companyName: string | null;
  contactName: string;
  email: string | null;
  phone: string | null;
  whatsapp: string;
  city: string;
  customerType: CustomerType;
  source: CustomerSource;
  totalOrders: number;
  totalSpent: number;
  loyaltyTier: LoyaltyTier;
  notes: string | null;
  createdAt: string;
}

export interface Quote {
  id: string;
  reference: string;
  customerId: string | null;
  status: QuoteStatus;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  isUrgent: boolean;
  validUntil: string | null;
  notes: string | null;
  internalNotes: string | null;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  configSnapshot: Record<string, unknown>;
}

export interface QuoteEnriched extends Quote {
  customer: {
    contactName: string;
    whatsapp: string;
    companyName: string | null;
  } | null;
  firstItem: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    configSnapshot: Record<string, unknown>;
  } | null;
}

export interface Order {
  id: string;
  reference: string;
  quoteId: string | null;
  customerId: string | null;
  status: OrderStatus;
  total: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  deliveryFee: number;
  estimatedDelivery: string | null;
  createdAt: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: AdminRole;
  avatarUrl: string | null;
  isActive: boolean;
}

export interface PriceCalculation {
  baseUnitPrice: number;
  formatMultiplier: number;
  paperMultiplier: number;
  finishesTotal: number;
  finishesFixedTotal: number;
  subtotal: number;
  unitPrice: number;
  totalPrice: number;
  turnaroundDays: number;
  quantity: number;
}

export interface Realisation {
  id: string;
  title: string;
  category: string;
  clientName: string | null;
  description: string | null;
  imageUrl: string;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
}
