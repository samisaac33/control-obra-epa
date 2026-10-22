import { StyleSheet } from "@react-pdf/renderer"

export const dailyReportCgePdfStyles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.35,
  },
  membrete: {
    textAlign: "center",
    marginBottom: 8,
  },
  membreteTitulo: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  membreteSub: {
    fontSize: 8,
    marginTop: 2,
  },
  tituloDocumento: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginVertical: 10,
  },
  meta: {
    marginBottom: 8,
    fontSize: 8,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    marginTop: 8,
    marginBottom: 4,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  rowLast: {
    flexDirection: "row",
  },
  headerCell: {
    flex: 1,
    padding: 4,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#eee",
    fontSize: 7,
  },
  cell: {
    flex: 1,
    padding: 4,
    fontSize: 7,
  },
  firmas: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  firmaCol: {
    width: "30%",
    textAlign: "center",
  },
  firmaLinea: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    marginTop: 36,
    paddingTop: 4,
    fontSize: 7,
  },
})
