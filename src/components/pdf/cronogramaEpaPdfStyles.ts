import { StyleSheet } from "@react-pdf/renderer"

/** Colores alineados al formato EPA / Excel de referencia. */
export const CRONOGRAMA_EPA_COLORS = {
  headBlue: "#d9e2f3",
  headDiasGreen: "#c6e0b4",
  headDiasSub: "#e2efda",
  sectionGray: "#f2f2f2",
  stripGray: "#f2f2f2",
  diasCell: "#eef7e8",
  border: "#000000",
  white: "#ffffff",
} as const

export const cronogramaEpaPdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 6,
    color: "#000000",
    padding: 8,
    backgroundColor: "#ffffff",
  },
  outerBorder: {
    borderWidth: 1,
    borderColor: CRONOGRAMA_EPA_COLORS.border,
    flex: 1,
    flexDirection: "row",
    padding: 2,
  },
  stripVertical: {
    width: 18,
    backgroundColor: CRONOGRAMA_EPA_COLORS.stripGray,
    borderWidth: 0.5,
    borderColor: CRONOGRAMA_EPA_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 3,
  },
  stripVerticalText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    textTransform: "uppercase",
    transform: "rotate(-90deg)",
    width: 120,
    textAlign: "center",
  },
  main: {
    flex: 1,
    flexDirection: "column",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 0.5,
    borderBottomColor: CRONOGRAMA_EPA_COLORS.border,
    paddingBottom: 3,
    marginBottom: 2,
  },
  logosLeft: {
    width: 72,
  },
  logoEpa: {
    width: 68,
    height: 22,
    objectFit: "contain",
    marginBottom: 2,
  },
  logoConsorcio: {
    width: 52,
    height: 28,
    objectFit: "contain",
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  objetoTitulo: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    textAlign: "center",
    textTransform: "uppercase",
  },
  metaLeft: {
    width: 118,
    fontSize: 5.5,
    paddingRight: 3,
  },
  metaLine: {
    marginBottom: 1,
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
  },
  metaRightTable: {
    width: 128,
    borderWidth: 0.5,
    borderColor: CRONOGRAMA_EPA_COLORS.border,
  },
  metaRightRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: CRONOGRAMA_EPA_COLORS.border,
  },
  metaRightRowLast: {
    flexDirection: "row",
  },
  metaRightLabel: {
    width: "52%",
    padding: 1.5,
    fontFamily: "Helvetica-Bold",
    fontSize: 5,
    borderRightWidth: 0.5,
    borderRightColor: CRONOGRAMA_EPA_COLORS.border,
  },
  metaRightValue: {
    flex: 1,
    padding: 1.5,
    fontSize: 5,
  },
  logoTopRight: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  table: {
    width: "100%",
    borderWidth: 0.5,
    borderColor: CRONOGRAMA_EPA_COLORS.border,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: CRONOGRAMA_EPA_COLORS.border,
  },
  rowLast: {
    flexDirection: "row",
  },
  cell: {
    paddingVertical: 1,
    paddingHorizontal: 1.5,
    fontSize: 5,
    borderRightWidth: 0.5,
    borderRightColor: CRONOGRAMA_EPA_COLORS.border,
  },
  cellLast: {
    paddingVertical: 1,
    paddingHorizontal: 1.5,
    fontSize: 5,
  },
  cellHeadBlue: {
    backgroundColor: CRONOGRAMA_EPA_COLORS.headBlue,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  cellHeadDiasGreen: {
    backgroundColor: CRONOGRAMA_EPA_COLORS.headDiasGreen,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  cellHeadDiasSub: {
    backgroundColor: CRONOGRAMA_EPA_COLORS.headDiasSub,
    textAlign: "center",
  },
  cellSection: {
    backgroundColor: CRONOGRAMA_EPA_COLORS.sectionGray,
    fontFamily: "Helvetica-Bold",
  },
  cellDias: {
    backgroundColor: CRONOGRAMA_EPA_COLORS.diasCell,
    textAlign: "right",
  },
  firmas: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  firmaCol: {
    width: "30%",
    alignItems: "center",
  },
  firmaLinea: {
    borderTopWidth: 0.5,
    borderTopColor: CRONOGRAMA_EPA_COLORS.border,
    paddingTop: 2,
    marginBottom: 10,
    minHeight: 28,
    width: "100%",
    textAlign: "center",
    fontSize: 5,
  },
  firmaRol: {
    fontFamily: "Helvetica-Bold",
    fontSize: 5.5,
    textAlign: "center",
  },
})

/** Anchos relativos de columnas (suma ≈ 100). */
export const CRONOGRAMA_EPA_COL_WIDTH = {
  rubro: 5,
  detalle: 38,
  unidad: 6,
  cant: 9,
  punit: 8,
  total: 10,
  d30: 12,
  d60: 12,
} as const
