import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { OrderEnriched, Quote, QuoteItem, Invoice, InvoiceStatus } from "@/lib/types/domain";
import { PdfFooter } from "./PdfFooter";
import { PdfSignatureBlock } from "./PdfSignatureBlock";

const BRAND_PRIMARY   = "#529FD7";
const BRAND_SECONDARY = "#132034";
const GRAY_LIGHT      = "#F8FAFC";
const GRAY_BORDER     = "#E2E8F0";
const GRAY_TEXT       = "#64748B";
const GRAY_DARK       = "#1E293B";
const GREEN           = "#16A34A";
const AMBER           = "#D97706";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: GRAY_DARK,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingBottom: 72,
    paddingHorizontal: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  logo: { width: 120, height: 40, objectFit: "contain" },
  companyBlock: { alignItems: "flex-end", gap: 2 },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: BRAND_SECONDARY,
    marginBottom: 2,
  },
  companyDetail: { fontSize: 8, color: GRAY_TEXT },
  titleBand: {
    backgroundColor: BRAND_SECONDARY,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  titleBandLabel: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  titleBandRight: { alignItems: "flex-end", gap: 3 },
  titleBandRef:    { fontSize: 10, color: BRAND_PRIMARY, fontFamily: "Helvetica-Bold" },
  titleBandStatus: { fontSize: 8, color: "#FFFFFF", fontFamily: "Helvetica-Bold", opacity: 0.75 },
  metaRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  metaCard: {
    flex: 1,
    backgroundColor: GRAY_LIGHT,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    padding: 12,
  },
  metaCardTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BRAND_PRIMARY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  metaCardLine:     { fontSize: 9, color: GRAY_DARK, marginBottom: 2 },
  metaCardLineBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: GRAY_DARK, marginBottom: 2 },
  metaCardLineGray: { fontSize: 8, color: GRAY_TEXT, marginBottom: 2 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND_SECONDARY,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
    backgroundColor: GRAY_LIGHT,
  },
  colProduct: { flex: 4 },
  colQty:     { flex: 1.2, textAlign: "right", paddingLeft: 4 },
  colUnit:    { flex: 1.8, textAlign: "right", paddingLeft: 8 },
  colTotal:   { flex: 1.8, textAlign: "right", paddingLeft: 8 },
  thText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tdText:     { fontSize: 9, color: GRAY_DARK },
  tdTextBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: GRAY_DARK },
  tdTextGray: { fontSize: 8, color: GRAY_TEXT },
  totalsBlock: { alignItems: "flex-end", marginTop: 12, marginBottom: 24 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
    marginBottom: 4,
  },
  totalLabel: { fontSize: 8, color: GRAY_TEXT, width: 120, textAlign: "right" },
  totalValue: { fontSize: 8, color: GRAY_DARK, width: 90, textAlign: "right" },
  totalFinalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
    backgroundColor: BRAND_PRIMARY,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 6,
    marginBottom: 4,
  },
  totalFinalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    width: 120,
    textAlign: "right",
  },
  totalFinalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    width: 90,
    textAlign: "right",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 4,
    marginBottom: 4,
  },
  paymentLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", width: 120, textAlign: "right" },
  paymentValue: { fontSize: 9, fontFamily: "Helvetica-Bold", width: 90, textAlign: "right" },
  notesSection: { marginBottom: 16 },
  notesSectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: BRAND_PRIMARY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  notesBox: {
    backgroundColor: GRAY_LIGHT,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    padding: 10,
  },
  notesText: { fontSize: 8.5, color: GRAY_DARK, lineHeight: 1.5 },
  issuerBand: {
    backgroundColor: GRAY_LIGHT,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  issuerText: { fontSize: 8, color: GRAY_TEXT },
  issuerBold: { fontSize: 8, fontFamily: "Helvetica-Bold", color: BRAND_SECONDARY },
  // (footer handled by PdfFooter component)
});

function formatNumber(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
function formatAmount(n: number): string {
  return formatNumber(n) + " FCFA";
}
function formatWhatsapp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("221") && digits.length === 12)
    return `+221 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  if (digits.length === 9)
    return `+221 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  brouillon:           "Brouillon",
  emise:               "Emise",
  payee:               "Payee",
  partiellement_payee: "Partiellement payee",
  annulee:             "Annulee",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  wave:         "Wave",
  orange_money: "Orange Money",
  especes:      "Especes",
  virement:     "Virement bancaire",
  cheque:       "Cheque",
};

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  retrait:              "Retrait en boutique",
  livraison_dakar:      "Livraison à Dakar",
  livraison_region:     "Livraison en région",
  livraison_coursier:   "Livraison par coursier",
  autre:                "Livraison personnalisée",
};

function resolveDeliveryMethodLabel(order: OrderEnriched): string {
  if (order.deliveryMethod === "retrait" && (order.deliveryDriver || order.deliveryFee > 0)) {
    return "Livraison par coursier";
  }
  return DELIVERY_METHOD_LABELS[order.deliveryMethod] ?? order.deliveryMethod;
}

interface CompanyInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
}

interface FacturePDFProps {
  order: OrderEnriched;
  invoice: Invoice;
  quote?: (Quote & { items: QuoteItem[] }) | null;
  logoUrl?: string;
  company?: CompanyInfo;
  pdfFooterText?: string;
}

export function FacturePDF({ order, invoice, quote, logoUrl, company }: FacturePDFProps) {
  const companyName    = company?.name    ?? "GLOBAL TIC";
  const companyTagline = company?.tagline ?? "Imprimerie Professionnelle";
  const companyAddress = company?.address ?? "Dakar, Senegal";
  const companyPhone   = company?.phone   ?? "+221 77 619 04 19";
  const companyEmail   = company?.email   ?? "contact@globalticgroup.com";

  const deliveryFee  = order.deliveryFee ?? 0;
  const clientTotal  = order.total + deliveryFee;
  const balance      = clientTotal - order.paidAmount;
  const isFullyPaid  = balance <= 0;
  const items        = quote?.items ?? [];
  const hasDiscount  = (quote?.discountPercent ?? 0) > 0;

  return (
    <Document
      title={`Facture ${invoice.reference}`}
      author={companyName}
      subject="Facture"
      creator={companyName}
    >
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          {logoUrl ? (
            <Image src={logoUrl} style={s.logo} />
          ) : (
            <Text style={s.companyName}>{companyName}</Text>
          )}
          <View style={s.companyBlock}>
            <Text style={s.companyName}>{companyName}</Text>
            <Text style={s.companyDetail}>{companyTagline}</Text>
            <Text style={s.companyDetail}>{companyAddress}</Text>
            <Text style={s.companyDetail}>{companyPhone}</Text>
            <Text style={s.companyDetail}>{companyEmail}</Text>
          </View>
        </View>

        {/* Title band */}
        <View style={s.titleBand}>
          <Text style={s.titleBandLabel}>FACTURE</Text>
          <View style={s.titleBandRight}>
            <Text style={s.titleBandRef}>{invoice.reference}</Text>
            <Text style={s.titleBandStatus}>{STATUS_LABELS[invoice.status]}</Text>
          </View>
        </View>

        {/* Meta row */}
        <View style={s.metaRow}>
          <View style={s.metaCard}>
            <Text style={s.metaCardTitle}>Informations facture</Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Ref. facture : </Text>
              {invoice.reference}
            </Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Ref. commande : </Text>
              {order.reference}
            </Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Date d&apos;emission : </Text>
              {formatDate(invoice.issuedAt)}
            </Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Statut : </Text>
              {STATUS_LABELS[invoice.status]}
            </Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Mode de livraison : </Text>
              {resolveDeliveryMethodLabel(order)}
            </Text>
            {order.actualDelivery && (
              <Text style={s.metaCardLine}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Livree le : </Text>
                {formatDate(order.actualDelivery)}
              </Text>
            )}
            {order.paymentMethod && (
              <Text style={s.metaCardLine}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Mode de paiement : </Text>
                {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </Text>
            )}
          </View>
          <View style={s.metaCard}>
            <Text style={s.metaCardTitle}>Client</Text>
            {order.customer ? (
              <>
                <Text style={s.metaCardLineBold}>{order.customer.contactName}</Text>
                {order.customer.companyName && (
                  <Text style={s.metaCardLineGray}>{order.customer.companyName}</Text>
                )}
                {order.customer.whatsapp && (
                  <Text style={s.metaCardLineGray}>
                    WhatsApp : {formatWhatsapp(order.customer.whatsapp)}
                  </Text>
                )}
                {order.deliveryAddress && (
                  <Text style={s.metaCardLineGray}>{order.deliveryAddress}</Text>
                )}
              </>
            ) : (
              <Text style={s.metaCardLineGray}>Client non renseigne</Text>
            )}
          </View>
        </View>

        {/* Items table (if quote items available) */}
        {items.length > 0 ? (
          <>
            <View style={s.tableHeader}>
              <Text style={[s.thText, s.colProduct]}>Produit / Description</Text>
              <Text style={[s.thText, s.colQty]}>Qte</Text>
              <Text style={[s.thText, s.colUnit]}>P.U.</Text>
              <Text style={[s.thText, s.colTotal]}>Total HT</Text>
            </View>

            {items.map((item, i) => {
              const options = item.configSnapshot as Record<string, string>;
              const optionLine = [options.options, options.delai].filter(Boolean).join(" — ");
              return (
                <View key={item.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <View style={s.colProduct}>
                    <Text style={s.tdTextBold}>{item.productName}</Text>
                    {optionLine ? <Text style={s.tdTextGray}>{optionLine}</Text> : null}
                  </View>
                  <Text style={[s.tdText, s.colQty]}>{formatNumber(item.quantity)}</Text>
                  <Text style={[s.tdText, s.colUnit]}>{formatAmount(item.unitPrice)}</Text>
                  <Text style={[s.tdTextBold, s.colTotal]}>{formatAmount(item.totalPrice)}</Text>
                </View>
              );
            })}

            {/* Totals with discount */}
            <View style={s.totalsBlock}>
              {hasDiscount && quote && (
                <>
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Sous-total</Text>
                    <Text style={s.totalValue}>{formatAmount(quote.subtotal)}</Text>
                  </View>
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Remise ({quote.discountPercent}%)</Text>
                    <Text style={[s.totalValue, { color: "#16A34A" }]}>
                      -{" "}{formatAmount(quote.discountAmount)}
                    </Text>
                  </View>
                </>
              )}
              {!hasDiscount && (
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Sous-total produits</Text>
                  <Text style={s.totalValue}>{formatAmount(order.total)}</Text>
                </View>
              )}
              {deliveryFee > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Frais de livraison</Text>
                  <Text style={s.totalValue}>{formatAmount(deliveryFee)}</Text>
                </View>
              )}
              <View style={s.totalFinalRow}>
                <Text style={s.totalFinalLabel}>TOTAL FACTURE</Text>
                <Text style={s.totalFinalValue}>{formatAmount(clientTotal)}</Text>
              </View>
              {order.paidAmount > 0 && (
                <View style={[s.paymentRow, { backgroundColor: "#DCFCE7" }]}>
                  <Text style={[s.paymentLabel, { color: GREEN }]}>Montant recu</Text>
                  <Text style={[s.paymentValue, { color: GREEN }]}>{formatAmount(order.paidAmount)}</Text>
                </View>
              )}
              {!isFullyPaid && balance > 0 && (
                <View style={[s.paymentRow, { backgroundColor: "#FEF3C7" }]}>
                  <Text style={[s.paymentLabel, { color: AMBER }]}>Solde restant</Text>
                  <Text style={[s.paymentValue, { color: AMBER }]}>{formatAmount(balance)}</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          /* Pas de lignes de devis — résumé une ligne */
          <View style={s.totalsBlock}>
            {order.notes && (
              <View style={s.notesSection}>
                <Text style={s.notesSectionTitle}>Objet</Text>
                <View style={s.notesBox}>
                  <Text style={s.notesText}>{order.notes}</Text>
                </View>
              </View>
            )}
            {deliveryFee > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Sous-total produits</Text>
                <Text style={s.totalValue}>{formatAmount(order.total)}</Text>
              </View>
            )}
            {deliveryFee > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Frais de livraison</Text>
                <Text style={s.totalValue}>{formatAmount(deliveryFee)}</Text>
              </View>
            )}
            <View style={s.totalFinalRow}>
              <Text style={s.totalFinalLabel}>TOTAL FACTURE</Text>
              <Text style={s.totalFinalValue}>{formatAmount(clientTotal)}</Text>
            </View>
            {order.paidAmount > 0 && (
              <View style={[s.paymentRow, { backgroundColor: "#DCFCE7" }]}>
                <Text style={[s.paymentLabel, { color: GREEN }]}>Montant recu</Text>
                <Text style={[s.paymentValue, { color: GREEN }]}>{formatAmount(order.paidAmount)}</Text>
              </View>
            )}
            {!isFullyPaid && balance > 0 && (
              <View style={[s.paymentRow, { backgroundColor: "#FEF3C7" }]}>
                <Text style={[s.paymentLabel, { color: AMBER }]}>Solde restant</Text>
                <Text style={[s.paymentValue, { color: AMBER }]}>{formatAmount(balance)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Notes commande */}
        {items.length > 0 && order.notes && (
          <View style={s.notesSection}>
            <Text style={s.notesSectionTitle}>Notes</Text>
            <View style={s.notesBox}>
              <Text style={s.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Bande émetteur */}
        <View style={s.issuerBand}>
          <Text style={s.issuerText}>Facture emise par</Text>
          <Text style={s.issuerBold}>{companyName} — {companyTagline}</Text>
          <Text style={s.issuerText}>{companyEmail}</Text>
        </View>

        {/* Signature */}
        <PdfSignatureBlock />

        {/* Footer officiel */}
        <PdfFooter reference={invoice.reference} />
      </Page>
    </Document>
  );
}
