import { Text, View, StyleSheet } from "@react-pdf/renderer";

const BRAND_SECONDARY = "#132034";
const GRAY_BORDER = "#E2E8F0";
const GRAY_TEXT = "#64748B";

const s = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 20,
    left: 48,
    right: 48,
    borderTopWidth: 0.75,
    borderTopColor: GRAY_BORDER,
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  text: {
    fontSize: 6.5,
    color: GRAY_TEXT,
  },
  separator: {
    fontSize: 6.5,
    color: GRAY_BORDER,
    marginHorizontal: 6,
  },
  textBold: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: BRAND_SECONDARY,
  },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  refText: {
    fontSize: 6,
    color: GRAY_TEXT,
  },
});

interface PdfFooterProps {
  reference: string;
}

export function PdfFooter({ reference }: PdfFooterProps) {
  return (
    <View style={s.footer} fixed>
      <View style={s.row}>
        <Text style={s.textBold}>www.globalticgroup.com</Text>
        <Text style={s.separator}>|</Text>
        <Text style={s.text}>contact@globalticgroup.com</Text>
        <Text style={s.separator}>|</Text>
        <Text style={s.text}>+221 77 619 04 19</Text>
      </View>
      <View style={s.row}>
        <Text style={s.text}>NINEA : 009751505</Text>
        <Text style={s.separator}>|</Text>
        <Text style={s.text}>RCCM : SN.DKR.2022.A.33978</Text>
        <Text style={s.separator}>|</Text>
        <Text style={s.text}>Compte : SN08 SN19 1010 0101 0828 8835 9454</Text>
      </View>
      <View style={s.refRow}>
        <Text style={s.refText}>GLOBAL TIC — Imprimerie Professionnelle — Dakar, Senegal</Text>
        <Text style={s.refText}>{reference}</Text>
      </View>
    </View>
  );
}
