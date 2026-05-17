import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Quote, QuoteItem } from "@/lib/types/domain";

Font.register({
  family: "Helvetica",
  fonts: [],
});

const BRAND_PRIMARY = "#529FD7";
const BRAND_SECONDARY = "#132034";
const GRAY_LIGHT = "#F8FAFC";
const GRAY_BORDER = "#E2E8F0";
const GRAY_TEXT = "#64748B";
const GRAY_DARK = "#1E293B";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: GRAY_DARK,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 48,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: "contain",
  },
  companyBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: BRAND_SECONDARY,
    marginBottom: 2,
  },
  companyDetail: {
    fontSize: 8,
    color: GRAY_TEXT,
  },
  // Title band
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
  titleBandRef: {
    fontSize: 10,
    color: BRAND_PRIMARY,
    fontFamily: "Helvetica-Bold",
  },
  // Meta row
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
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
  metaCardLine: {
    fontSize: 9,
    color: GRAY_DARK,
    marginBottom: 2,
  },
  metaCardLineBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: GRAY_DARK,
    marginBottom: 2,
  },
  metaCardLineGray: {
    fontSize: 8,
    color: GRAY_TEXT,
    marginBottom: 2,
  },
  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND_SECONDARY,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 0,
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
  colQty: { flex: 1.2, textAlign: "right", paddingLeft: 4 },
  colUnit: { flex: 1.8, textAlign: "right", paddingLeft: 8 },
  colTotal: { flex: 1.8, textAlign: "right", paddingLeft: 8 },
  thText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tdText: {
    fontSize: 9,
    color: GRAY_DARK,
  },
  tdTextBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: GRAY_DARK,
  },
  tdTextGray: {
    fontSize: 8,
    color: GRAY_TEXT,
  },
  // Totals
  totalsBlock: {
    alignItems: "flex-end",
    marginTop: 12,
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 8,
    color: GRAY_TEXT,
    width: 120,
    textAlign: "right",
  },
  totalValue: {
    fontSize: 8,
    color: GRAY_DARK,
    width: 90,
    textAlign: "right",
  },
  totalFinalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
    backgroundColor: BRAND_PRIMARY,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 6,
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
  // Notes
  notesSection: {
    marginBottom: 24,
  },
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
  notesText: {
    fontSize: 8.5,
    color: GRAY_DARK,
    lineHeight: 1.5,
  },
  // Conditions
  conditionsSection: {
    marginBottom: 0,
  },
  conditionsTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GRAY_TEXT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  conditionsList: {
    gap: 2,
  },
  conditionItem: {
    fontSize: 7.5,
    color: GRAY_TEXT,
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: GRAY_BORDER,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: GRAY_TEXT,
  },
  footerBrand: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BRAND_PRIMARY,
  },
  urgentBadge: {
    backgroundColor: "#FEE2E2",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  urgentText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#DC2626",
    textTransform: "uppercase",
  },
});

// toLocaleString("fr-SN") uses U+202F (narrow no-break space) as thousands separator,
// which react-pdf's built-in Helvetica renders as "/". Use plain ASCII space instead.
function formatNumber(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatAmount(n: number): string {
  return formatNumber(n) + " FCFA";
}

function formatWhatsapp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // 12 chiffres avec indicatif 221 : 221XXXXXXXXX → +221 XX XXX XX XX
  if (digits.startsWith("221") && digits.length === 12) {
    return `+221 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  // 9 chiffres locaux sénégalais sans indicatif : XXXXXXXXX → +221 XX XXX XX XX
  if (digits.length === 9) {
    return `+221 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  }
  // Fallback : conserver le numéro original s'il est déjà formaté, sinon préfixer +
  return phone.startsWith("+") ? phone : `+${digits}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface CompanyInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
}

interface DevisPDFProps {
  quote: Quote & { items: QuoteItem[] };
  customerName?: string;
  customerCompany?: string;
  customerWhatsapp?: string;
  logoUrl?: string;
  company?: CompanyInfo;
  pdfConditions?: string[];
  pdfFooterText?: string;
}

export function DevisPDF({
  quote,
  customerName,
  customerCompany,
  customerWhatsapp,
  logoUrl,
  company,
  pdfConditions,
  pdfFooterText,
}: DevisPDFProps) {
  const companyName    = company?.name    ?? "GLOBAL TIC";
  const companyTagline = company?.tagline ?? "Imprimerie Professionnelle";
  const companyAddress = company?.address ?? "Dakar, Sénégal";
  const companyPhone   = company?.phone   ?? "+221 77 619 04 19";
  const companyEmail   = company?.email   ?? "contact@globalticgroup.com";
  const footerText     = pdfFooterText    ?? `${companyName} — ${companyTagline} — ${companyAddress}`;
  const conditions     = pdfConditions && pdfConditions.length > 0 ? pdfConditions : [
    "Les délais de production sont donnés à titre indicatif et commencent à courir après validation définitive de la commande.",
    "Les modalités de paiement sont les suivantes : 50 % d'acompte à la validation de la commande, le solde restant étant payable à la livraison.",
  ];

  const hasDiscount = quote.discountPercent > 0;
  const validUntil = quote.validUntil
    ? formatDate(quote.validUntil)
    : addDays(quote.createdAt, 30);

  return (
    <Document
      title={`Devis ${quote.reference}`}
      author={companyName}
      subject="Devis imprimerie"
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={s.titleBandLabel}>DEVIS</Text>
            {quote.isUrgent && (
              <View style={s.urgentBadge}>
                <Text style={s.urgentText}>Urgent</Text>
              </View>
            )}
          </View>
          <Text style={s.titleBandRef}>{quote.reference}</Text>
        </View>

        {/* Meta row: dates + client */}
        <View style={s.metaRow}>
          <View style={s.metaCard}>
            <Text style={s.metaCardTitle}>Informations devis</Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Date : </Text>
              {formatDate(quote.createdAt)}
            </Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Valable jusqu&apos;au : </Text>
              {validUntil}
            </Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Statut : </Text>
              Devis estimatif
            </Text>
          </View>
          <View style={s.metaCard}>
            <Text style={s.metaCardTitle}>Client</Text>
            {customerName ? (
              <>
                <Text style={s.metaCardLineBold}>{customerName}</Text>
                {customerCompany && (
                  <Text style={s.metaCardLineGray}>{customerCompany}</Text>
                )}
                {customerWhatsapp && (
                  <Text style={s.metaCardLineGray}>WhatsApp : {formatWhatsapp(customerWhatsapp)}</Text>
                )}
              </>
            ) : (
              <Text style={s.metaCardLineGray}>—</Text>
            )}
          </View>
        </View>

        {/* Items table */}
        <View style={s.tableHeader}>
          <Text style={[s.thText, s.colProduct]}>Produit / Description</Text>
          <Text style={[s.thText, s.colQty]}>Qté</Text>
          <Text style={[s.thText, s.colUnit]}>P.U.</Text>
          <Text style={[s.thText, s.colTotal]}>Total HT</Text>
        </View>

        {quote.items.map((item, i) => {
          const snap = item.configSnapshot as Record<string, string>;
          const optionLine = [
            snap.options,
            snap.format,
            snap.finition,
            snap.couleurs,
            snap.sizes,
            snap.markingPosition,
            snap.dimensions,
            snap.delai,
          ]
            .filter(Boolean)
            .join(" — ");
          return (
            <View key={item.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <View style={s.colProduct}>
                <Text style={s.tdTextBold}>{item.productName}</Text>
                {optionLine ? (
                  <Text style={s.tdTextGray}>{optionLine}</Text>
                ) : null}
              </View>
              <Text style={[s.tdText, s.colQty]}>
                {formatNumber(item.quantity)}
              </Text>
              <Text style={[s.tdText, s.colUnit]}>
                {formatAmount(item.unitPrice)}
              </Text>
              <Text style={[s.tdTextBold, s.colTotal]}>
                {formatAmount(item.totalPrice)}
              </Text>
            </View>
          );
        })}

        {/* Totals */}
        <View style={s.totalsBlock}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Sous-total</Text>
            <Text style={s.totalValue}>{formatAmount(quote.subtotal)}</Text>
          </View>
          {hasDiscount && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Remise ({quote.discountPercent}%)</Text>
              <Text style={[s.totalValue, { color: "#16A34A" }]}>
                -{" "}{formatAmount(quote.discountAmount)}
              </Text>
            </View>
          )}
          <View style={s.totalFinalRow}>
            <Text style={s.totalFinalLabel}>TOTAL ESTIMATIF</Text>
            <Text style={s.totalFinalValue}>{formatAmount(quote.total)}</Text>
          </View>
        </View>

        {/* Notes client */}
        {quote.notes && (
          <View style={s.notesSection}>
            <Text style={s.notesSectionTitle}>Notes</Text>
            <View style={s.notesBox}>
              <Text style={s.notesText}>{quote.notes}</Text>
            </View>
          </View>
        )}

        {/* Conditions */}
        <View style={s.conditionsSection}>
          <Text style={s.conditionsTitle}>Conditions générales</Text>
          <View style={s.conditionsList}>
            {conditions.map((cond, i) => (
              <Text key={i} style={s.conditionItem}>
                • {cond}
              </Text>
            ))}
            <Text style={s.conditionItem}>
              • Ce devis est valable jusqu&apos;au {validUntil}.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{footerText}</Text>
          <Text style={s.footerBrand}>{quote.reference}</Text>
        </View>
      </Page>
    </Document>
  );
}
