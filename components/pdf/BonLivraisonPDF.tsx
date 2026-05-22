import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { OrderEnriched, Quote, QuoteItem } from "@/lib/types/domain";
import { PdfFooter } from "./PdfFooter";

const BRAND_PRIMARY   = "#529FD7";
const BRAND_SECONDARY = "#132034";
const GRAY_LIGHT      = "#F8FAFC";
const GRAY_BORDER     = "#E2E8F0";
const GRAY_TEXT       = "#64748B";
const GRAY_DARK       = "#1E293B";

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
  titleBandRef: { fontSize: 10, color: BRAND_PRIMARY, fontFamily: "Helvetica-Bold" },
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
  metaCardLine: { fontSize: 9, color: GRAY_DARK, marginBottom: 2 },
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
  colProduct: { flex: 5 },
  colQty:     { flex: 1.5, textAlign: "right", paddingLeft: 4 },
  colCheck:   { flex: 1.5, textAlign: "center", paddingLeft: 4 },
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
  // Single item line (no quote)
  singleItemBox: {
    backgroundColor: GRAY_LIGHT,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    padding: 14,
    marginBottom: 24,
  },
  singleItemText: { fontSize: 9, color: GRAY_DARK, lineHeight: 1.5 },
  // Signature zones
  signaturesRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 32,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 6,
    padding: 12,
    minHeight: 80,
  },
  signatureTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GRAY_TEXT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  signatureHint: { fontSize: 7, color: GRAY_BORDER },
  // (footer handled by PdfFooter component)
});

function formatNumber(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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

interface BonLivraisonPDFProps {
  order: OrderEnriched;
  quote?: (Quote & { items: QuoteItem[] }) | null;
  logoUrl?: string;
  company?: CompanyInfo;
  pdfFooterText?: string;
  blRef: string;
}

export function BonLivraisonPDF({ order, quote, logoUrl, company, blRef }: BonLivraisonPDFProps) {
  const companyName    = company?.name    ?? "GLOBAL TIC";
  const companyTagline = company?.tagline ?? "Imprimerie Professionnelle";
  const companyAddress = company?.address ?? "Dakar, Senegal";
  const companyPhone   = company?.phone   ?? "+221 77 619 04 19";
  const companyEmail   = company?.email   ?? "contact@globalticgroup.com";

  const items = quote?.items ?? [];

  return (
    <Document
      title={`Bon de livraison ${blRef}`}
      author={companyName}
      subject="Bon de livraison"
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
          <Text style={s.titleBandLabel}>BON DE LIVRAISON</Text>
          <Text style={s.titleBandRef}>{blRef}</Text>
        </View>

        {/* Meta row */}
        <View style={s.metaRow}>
          <View style={s.metaCard}>
            <Text style={s.metaCardTitle}>Informations livraison</Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>N° commande : </Text>
              {order.reference}
            </Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Date : </Text>
              {formatDate(order.createdAt)}
            </Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Mode de livraison : </Text>
              {resolveDeliveryMethodLabel(order)}
            </Text>
            {order.estimatedDelivery && (
              <Text style={s.metaCardLine}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Date prevue : </Text>
                {formatDate(order.estimatedDelivery)}
              </Text>
            )}
            {order.actualDelivery && (
              <Text style={s.metaCardLine}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Date effective : </Text>
                {formatDate(order.actualDelivery)}
              </Text>
            )}
            {order.deliveryDriver && (
              <Text style={s.metaCardLine}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Livreur : </Text>
                {order.deliveryDriver}
              </Text>
            )}
            {order.deliveryFee > 0 && (
              <Text style={s.metaCardLine}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Frais de livraison : </Text>
                {formatNumber(order.deliveryFee)} FCFA
              </Text>
            )}
          </View>
          <View style={s.metaCard}>
            <Text style={s.metaCardTitle}>Destinataire</Text>
            {order.deliveryRecipientName ? (
              <Text style={s.metaCardLineBold}>{order.deliveryRecipientName}</Text>
            ) : order.customer ? (
              <Text style={s.metaCardLineBold}>{order.customer.contactName}</Text>
            ) : null}
            {order.customer?.companyName && (
              <Text style={s.metaCardLineGray}>{order.customer.companyName}</Text>
            )}
            {order.deliveryRecipientPhone ? (
              <Text style={s.metaCardLineGray}>
                Tel : {order.deliveryRecipientPhone}
              </Text>
            ) : order.customer?.whatsapp ? (
              <Text style={s.metaCardLineGray}>
                WhatsApp : {formatWhatsapp(order.customer.whatsapp)}
              </Text>
            ) : null}
            {order.deliveryAddress ? (
              <Text style={s.metaCardLineGray}>{order.deliveryAddress}</Text>
            ) : (
              <Text style={s.metaCardLineGray}>Adresse : —</Text>
            )}
            {order.deliveryNotes && (
              <Text style={s.metaCardLineGray}>Note : {order.deliveryNotes}</Text>
            )}
            {!order.deliveryRecipientName && !order.customer && (
              <Text style={s.metaCardLineGray}>Destinataire non renseigne</Text>
            )}
          </View>
        </View>

        {/* Articles */}
        {items.length > 0 ? (
          <>
            <View style={s.tableHeader}>
              <Text style={[s.thText, s.colProduct]}>Produit / Description</Text>
              <Text style={[s.thText, s.colQty]}>Quantite</Text>
              <Text style={[s.thText, s.colCheck]}>Lu / Verifie</Text>
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
                  <Text style={[s.tdText, s.colCheck]}> </Text>
                </View>
              );
            })}
          </>
        ) : order.notes ? (
          <View style={s.singleItemBox}>
            <Text style={s.singleItemText}>{order.notes}</Text>
          </View>
        ) : null}

        {/* Signature zones */}
        <View style={s.signaturesRow}>
          <View style={s.signatureBox}>
            <Text style={s.signatureTitle}>Signature livreur</Text>
            <Text style={s.signatureHint}>Nom et signature</Text>
          </View>
          <View style={s.signatureBox}>
            <Text style={s.signatureTitle}>Signature client / Cachet</Text>
            <Text style={s.signatureHint}>Lu et approuve</Text>
          </View>
        </View>

        {/* Footer officiel */}
        <PdfFooter reference={blRef} />
      </Page>
    </Document>
  );
}
