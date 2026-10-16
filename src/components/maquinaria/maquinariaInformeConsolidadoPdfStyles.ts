import { StyleSheet } from "@react-pdf/renderer"

export const PAGE_PADDING = 48

export const maquinariaInformeConsolidadoPdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    paddingTop: PAGE_PADDING,
    paddingBottom: PAGE_PADDING,
    paddingHorizontal: PAGE_PADDING,
    color: "#171717",
  },
  kicker: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#525252",
    textAlign: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    textAlign: "center",
    color: "#404040",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2,
    fontSize: 9,
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
    marginRight: 4,
  },
  metaBlock: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 6,
    marginTop: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#404040",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#404040",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
  },
  tableRowLast: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
  },
  headerCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  cell: {
    fontSize: 9,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  cellMono: {
    fontSize: 9,
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: "right",
  },
  colFrente: { width: "28%" },
  colHoras: { width: "18%" },
  colViajes: { width: "18%" },
  nota: {
    marginTop: 10,
    fontSize: 8,
    color: "#525252",
    lineHeight: 1.35,
  },
  footer: {
    marginTop: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#d4d4d4",
    fontSize: 8,
    color: "#737373",
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#737373",
  },
})
