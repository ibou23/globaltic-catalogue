import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { PdfFooter } from "./PdfFooter";

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
  companyName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: BRAND_SECONDARY, marginBottom: 2 },
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
  titleBandLabel: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#FFFFFF", letterSpacing: 1 },
  titleBandRef: { fontSize: 10, color: BRAND_PRIMARY, fontFamily: "Helvetica-Bold" },
  metaRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  metaCard: { flex: 1, backgroundColor: GRAY_LIGHT, borderRadius: 6, padding: 12 },
  metaTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", color: GRAY_TEXT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  metaLine: { fontSize: 8.5, marginBottom: 3, color: GRAY_DARK },
  metaLabel: { color: GRAY_TEXT },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND_SECONDARY,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  tableHeaderText: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 0.5, borderBottomColor: GRAY_BORDER },
  colProduct: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colUnit: { flex: 1.2, textAlign: "right" },
  colTotal: { flex: 1.2, textAlign: "right" },
  totalSection: { marginTop: 16, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", paddingVertical: 4, gap: 24 },
  totalLabel: { fontSize: 9, color: GRAY_TEXT, width: 100, textAlign: "right" },
  totalValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: GRAY_DARK, width: 100, textAlign: "right" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: BRAND_SECONDARY,
    borderRadius: 4,
    marginTop: 4,
    gap: 24,
  },
  grandTotalLabel: { fontSize: 10, color: BRAND_PRIMARY, fontFamily: "Helvetica-Bold", width: 100, textAlign: "right" },
  grandTotalValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#FFFFFF", width: 100, textAlign: "right" },
  noticeBox: {
    marginTop: 24,
    backgroundColor: "#FEF9C3",
    borderRadius: 6,
    padding: 12,
    borderWidth: 0.5,
    borderColor: "#FDE047",
  },
  noticeText: { fontSize: 7.5, color: "#92400E", lineHeight: 1.5 },
  conditionsSection: { marginTop: 20 },
  conditionsTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: BRAND_SECONDARY, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  conditionLine: { fontSize: 7.5, color: GRAY_TEXT, marginBottom: 4, lineHeight: 1.4 },
});

function formatNumber(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
function formatAmount(n: number): string {
  return formatNumber(n) + " FCFA";
}

export interface EstimateData {
  reference: string;
  date: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  turnaroundDays: number;
  options: string[];
}

interface PublicEstimatePDFProps {
  data: EstimateData;
  logoUrl?: string;
}

export function PublicEstimatePDF({ data, logoUrl }: PublicEstimatePDFProps) {
  return (
    <Document>
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
          <Text style={s.titleBandLabel}>DEVIS ESTIMATIF</Text>
          <Text style={s.titleBandRef}>{data.reference}</Text>
        </View>

        {/* Meta cards */}
        <View style={s.metaRow}>
          <View style={s.metaCard}>
            <Text style={s.metaTitle}>Informations</Text>
            <Text style={s.metaLine}><Text style={s.metaLabel}>Date : </Text>{data.date}</Text>
            <Text style={s.metaLine}><Text style={s.metaLabel}>Produit : </Text>{data.productName}</Text>
            <Text style={s.metaLine}>
              <Text style={s.metaLabel}>Delai estime : </Text>~{data.turnaroundDays} jours ouvres
            </Text>
          </View>
          <View style={s.metaCard}>
            <Text style={s.metaTitle}>Configuration</Text>
            <Text style={s.metaLine}>
              <Text style={s.metaLabel}>Quantite : </Text>{formatNumber(data.quantity)} exemplaires
            </Text>
            {data.options.map((opt, i) => (
              <Text key={i} style={s.metaLine}>
                <Text style={s.metaLabel}>Option : </Text>{opt}
              </Text>
            ))}
          </View>
        </View>

        {/* Table */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colProduct]}>Designation</Text>
          <Text style={[s.tableHeaderText, s.colQty]}>Qte</Text>
          <Text style={[s.tableHeaderText, s.colUnit]}>P.U.</Text>
          <Text style={[s.tableHeaderText, s.colTotal]}>Total</Text>
        </View>

        <View style={s.tableRow}>
          <View style={s.colProduct}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9 }}>{data.productName}</Text>
            {data.options.length > 0 && (
              <Text style={{ fontSize: 7.5, color: GRAY_TEXT, marginTop: 2 }}>
                {data.options.join(" — ")}
              </Text>
            )}
          </View>
          <Text style={[{ fontSize: 9 }, s.colQty]}>{formatNumber(data.quantity)}</Text>
          <Text style={[{ fontSize: 9 }, s.colUnit]}>{formatAmount(data.unitPrice)}</Text>
          <Text style={[{ fontSize: 9, fontFamily: "Helvetica-Bold" }, s.colTotal]}>{formatAmount(data.totalPrice)}</Text>
        </View>

        {/* Total section */}
        <View style={s.totalSection}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Sous-total</Text>
            <Text style={s.totalValue}>{formatAmount(data.totalPrice)}</Text>
          </View>
          <View style={s.grandTotalRow}>
            <Text style={s.grandTotalLabel}>TOTAL ESTIMATIF</Text>
            <Text style={s.grandTotalValue}>{formatAmount(data.totalPrice)}</Text>
          </View>
        </View>

        {/* Notice */}
        <View style={s.noticeBox}>
          <Text style={s.noticeText}>
            Devis sans engagement. Ce devis est genere automatiquement a partir de votre configuration en ligne. Le prix final peut varier selon les fichiers, finitions, contraintes techniques et disponibilite.
          </Text>
        </View>

        {/* Conditions */}
        <View style={s.conditionsSection}>
          <Text style={s.conditionsTitle}>Conditions</Text>
          <Text style={s.conditionLine}>
            {"•"} Ce devis est genere automatiquement depuis le catalogue en ligne GLOBAL TIC.
          </Text>
          <Text style={s.conditionLine}>
            {"•"} La validation finale se fait apres echange avec l equipe GLOBAL TIC.
          </Text>
          <Text style={s.conditionLine}>
            {"•"} Le delai de production court apres validation des fichiers et paiement de l acompte.
          </Text>
          <Text style={s.conditionLine}>
            {"•"} Livraison Dakar disponible (48h apres production). Regions sur devis.
          </Text>
        </View>

        <PdfFooter reference={data.reference} />
      </Page>
    </Document>
  );
}
