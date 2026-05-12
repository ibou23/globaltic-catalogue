import type {
  Category,
  Product,
  ProductFormat,
  ProductPaper,
  ProductFinish,
  ProductQuantityTier,
  ProductWithOptions,
  Customer,
  Quote,
  QuoteItem,
  Order,
  AdminProfile,
} from "@/lib/types/domain";

export function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    imageUrl: (row.image_url as string) ?? null,
    iconName: (row.icon_name as string) ?? null,
    displayOrder: row.display_order as number,
    isActive: row.is_active as boolean,
  };
}

export function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    categoryId: row.category_id as string,
    slug: row.slug as string,
    name: row.name as string,
    shortDescription: (row.short_description as string) ?? null,
    description: (row.description as string) ?? null,
    imageUrls: (row.image_urls as string[]) ?? [],
    baseTurnaroundDays: row.base_turnaround_days as number,
    minOrderQuantity: row.min_order_quantity as number,
    unitType: row.unit_type as Product["unitType"],
    isPopular: row.is_popular as boolean,
    isActive: row.is_active as boolean,
    tags: (row.tags as string[]) ?? [],
    seoTitle: (row.seo_title as string) ?? null,
    seoDescription: (row.seo_description as string) ?? null,
    displayOrder: row.display_order as number,
  };
}

export function mapProductFormat(row: Record<string, unknown>): ProductFormat {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    name: row.name as string,
    widthMm: (row.width_mm as number) ?? null,
    heightMm: (row.height_mm as number) ?? null,
    priceMultiplier: row.price_multiplier as number,
    displayOrder: row.display_order as number,
  };
}

export function mapProductPaper(row: Record<string, unknown>): ProductPaper {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    name: row.name as string,
    weightGsm: (row.weight_gsm as number) ?? null,
    paperType: row.paper_type as ProductPaper["paperType"],
    priceMultiplier: row.price_multiplier as number,
    displayOrder: row.display_order as number,
  };
}

export function mapProductFinish(row: Record<string, unknown>): ProductFinish {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    unitPrice: row.unit_price as number,
    fixedPrice: row.fixed_price as number,
    extraDays: row.extra_days as number,
    incompatibleWith: (row.incompatible_with as string[]) ?? [],
    displayOrder: row.display_order as number,
  };
}

export function mapQuantityTier(
  row: Record<string, unknown>
): ProductQuantityTier {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    minQty: row.min_qty as number,
    maxQty: (row.max_qty as number) ?? null,
    baseUnitPrice: row.base_unit_price as number,
    label: (row.label as string) ?? null,
  };
}

export function mapProductWithOptions(
  row: Record<string, unknown>
): ProductWithOptions {
  const product = mapProduct(row);
  const category = mapCategory(
    (row.categories as Record<string, unknown>) ?? {}
  );
  const formats = Array.isArray(row.product_formats)
    ? (row.product_formats as Record<string, unknown>[]).map(mapProductFormat)
    : [];
  const papers = Array.isArray(row.product_papers)
    ? (row.product_papers as Record<string, unknown>[]).map(mapProductPaper)
    : [];
  const finishes = Array.isArray(row.product_finishes)
    ? (row.product_finishes as Record<string, unknown>[]).map(mapProductFinish)
    : [];
  const quantityTiers = Array.isArray(row.product_quantity_tiers)
    ? (row.product_quantity_tiers as Record<string, unknown>[]).map(
        mapQuantityTier
      )
    : [];

  return { ...product, category, formats, papers, finishes, quantityTiers };
}

export function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    companyName: (row.company_name as string) ?? null,
    contactName: row.contact_name as string,
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    whatsapp: row.whatsapp as string,
    city: row.city as string,
    customerType: row.customer_type as Customer["customerType"],
    source: row.source as Customer["source"],
    totalOrders: (row.total_orders as number) ?? 0,
    totalSpent: (row.total_spent as number) ?? 0,
    loyaltyTier: (row.loyalty_tier as Customer["loyaltyTier"]) ?? "nouveau",
    notes: (row.notes as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export function mapQuote(row: Record<string, unknown>): Quote {
  return {
    id: row.id as string,
    reference: row.reference as string,
    customerId: (row.customer_id as string) ?? null,
    status: row.status as Quote["status"],
    subtotal: row.subtotal as number,
    discountPercent: row.discount_percent as number,
    discountAmount: row.discount_amount as number,
    total: row.total as number,
    isUrgent: row.is_urgent as boolean,
    validUntil: (row.valid_until as string) ?? null,
    notes: (row.notes as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export function mapQuoteItem(row: Record<string, unknown>): QuoteItem {
  return {
    id: row.id as string,
    quoteId: row.quote_id as string,
    productId: (row.product_id as string) ?? null,
    productName: row.product_name as string,
    quantity: row.quantity as number,
    unitPrice: row.unit_price as number,
    totalPrice: row.total_price as number,
    configSnapshot: (row.config_snapshot as Record<string, unknown>) ?? {},
  };
}

export function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    reference: row.reference as string,
    quoteId: (row.quote_id as string) ?? null,
    customerId: (row.customer_id as string) ?? null,
    status: row.status as Order["status"],
    total: row.total as number,
    paidAmount: row.paid_amount as number,
    paymentStatus: row.payment_status as Order["paymentStatus"],
    deliveryMethod: row.delivery_method as Order["deliveryMethod"],
    deliveryFee: row.delivery_fee as number,
    estimatedDelivery: (row.estimated_delivery as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export function mapAdminProfile(row: Record<string, unknown>): AdminProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    email: row.email as string,
    fullName: row.full_name as string,
    role: row.role as AdminProfile["role"],
    avatarUrl: (row.avatar_url as string) ?? null,
    isActive: row.is_active as boolean,
  };
}
