import { Text, View, StyleSheet } from "@react-pdf/renderer";

const BRAND_SECONDARY = "#132034";
const GRAY_BORDER = "#E2E8F0";
const GRAY_TEXT = "#64748B";

const s = StyleSheet.create({
  container: {
    marginTop: 28,
  },
  row: {
    flexDirection: "row",
    gap: 24,
  },
  box: {
    flex: 1,
    borderWidth: 0.75,
    borderColor: GRAY_BORDER,
    borderRadius: 6,
    padding: 14,
    minHeight: 90,
  },
  title: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: BRAND_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 7.5,
    color: GRAY_TEXT,
    marginBottom: 24,
  },
  signatureLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_BORDER,
    marginTop: "auto",
    paddingBottom: 4,
  },
  signatureLabel: {
    fontSize: 6.5,
    color: GRAY_TEXT,
    marginTop: 4,
  },
});

export function PdfSignatureBlock() {
  return (
    <View style={s.container} wrap={false}>
      <View style={s.row}>
        <View style={s.box}>
          <Text style={s.title}>Le client</Text>
          <Text style={s.subtitle}>Bon pour accord</Text>
          <View style={s.signatureLine} />
          <Text style={s.signatureLabel}>Date et signature</Text>
        </View>
        <View style={s.box}>
          <Text style={s.title}>Pour GLOBAL TIC</Text>
          <Text style={s.subtitle}>Signature et cachet</Text>
          <View style={s.signatureLine} />
          <Text style={s.signatureLabel}>Date, signature et cachet</Text>
        </View>
      </View>
    </View>
  );
}
