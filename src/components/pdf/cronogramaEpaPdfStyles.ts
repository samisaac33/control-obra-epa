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

/** Márgenes A4 apaisado (~10 mm horizontal, ~8 mm vertical). */
export const CRONOGRAMA_EPA_PAGE_PADDING = {
  horizontal: 28,
  vertical: 22,
} as const

export const cronogramaEpaPdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 6.5,
    color: "#000000",
    paddingHorizontal: CRONOGRAMA_EPA_PAGE_PADDING.horizontal,
    paddingVertical: CRONOGRAMA_EPA_PAGE_PADDING.vertical,
    backgroundColor: "#ffffff",
  },
  pageInner: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "100%",
  },
  topBlock: {
    flex: 1,
    flexDirection: "column",
    minHeight: 0,
  },
  main: {
    flex: 1,
    flexDirection: "column",
  },
  encabezadoWrap: {
    borderWidth: 0.5,
    borderColor: CRONOGRAMA_EPA_COLORS.border,
    borderBottomWidth: 0,
  },
  encTitleRow: {
    borderBottomWidth: 0.5,
    borderBottomColor: CRONOGRAMA_EPA_COLORS.border,
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  encTituloDoc: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  encObjeto: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    textAlign: "center",
    textTransform: "uppercase",
  },
  encMetaBlock: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  encLogoCol: {
    width: 54,
    borderRightWidth: 0.5,
    borderRightColor: CRONOGRAMA_EPA_COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
  },
  logoEpaEnc: {
    width: 48,
    height: 36,
    objectFit: "contain",
  },
  logoConsorcioEnc: {
    width: 44,
    height: 44,
    objectFit: "contain",
  },
  encMetaCenter: {
    flex: 1,
    flexDirection: "column",
  },
  encMetaRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: CRONOGRAMA_EPA_COLORS.border,
    minHeight: 11,
  },
  encMetaRowLast: {
    flexDirection: "row",
    minHeight: 11,
  },
  encCell: {
    paddingVertical: 1.5,
    paddingHorizontal: 2,
    fontSize: 5,
    borderRightWidth: 0.5,
    borderRightColor: CRONOGRAMA_EPA_COLORS.border,
    justifyContent: "center",
  },
  encCellLast: {
    paddingVertical: 1.5,
    paddingHorizontal: 2,
    fontSize: 5,
    justifyContent: "center",
  },
  table: {
    width: "100%",
    flex: 1,
    flexDirection: "column",
    borderWidth: 0.5,
    borderColor: CRONOGRAMA_EPA_COLORS.border,
    borderTopWidth: 0,
    minHeight: 0,
  },
  tableBodyFlex: {
    flex: 1,
    flexDirection: "column",
    minHeight: 0,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: CRONOGRAMA_EPA_COLORS.border,
  },
  rowData: {
    flexDirection: "row",
    flex: 1,
    minHeight: 11,
    alignItems: "stretch",
    borderBottomWidth: 0.5,
    borderBottomColor: CRONOGRAMA_EPA_COLORS.border,
  },
  rowLast: {
    flexDirection: "row",
  },
  cell: {
    paddingVertical: 1.5,
    paddingHorizontal: 1.5,
    fontSize: 5.5,
    justifyContent: "center",
    borderRightWidth: 0.5,
    borderRightColor: CRONOGRAMA_EPA_COLORS.border,
  },
  cellLast: {
    paddingVertical: 1.5,
    paddingHorizontal: 1.5,
    fontSize: 5.5,
    justifyContent: "center",
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
    marginTop: 6,
    paddingHorizontal: 4,
    flexShrink: 0,
  },
  firmaCol: {
    width: "30%",
    alignItems: "center",
  },
  firmaLinea: {
    borderTopWidth: 0.5,
    borderTopColor: CRONOGRAMA_EPA_COLORS.border,
    paddingTop: 2,
    marginBottom: 6,
    minHeight: 22,
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
