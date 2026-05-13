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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
    backgroundColor: GRAY_LIGHT,
  },
  colProduct: { flex: 4 },
  colQty: { flex: 1.2, textAlign: "right" },
  colUnit: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
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

function formatAmount(n: number): string {
  return n.toLocaleString("fr-SN") + " FCFA";
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

interface DevisPDFProps {
  quote: Quote & { items: QuoteItem[] };
  customerName?: string;
  customerCompany?: string;
  customerWhatsapp?: string;
  logoUrl?: string;
}

export function DevisPDF({
  quote,
  customerName,
  customerCompany,
  customerWhatsapp,
  logoUrl,
}: DevisPDFProps) {
  const hasDiscount = quote.discountPercent > 0;
  const validUntil = quote.validUntil
    ? formatDate(quote.validUntil)
    : addDays(quote.createdAt, 7);

  return (
    <Document
      title={`Devis ${quote.reference}`}
      author="GLOBAL TIC"
      subject="Devis imprimerie"
      creator="GLOBAL TIC"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          {logoUrl ? (
            <Image src={logoUrl} style={s.logo} />
          ) : (
            <Text style={s.companyName}>GLOBAL TIC</Text>
          )}
          <View style={s.companyBlock}>
            <Text style={s.companyName}>GLOBAL TIC</Text>
            <Text style={s.companyDetail}>Imprimerie Professionnelle</Text>
            <Text style={s.companyDetail}>Dakar, Sénégal</Text>
            <Text style={s.companyDetail}>+221 77 619 04 19</Text>
            <Text style={s.companyDetail}>contact@globalticgroup.com</Text>
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
                  <Text style={s.metaCardLineGray}>WhatsApp : {customerWhatsapp}</Text>
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
          const options = item.configSnapshot as Record<string, string>;
          const optionLine = [options.options, options.delai]
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
                {item.quantity.toLocaleString("fr-SN")}
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
                − {formatAmount(quote.discountAmount)}
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
            {[
              "Les prix indiqués sont des estimations basées sur les informations fournies et peuvent être révisés après validation du fichier.",
              "La production ne démarrera qu'après validation du Bon À Tirer (BAT) par le client.",
              "Les délais indiqués sont estimatifs et courent à partir de la validation du BAT.",
              "Les modalités de paiement seront confirmées lors de la validation de la commande.",
              `Ce devis est valable jusqu'au ${validUntil}.`,
            ].map((cond, i) => (
              <Text key={i} style={s.conditionItem}>
                • {cond}
              </Text>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            GLOBAL TIC — Imprimerie Professionnelle — Dakar, Sénégal
          </Text>
          <Text style={s.footerBrand}>{quote.reference}</Text>
        </View>
      </Page>
    </Document>
  );
}
