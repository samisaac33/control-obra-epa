import { StyleSheet } from "@react-pdf/renderer"

export const PAGE_PADDING = 36

export const maquinariaInformeJimmyEquiposPdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.3,
    paddingTop: PAGE_PADDING,
    paddingBottom: PAGE_PADDING,
    paddingHorizontal: PAGE_PADDING,
    color: "#171717",
  },
  kicker: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#525252",
    textAlign: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
    fontSize: 8,
    gap: 4,
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
  },
  metaSep: {
    color: "#737373",
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
    fontSize: 7,
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  cell: {
    fontSize: 8,
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  cellMono: {
    fontSize: 8,
    paddingVertical: 4,
    paddingHorizontal: 3,
    textAlign: "right",
  },
  colFrente: { width: "28%" },
  colEquipo: { flexGrow: 1 },
  colTotal: { width: "8%" },
  nota: {
    marginTop: 8,
    fontSize: 7,
    color: "#525252",
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 7,
    color: "#737373",
  },
})
