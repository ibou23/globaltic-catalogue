import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReportData } from "@/lib/types/reports";

const BRAND_PRIMARY   = "#529FD7";
const BRAND_SECONDARY = "#132034";
const GRAY_LIGHT      = "#F8FAFC";
const GRAY_BORDER     = "#E2E8F0";
const GRAY_TEXT       = "#64748B";
const GRAY_DARK       = "#1E293B";
const GREEN           = "#16A34A";
const AMBER           = "#D97706";
const RED             = "#DC2626";
const TEAL            = "#0D9488";

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  logo: { width: 120, height: 40, objectFit: "contain" },
  headerRight: { alignItems: "flex-end", gap: 2 },
  companyName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: BRAND_SECONDARY },
  companyDetail: { fontSize: 7.5, color: GRAY_TEXT },
  titleBand: {
    backgroundColor: BRAND_SECONDARY,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleBandLabel: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#FFFFFF", letterSpacing: 0.8 },
  titleBandSub: { fontSize: 8.5, color: BRAND_PRIMARY, fontFamily: "Helvetica-Bold" },
  // Section
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: BRAND_PRIMARY,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
    paddingBottom: 4,
  },
  // KPI grid
  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  kpiCard: {
    flex: 1,
    backgroundColor: GRAY_LIGHT,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    padding: 9,
  },
  kpiLabel: { fontSize: 7, color: GRAY_TEXT, marginBottom: 3 },
  kpiValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: GRAY_DARK },
  kpiSub:   { fontSize: 7, color: GRAY_TEXT, marginTop: 2 },
  kpiValueGreen: { fontSize: 14, fontFamily: "Helvetica-Bold", color: GREEN },
  kpiValueAmber: { fontSize: 14, fontFamily: "Helvetica-Bold", color: AMBER },
  kpiValueRed:   { fontSize: 14, fontFamily: "Helvetica-Bold", color: RED },
  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND_SECONDARY,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
    backgroundColor: GRAY_LIGHT,
  },
  th: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 0.3 },
  td: { fontSize: 8, color: GRAY_DARK },
  tdBold: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GRAY_DARK },
  tdGray: { fontSize: 7.5, color: GRAY_TEXT },
  tdGreen: { fontSize: 8, color: GREEN },
  tdRed: { fontSize: 8, color: RED },
  // Satisfaction
  satRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  satCard: { flex: 1, borderRadius: 5, padding: 8, alignItems: "center" },
  satLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  satValue: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  // Alert box
  alertBox: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 5,
    padding: 10,
    marginTop: 8,
  },
  alertText: { fontSize: 8, color: "#92400E" },
  alertTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#92400E", marginBottom: 3 },
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
  footerText:  { fontSize: 7, color: GRAY_TEXT },
  footerBrand: { fontSize: 7, fontFamily: "Helvetica-Bold", color: BRAND_PRIMARY },
  // Summary box
  summaryBox: {
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    backgroundColor: GRAY_LIGHT,
  },
  summaryLine: { fontSize: 8.5, color: GRAY_DARK, marginBottom: 4 },
  summaryKey:  { fontFamily: "Helvetica-Bold" },
  emptyText: { fontSize: 8, color: GRAY_TEXT, fontStyle: "italic" },
});

function formatN(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  en_attente:       "En attente",
  confirmee:        "Confirmée",
  bat_en_cours:     "BAT en cours",
  bat_valide:       "BAT validé",
  en_production:    "En production",
  controle_qualite: "Ctrl qualité",
  pret:             "Prête",
  en_livraison:     "En livraison",
  livre:            "Livrée",
  annulee:          "Annulée",
};

interface CompanyInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
}

interface RapportPDFProps {
  report: ReportData;
  company?: CompanyInfo;
  logoUrl?: string;
  showFinance?: boolean;
}

export function RapportPDF({ report, company, logoUrl, showFinance = true }: RapportPDFProps) {
  const companyName    = company?.name    ?? "GLOBAL TIC";
  const companyTagline = company?.tagline ?? "Imprimerie Professionnelle";
  const companyAddress = company?.address ?? "Dakar, Sénégal";
  const companyPhone   = company?.phone   ?? "+221 77 619 04 19";
  const companyEmail   = company?.email   ?? "contact@globalticgroup.com";

  const periodLabel = `${formatDate(report.period.from)} — ${formatDate(report.period.to)}`;
  const hasSatisfaction = report.satisfaitCount + report.neutreCount + report.insatisfaitCount > 0;
  const totalSat = report.satisfaitCount + report.neutreCount + report.insatisfaitCount;

  // Points d'attention
  const alerts: string[] = [];
  if (report.ordersSolde > 0)
    alerts.push(`Solde à encaisser : ${formatN(report.ordersSolde)} FCFA sur ${report.impayesOrders.length} commande(s)`);
  if (report.ordersReclamations > 0)
    alerts.push(`${report.ordersReclamations} réclamation(s) enregistrée(s) sur la période`);
  if (report.insatisfaitCount > 0)
    alerts.push(`${report.insatisfaitCount} client(s) insatisfait(s) signalé(s)`);
  if (report.tauxAcceptation < 50 && report.quotesCreated >= 5)
    alerts.push(`Taux d'acceptation devis faible : ${report.tauxAcceptation}% (objectif > 50%)`);

  return (
    <Document
      title={`Rapport d'activité — ${periodLabel}`}
      author={companyName}
      subject="Rapport d'activité"
      creator={companyName}
    >
      <Page size="A4" style={s.page}>

        {/* En-tête */}
        <View style={s.header}>
          {logoUrl ? (
            <Image src={logoUrl} style={s.logo} />
          ) : (
            <Text style={s.companyName}>{companyName}</Text>
          )}
          <View style={s.headerRight}>
            <Text style={s.companyName}>{companyName}</Text>
            <Text style={s.companyDetail}>{companyTagline}</Text>
            <Text style={s.companyDetail}>{companyAddress}</Text>
            <Text style={s.companyDetail}>{companyPhone}</Text>
            <Text style={s.companyDetail}>{companyEmail}</Text>
          </View>
        </View>

        {/* Bandeau titre */}
        <View style={s.titleBand}>
          <Text style={s.titleBandLabel}>RAPPORT D&apos;ACTIVITÉ</Text>
          <Text style={s.titleBandSub}>{periodLabel}</Text>
        </View>

        {/* Meta */}
        <View style={s.summaryBox}>
          <Text style={s.summaryLine}>
            <Text style={s.summaryKey}>Période : </Text>{periodLabel}
          </Text>
          <Text style={s.summaryLine}>
            <Text style={s.summaryKey}>Généré le : </Text>{formatDate(report.generatedAt)}
          </Text>
          <Text style={s.summaryLine}>
            <Text style={s.summaryKey}>Devis créés : </Text>{report.quotesCreated}
            {"  ·  "}
            <Text style={s.summaryKey}>Commandes : </Text>{report.ordersCreated}
            {"  ·  "}
            <Text style={s.summaryKey}>Livrées : </Text>{report.ordersLivrees}
          </Text>
          {showFinance && (
            <Text style={s.summaryLine}>
              <Text style={s.summaryKey}>CA commandes : </Text>{formatN(report.ordersCA)} FCFA
              {"  ·  "}
              <Text style={s.summaryKey}>Encaissé : </Text>{formatN(report.ordersEncaisse)} FCFA
              {"  ·  "}
              <Text style={s.summaryKey}>Solde : </Text>{formatN(report.ordersSolde)} FCFA
            </Text>
          )}
        </View>

        {/* ── Finance ── */}
        {showFinance && (
          <>
            <Text style={s.sectionTitle}>Résumé financier</Text>
            <View style={s.kpiRow}>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>CA commandes</Text>
                <Text style={s.kpiValueGreen}>{formatN(report.ordersCA)}</Text>
                <Text style={s.kpiSub}>FCFA</Text>
              </View>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>Montant encaissé</Text>
                <Text style={s.kpiValue}>{formatN(report.ordersEncaisse)}</Text>
                <Text style={s.kpiSub}>FCFA</Text>
              </View>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>Solde à encaisser</Text>
                <Text style={report.ordersSolde > 0 ? s.kpiValueAmber : s.kpiValue}>{formatN(report.ordersSolde)}</Text>
                <Text style={s.kpiSub}>FCFA</Text>
              </View>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>CA devis acceptés</Text>
                <Text style={s.kpiValue}>{formatN(report.quotesCA)}</Text>
                <Text style={s.kpiSub}>FCFA</Text>
              </View>
            </View>
          </>
        )}

        {/* ── Commercial ── */}
        <Text style={s.sectionTitle}>Résumé commercial</Text>
        <View style={s.kpiRow}>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Devis créés</Text>
            <Text style={s.kpiValue}>{report.quotesCreated}</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Devis acceptés</Text>
            <Text style={s.kpiValueGreen}>{report.quotesAccepted}</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Taux acceptation</Text>
            <Text style={report.tauxAcceptation >= 50 ? s.kpiValueGreen : s.kpiValueAmber}>
              {report.tauxAcceptation}%
            </Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Devis refusés</Text>
            <Text style={s.kpiValue}>{report.quotesRefused}</Text>
          </View>
        </View>

        {/* ── Production ── */}
        <Text style={s.sectionTitle}>Résumé production</Text>
        <View style={s.kpiRow}>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Commandes créées</Text>
            <Text style={s.kpiValue}>{report.ordersCreated}</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Livrées</Text>
            <Text style={s.kpiValueGreen}>{report.ordersLivrees}</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>En cours</Text>
            <Text style={s.kpiValue}>{report.ordersEnCours}</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Annulées</Text>
            <Text style={s.kpiValueRed}>{report.ordersAnnulees}</Text>
          </View>
        </View>

        {/* ── Satisfaction ── */}
        {hasSatisfaction && (
          <>
            <Text style={s.sectionTitle}>Satisfaction client</Text>
            <View style={s.satRow}>
              <View style={[s.satCard, { backgroundColor: "#F0FDF4" }]}>
                <Text style={[s.satLabel, { color: GREEN }]}>Satisfaits</Text>
                <Text style={[s.satValue, { color: GREEN }]}>{report.satisfaitCount}</Text>
                {totalSat > 0 && <Text style={[s.kpiSub, { color: GREEN }]}>{Math.round((report.satisfaitCount / totalSat) * 100)}%</Text>}
              </View>
              <View style={[s.satCard, { backgroundColor: GRAY_LIGHT }]}>
                <Text style={[s.satLabel, { color: GRAY_TEXT }]}>Neutres</Text>
                <Text style={[s.satValue, { color: GRAY_TEXT }]}>{report.neutreCount}</Text>
                {totalSat > 0 && <Text style={[s.kpiSub, { color: GRAY_TEXT }]}>{Math.round((report.neutreCount / totalSat) * 100)}%</Text>}
              </View>
              <View style={[s.satCard, { backgroundColor: "#FEF2F2" }]}>
                <Text style={[s.satLabel, { color: RED }]}>Insatisfaits</Text>
                <Text style={[s.satValue, { color: RED }]}>{report.insatisfaitCount}</Text>
                {totalSat > 0 && <Text style={[s.kpiSub, { color: RED }]}>{Math.round((report.insatisfaitCount / totalSat) * 100)}%</Text>}
              </View>
              <View style={[s.satCard, { backgroundColor: "#EFF6FF" }]}>
                <Text style={[s.satLabel, { color: BRAND_PRIMARY }]}>Réclamations</Text>
                <Text style={[s.satValue, { color: report.ordersReclamations > 0 ? RED : BRAND_PRIMARY }]}>{report.ordersReclamations}</Text>
              </View>
            </View>
          </>
        )}

        {/* ── Points d'attention ── */}
        {alerts.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Points d&apos;attention</Text>
            <View style={s.alertBox}>
              {alerts.map((a, i) => (
                <Text key={i} style={s.alertText}>• {a}</Text>
              ))}
            </View>
          </>
        )}

        {/* ── Top clients ── */}
        {report.topClients.length > 0 && showFinance && (
          <>
            <Text style={s.sectionTitle}>Top clients</Text>
            <View style={s.tableHeader}>
              <Text style={[s.th, { flex: 4 }]}>Client</Text>
              <Text style={[s.th, { flex: 1.5, textAlign: "center" }]}>Commandes</Text>
              <Text style={[s.th, { flex: 2.5, textAlign: "right" }]}>CA FCFA</Text>
              <Text style={[s.th, { flex: 2.5, textAlign: "right" }]}>Encaissé</Text>
            </View>
            {report.topClients.map((c, i) => (
              <View key={c.customerId} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <View style={{ flex: 4 }}>
                  <Text style={s.tdBold}>{c.name}</Text>
                  {c.company && <Text style={s.tdGray}>{c.company}</Text>}
                </View>
                <Text style={[s.td, { flex: 1.5, textAlign: "center" }]}>{c.ordersCount}</Text>
                <Text style={[s.tdBold, { flex: 2.5, textAlign: "right" }]}>{formatN(c.totalCA)}</Text>
                <Text style={[s.td, { flex: 2.5, textAlign: "right" }]}>{formatN(c.totalPaid)}</Text>
              </View>
            ))}
          </>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{companyName} — {companyTagline}</Text>
          <Text style={s.footerBrand}>Rapport généré le {formatDateShort(report.generatedAt)}</Text>
        </View>
      </Page>

      {/* Page 2 : Commandes importantes + Impayés + Réclamations */}
      {(report.topOrders.length > 0 || report.impayesOrders.length > 0 || report.reclamations.length > 0) && (
        <Page size="A4" style={s.page}>

          {/* Commandes importantes */}
          {report.topOrders.length > 0 && (
            <>
              <Text style={[s.sectionTitle, { marginTop: 0 }]}>Commandes de la période</Text>
              <View style={s.tableHeader}>
                <Text style={[s.th, { flex: 2 }]}>Réf.</Text>
                <Text style={[s.th, { flex: 3 }]}>Client</Text>
                <Text style={[s.th, { flex: 2 }]}>Statut</Text>
                {showFinance && <Text style={[s.th, { flex: 2, textAlign: "right" }]}>Total</Text>}
                {showFinance && <Text style={[s.th, { flex: 2, textAlign: "right" }]}>Payé</Text>}
              </View>
              {report.topOrders.map((o, i) => (
                <View key={o.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tdBold, { flex: 2 }]}>{o.reference}</Text>
                  <Text style={[s.td, { flex: 3 }]}>{o.customer ?? "—"}</Text>
                  <Text style={[s.tdGray, { flex: 2 }]}>{ORDER_STATUS_LABELS[o.status] ?? o.status}</Text>
                  {showFinance && <Text style={[s.tdBold, { flex: 2, textAlign: "right" }]}>{formatN(o.total)}</Text>}
                  {showFinance && (
                    <Text style={[o.paidAmount < o.total ? s.tdRed : s.tdGreen, { flex: 2, textAlign: "right" }]}>
                      {formatN(o.paidAmount)}
                    </Text>
                  )}
                </View>
              ))}
            </>
          )}

          {/* Impayés */}
          {report.impayesOrders.length > 0 && showFinance && (
            <>
              <Text style={s.sectionTitle}>Soldes restants à encaisser</Text>
              <View style={s.tableHeader}>
                <Text style={[s.th, { flex: 2 }]}>Réf.</Text>
                <Text style={[s.th, { flex: 3 }]}>Client</Text>
                <Text style={[s.th, { flex: 2 }]}>Statut</Text>
                <Text style={[s.th, { flex: 2.5, textAlign: "right" }]}>Solde FCFA</Text>
              </View>
              {report.impayesOrders.map((o, i) => (
                <View key={o.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tdBold, { flex: 2 }]}>{o.reference}</Text>
                  <Text style={[s.td, { flex: 3 }]}>{o.customer ?? "—"}</Text>
                  <Text style={[s.tdGray, { flex: 2 }]}>{ORDER_STATUS_LABELS[o.status] ?? o.status}</Text>
                  <Text style={[s.tdRed, { flex: 2.5, textAlign: "right", fontFamily: "Helvetica-Bold" }]}>
                    {formatN(o.total + o.deliveryFee - o.paidAmount)}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Réclamations */}
          {report.reclamations.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Réclamations</Text>
              <View style={s.tableHeader}>
                <Text style={[s.th, { flex: 2 }]}>Réf.</Text>
                <Text style={[s.th, { flex: 3 }]}>Client</Text>
                <Text style={[s.th, { flex: 2 }]}>Satisfaction</Text>
                <Text style={[s.th, { flex: 5 }]}>Détail</Text>
              </View>
              {report.reclamations.map((o, i) => (
                <View key={o.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tdBold, { flex: 2 }]}>{o.reference}</Text>
                  <Text style={[s.td, { flex: 3 }]}>{o.customer ?? "—"}</Text>
                  <Text style={[s.tdGray, { flex: 2 }]}>{o.satisfaction ?? "—"}</Text>
                  <Text style={[s.tdGray, { flex: 5 }]}>{o.complaint ? o.complaint.slice(0, 120) : "—"}</Text>
                </View>
              ))}
            </>
          )}

          {/* Footer */}
          <View style={s.footer} fixed>
            <Text style={s.footerText}>{companyName} — {companyTagline}</Text>
            <Text style={s.footerBrand}>Rapport généré le {formatDateShort(report.generatedAt)}</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
