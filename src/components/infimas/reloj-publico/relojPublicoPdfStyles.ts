import { StyleSheet } from "@react-pdf/renderer"

export const PAGE_PADDING = 72

export const relojPublicoPdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 12,
    lineHeight: 1.5,
    paddingTop: PAGE_PADDING,
    paddingBottom: PAGE_PADDING,
    paddingHorizontal: PAGE_PADDING,
    color: "#000000",
  },
  fecha: {
    marginBottom: 24,
  },
  destinatario: {
    fontFamily: "Times-Bold",
    marginBottom: 24,
    lineHeight: 1.35,
  },
  cuerpo: {
    textAlign: "justify",
    marginBottom: 12,
  },
  firmaBlock: {
    marginTop: 36,
  },
  firmaNombre: {
    fontFamily: "Times-Bold",
    marginTop: 48,
    marginBottom: 4,
  },
  firmaLinea: {
    marginBottom: 4,
  },
  pageNumber: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 11,
  },
  table: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#000000",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    backgroundColor: "#f0f0f0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  colSemana: {
    width: "18%",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    fontSize: 10,
  },
  colAnio: {
    width: "8%",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    fontSize: 10,
    textAlign: "center",
  },
  colActividad: {
    width: "37%",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    fontSize: 10,
    lineHeight: 1.35,
  },
  colObservacion: {
    width: "37%",
    padding: 4,
    fontSize: 10,
    lineHeight: 1.35,
  },
  headerCell: {
    fontFamily: "Times-Bold",
    fontSize: 10,
  },
})
