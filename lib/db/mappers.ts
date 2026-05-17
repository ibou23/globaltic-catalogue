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
  OrderFile,
  AdminProfile,
  Prospect,
  ProductDetail,
  ProspectFile,
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
    internalNotes: (row.internal_notes as string) ?? null,
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
    paymentMethod: (row.payment_method as Order["paymentMethod"]) ?? null,
    paymentReference: (row.payment_reference as string) ?? null,
    paymentNote: (row.payment_note as string) ?? null,
    lastPaymentAt: (row.last_payment_at as string) ?? null,
    deliveryMethod: row.delivery_method as Order["deliveryMethod"],
    deliveryStatus: ((row.delivery_status as string) ?? "non_planifiee") as Order["deliveryStatus"],
    deliveryFee: (row.delivery_fee as number) ?? 0,
    estimatedDelivery: (row.estimated_delivery as string) ?? null,
    actualDelivery: (row.actual_delivery as string) ?? null,
    deliveryAddress: (row.delivery_address as string) ?? null,
    deliveryRecipientName: (row.delivery_recipient_name as string) ?? null,
    deliveryRecipientPhone: (row.delivery_recipient_phone as string) ?? null,
    deliveryDriver: (row.delivery_driver as string) ?? null,
    deliveryNotes: (row.delivery_notes as string) ?? null,
    closureStatus: ((row.closure_status as string) ?? "non_cloturee") as Order["closureStatus"],
    satisfaction: ((row.satisfaction as string) ?? null) as Order["satisfaction"],
    customerComment: (row.customer_comment as string) ?? null,
    complaint: (row.complaint as string) ?? null,
    correctiveAction: (row.corrective_action as string) ?? null,
    closedAt: (row.closed_at as string) ?? null,
    notes: (row.notes as string) ?? null,
    internalNotes: (row.internal_notes as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export function mapOrderFile(row: Record<string, unknown>): OrderFile {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    fileType: row.file_type as OrderFile["fileType"],
    fileUrl: row.file_url as string,
    fileName: (row.file_name as string) ?? null,
    uploadedBy: (row.uploaded_by as string) ?? null,
    status: row.status as OrderFile["status"],
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
    createdAt: row.created_at as string,
  };
}

export function mapProspect(row: Record<string, unknown>): Prospect {
  return {
    id: row.id as string,
    reference: row.reference as string,
    fullName: row.full_name as string,
    whatsapp: row.whatsapp as string,
    phoneSecondary: (row.phone_secondary as string) ?? null,
    email: (row.email as string) ?? null,
    companyName: (row.company_name as string) ?? null,
    companyAddress: (row.company_address as string) ?? null,
    website: (row.website as string) ?? null,
    sector: (row.sector as string) ?? null,
    productsServices: (row.products_services as string) ?? null,
    preferredColors: (row.preferred_colors as string) ?? null,
    supportText: (row.support_text as string) ?? null,
    requestedProducts: (row.requested_products as string[]) ?? [],
    otherProduct: (row.other_product as string) ?? null,
    quantity: (row.quantity as string) ?? null,
    formatDimensions: (row.format_dimensions as string) ?? null,
    finish: (row.finish as string) ?? null,
    desiredDeadline: (row.desired_deadline as string) ?? null,
    deliveryZone: (row.delivery_zone as string) ?? null,
    message: (row.message as string) ?? null,
    status: row.status as Prospect["status"],
    priority: (row.priority as Prospect["priority"]) ?? "a_qualifier",
    internalNotes: (row.internal_notes as string) ?? null,
    assignedTo: (row.assigned_to as string) ?? null,
    contactedAt: (row.contacted_at as string) ?? null,
    convertedCustomerId: (row.converted_customer_id as string) ?? null,
    estimatedBudget: (row.estimated_budget as string) ?? null,
    nextFollowup: (row.next_followup as string) ?? null,
    source: row.source as Prospect["source"],
    productDetails: (row.product_details as ProductDetail[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapProspectFile(row: Record<string, unknown>): ProspectFile {
  return {
    id: row.id as string,
    prospectId: row.prospect_id as string,
    fileType: row.file_type as ProspectFile["fileType"],
    fileUrl: row.file_url as string,
    fileName: (row.file_name as string) ?? null,
    fileSize: (row.file_size as number) ?? null,
    uploadedBy: (row.uploaded_by as string) ?? null,
    createdAt: row.created_at as string,
  };
}
