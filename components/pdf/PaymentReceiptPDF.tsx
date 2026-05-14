import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { OrderEnriched } from "@/lib/types/domain";

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
  // Payment summary table
  summarySection: {
    marginBottom: 20,
  },
  summarySectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GRAY_TEXT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  summaryRowAlt: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
    backgroundColor: GRAY_LIGHT,
  },
  summaryLabel: {
    fontSize: 9,
    color: GRAY_TEXT,
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: GRAY_DARK,
  },
  // Montant reçu — ligne mise en avant
  summaryHighlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: BRAND_PRIMARY,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  summaryHighlightLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  summaryHighlightValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  // Solde restant
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  // Statut banner
  statusBanner: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  statusBannerText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  // Note paiement
  noteSection: {
    marginBottom: 20,
  },
  noteSectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: BRAND_PRIMARY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  noteBox: {
    backgroundColor: GRAY_LIGHT,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    padding: 10,
  },
  noteText: {
    fontSize: 8.5,
    color: GRAY_DARK,
    lineHeight: 1.5,
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
});

// Même utilitaire que DevisPDF — Helvetica n'accepte pas U+202F
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
  if (digits.startsWith("221") && digits.length === 12)
    return `+221 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  if (digits.length === 9)
    return `+221 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  wave:         "Wave",
  orange_money: "Orange Money",
  especes:      "Especes",
  virement:     "Virement bancaire",
  cheque:       "Cheque",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  non_paye:  "Non paye",
  acompte:   "Acompte",
  paye:      "Paiement complet",
  rembourse: "Rembourse",
};

interface PaymentReceiptPDFProps {
  order: OrderEnriched;
  logoUrl?: string;
}

export function PaymentReceiptPDF({ order, logoUrl }: PaymentReceiptPDFProps) {
  const balance     = order.total - order.paidAmount;
  const isFullyPaid = balance <= 0;
  const paymentDate = order.lastPaymentAt ?? order.createdAt;

  return (
    <Document
      title={`Recu de paiement ${order.reference}`}
      author="GLOBAL TIC"
      subject="Recu de paiement"
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
            <Text style={s.companyDetail}>Dakar, Senegal</Text>
            <Text style={s.companyDetail}>+221 77 619 04 19</Text>
            <Text style={s.companyDetail}>contact@globalticgroup.com</Text>
          </View>
        </View>

        {/* Title band */}
        <View style={s.titleBand}>
          <Text style={s.titleBandLabel}>RECU DE PAIEMENT</Text>
          <Text style={s.titleBandRef}>{order.reference}</Text>
        </View>

        {/* Meta row: paiement + client */}
        <View style={s.metaRow}>
          <View style={s.metaCard}>
            <Text style={s.metaCardTitle}>Informations paiement</Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Date : </Text>
              {formatDate(paymentDate)}
            </Text>
            <Text style={s.metaCardLine}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Statut : </Text>
              {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
            </Text>
            {order.paymentMethod && (
              <Text style={s.metaCardLine}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Mode : </Text>
                {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </Text>
            )}
            {order.paymentReference && (
              <Text style={s.metaCardLine}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Ref. transaction : </Text>
                {order.paymentReference}
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
              </>
            ) : (
              <Text style={s.metaCardLineGray}>Client non renseigne</Text>
            )}
          </View>
        </View>

        {/* Résumé financier */}
        <View style={s.summarySection}>
          <Text style={s.summarySectionTitle}>Detail du paiement</Text>

          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Montant total de la commande</Text>
            <Text style={s.summaryValue}>{formatAmount(order.total)}</Text>
          </View>

          {/* Montant reçu — mis en avant */}
          <View style={s.summaryHighlightRow}>
            <Text style={s.summaryHighlightLabel}>Montant recu</Text>
            <Text style={s.summaryHighlightValue}>{formatAmount(order.paidAmount)}</Text>
          </View>

          {/* Solde restant */}
          <View style={[
            s.balanceRow,
            { backgroundColor: isFullyPaid ? "#DCFCE7" : "#FEF3C7" },
          ]}>
            <Text style={[s.summaryLabel, { color: isFullyPaid ? GREEN : AMBER, fontFamily: "Helvetica-Bold" }]}>
              Solde restant
            </Text>
            <Text style={[s.summaryValue, { color: isFullyPaid ? GREEN : AMBER }]}>
              {formatAmount(Math.max(0, balance))}
            </Text>
          </View>
        </View>

        {/* Bannière statut */}
        <View style={[
          s.statusBanner,
          { backgroundColor: isFullyPaid ? "#DCFCE7" : "#FEF3C7" },
        ]}>
          <Text style={[
            s.statusBannerText,
            { color: isFullyPaid ? GREEN : AMBER },
          ]}>
            {isFullyPaid
              ? "Commande entierement reglee"
              : `Solde restant a payer : ${formatAmount(balance)}`}
          </Text>
        </View>

        {/* Note paiement */}
        {order.paymentNote && (
          <View style={s.noteSection}>
            <Text style={s.noteSectionTitle}>Note</Text>
            <View style={s.noteBox}>
              <Text style={s.noteText}>{order.paymentNote}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            GLOBAL TIC — Imprimerie Professionnelle — Dakar, Senegal
          </Text>
          <Text style={s.footerBrand}>{order.reference}</Text>
        </View>

      </Page>
    </Document>
  );
}
