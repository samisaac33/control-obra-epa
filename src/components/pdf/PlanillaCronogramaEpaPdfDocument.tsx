import { Document, Page, Text, View } from "@react-pdf/renderer"
import type { ReactNode } from "react"

import type { LogosCronogramaEpaPdf } from "@/lib/planilla/cronograma-epa-logos-pdf"
import {
  formatearNumeroCronograma,
  formatearUsdCronograma,
} from "@/src/lib/planilla-cronograma-valorado-formato"
import type { ResumenCronogramaEpa } from "@/src/lib/planilla-cronograma-epa"

import { CronogramaEpaEncabezadoPdf } from "./CronogramaEpaEncabezadoPdf"
import {
  CRONOGRAMA_EPA_COL_WIDTH as W,
  CRONOGRAMA_EPA_COLORS,
  cronogramaEpaPdfStyles as styles,
} from "./cronogramaEpaPdfStyles"

type Props = {
  programado: ResumenCronogramaEpa
  ejecutado: ResumenCronogramaEpa
  firmaContratista?: string
  logos: LogosCronogramaEpaPdf
}

function Cell({
  flex,
  children,
  style,
  last,
}: {
  flex: number
  children: ReactNode
  style?: object | object[]
  last?: boolean
}) {
  return (
    <View style={[{ flex }, last ? styles.cellLast : styles.cell, ...(Array.isArray(style) ? style : style ? [style] : [])]}>
      {typeof children === "string" ? <Text>{children}</Text> : children}
    </View>
  )
}

function CronogramaEpaPdfPage({
  datos,
  firmaContratista,
  logos,
}: {
  datos: ResumenCronogramaEpa
  firmaContratista?: string
  logos: LogosCronogramaEpaPdf
}) {
  const e = datos.encabezado
  const [d1, d2] = e.etiquetasDias
  const wDetalleSeccion = W.detalle + W.unidad + W.cant + W.punit

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.main}>
        <CronogramaEpaEncabezadoPdf encabezado={e} logos={logos} />

        <View style={styles.table}>
            <View style={[styles.row, { alignItems: "stretch", minHeight: 18 }]}>
              <Cell flex={W.rubro} style={styles.cellHeadBlue}>
                RUBRO
              </Cell>
              <Cell flex={W.detalle} style={styles.cellHeadBlue}>
                DETALLE
              </Cell>
              <Cell flex={W.unidad} style={styles.cellHeadBlue}>
                UNIDAD
              </Cell>
              <Cell flex={W.cant} style={styles.cellHeadBlue}>
                CANT.
              </Cell>
              <Cell flex={W.punit} style={styles.cellHeadBlue}>
                P. UNIT.
              </Cell>
              <Cell flex={W.total} style={styles.cellHeadBlue}>
                TOTAL
              </Cell>
              <View
                style={{
                  flex: W.d30 + W.d60,
                  flexDirection: "column",
                  borderRightWidth: 0,
                }}
              >
                <View
                  style={[
                    styles.cellHeadDiasGreen,
                    {
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      borderBottomWidth: 0.5,
                      borderBottomColor: CRONOGRAMA_EPA_COLORS.border,
                    },
                  ]}
                >
                  <Text>DIAS</Text>
                </View>
                <View style={{ flexDirection: "row", flex: 1 }}>
                  <View
                    style={[
                      styles.cellHeadDiasSub,
                      {
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRightWidth: 0.5,
                        borderRightColor: CRONOGRAMA_EPA_COLORS.border,
                      },
                    ]}
                  >
                    <Text>{d1}</Text>
                  </View>
                  <View
                    style={[
                      styles.cellHeadDiasSub,
                      { flex: 1, justifyContent: "center", alignItems: "center" },
                    ]}
                  >
                    <Text>{d2}</Text>
                  </View>
                </View>
              </View>
            </View>

            {datos.filas.map((fila, idx) => {
              if (fila.tipo === "seccion") {
                return (
                  <View key={`s-${idx}`} style={styles.row}>
                    <Cell flex={W.rubro} style={styles.cellSection}>
                      {fila.rubro}
                    </Cell>
                    <Cell flex={wDetalleSeccion} style={[styles.cellSection, { textTransform: "uppercase" }]}>
                      {fila.titulo}
                    </Cell>
                    <Cell flex={W.total} style={[styles.cellSection, { textAlign: "right" }]}>
                      {formatearNumeroCronograma(fila.montoTotalSeccion)}
                    </Cell>
                    <Cell flex={W.d30} style={styles.cellSection}>
                      {""}
                    </Cell>
                    <Cell flex={W.d60} style={styles.cellSection} last>
                      {""}
                    </Cell>
                  </View>
                )
              }
              return (
                <View key={`r-${idx}`} style={styles.row}>
                  <Cell flex={W.rubro} style={{ textAlign: "center" }}>
                    {fila.rubro}
                  </Cell>
                  <Cell flex={W.detalle}>{fila.detalle}</Cell>
                  <Cell flex={W.unidad} style={{ textAlign: "center" }}>
                    {fila.unidad}
                  </Cell>
                  <Cell flex={W.cant} style={{ textAlign: "right" }}>
                    {formatearNumeroCronograma(fila.cantidad)}
                  </Cell>
                  <Cell flex={W.punit} style={{ textAlign: "right" }}>
                    {formatearNumeroCronograma(fila.precioUnitario)}
                  </Cell>
                  <Cell flex={W.total} style={{ textAlign: "right" }}>
                    {formatearNumeroCronograma(fila.total)}
                  </Cell>
                  <Cell flex={W.d30} style={styles.cellDias}>
                    {fila.montosPeriodo[0] > 0 ? formatearNumeroCronograma(fila.montosPeriodo[0]) : ""}
                  </Cell>
                  <Cell flex={W.d60} style={styles.cellDias} last>
                    {fila.montosPeriodo[1] > 0 ? formatearNumeroCronograma(fila.montosPeriodo[1]) : ""}
                  </Cell>
                </View>
              )
            })}

            <View style={styles.row}>
              <Cell flex={W.rubro + wDetalleSeccion} style={{ fontFamily: "Helvetica-Bold" }}>
                TOTAL
              </Cell>
              <Cell flex={W.total} style={{ textAlign: "right", fontFamily: "Helvetica-Bold" }}>
                {formatearUsdCronograma(datos.montoTotalContrato)}
              </Cell>
              <Cell flex={W.d30 + W.d60} last>
                {""}
              </Cell>
            </View>
            <View style={styles.row}>
              <Cell flex={W.rubro + wDetalleSeccion} style={{ fontFamily: "Helvetica-Bold" }}>
                INVERSIÓN MENSUAL
              </Cell>
              <Cell flex={W.total}>{""}</Cell>
              <Cell flex={W.d30} style={{ textAlign: "right" }}>
                {formatearNumeroCronograma(datos.inversionPeriodo[0])}
              </Cell>
              <Cell flex={W.d60} style={{ textAlign: "right" }} last>
                {formatearNumeroCronograma(datos.inversionPeriodo[1])}
              </Cell>
            </View>
            <View style={styles.row}>
              <Cell flex={W.rubro + wDetalleSeccion} style={{ fontFamily: "Helvetica-Bold" }}>
                AVANCE PARCIAL %
              </Cell>
              <Cell flex={W.total}>{""}</Cell>
              <Cell flex={W.d30} style={{ textAlign: "right" }}>
                {formatearNumeroCronograma(datos.avanceParcialPct[0], 2)}
              </Cell>
              <Cell flex={W.d60} style={{ textAlign: "right" }} last>
                {formatearNumeroCronograma(datos.avanceParcialPct[1], 2)}
              </Cell>
            </View>
            <View style={styles.row}>
              <Cell flex={W.rubro + wDetalleSeccion} style={{ fontFamily: "Helvetica-Bold" }}>
                INVERSIÓN ACUMULADA
              </Cell>
              <Cell flex={W.total}>{""}</Cell>
              <Cell flex={W.d30} style={{ textAlign: "right" }}>
                {formatearNumeroCronograma(datos.inversionAcumulada[0])}
              </Cell>
              <Cell flex={W.d60} style={{ textAlign: "right" }} last>
                {formatearNumeroCronograma(datos.inversionAcumulada[1])}
              </Cell>
            </View>
            <View style={styles.rowLast}>
              <Cell flex={W.rubro + wDetalleSeccion} style={{ fontFamily: "Helvetica-Bold" }}>
                AVANCE ACUMULADO %
              </Cell>
              <Cell flex={W.total}>{""}</Cell>
              <Cell flex={W.d30} style={{ textAlign: "right" }}>
                {formatearNumeroCronograma(datos.avanceAcumuladoPct[0], 2)}
              </Cell>
              <Cell flex={W.d60} style={{ textAlign: "right" }} last>
                {formatearNumeroCronograma(datos.avanceAcumuladoPct[1], 2)}
              </Cell>
            </View>
          </View>

          <View style={styles.firmas}>
            <View style={styles.firmaCol}>
              <Text style={styles.firmaLinea}>{firmaContratista ?? e.contratista}</Text>
              <Text style={styles.firmaRol}>CONTRATISTA</Text>
            </View>
            <View style={styles.firmaCol}>
              <Text style={styles.firmaLinea}>{e.fiscalizador}</Text>
              <Text style={styles.firmaRol}>FISCALIZACIÓN</Text>
            </View>
            <View style={styles.firmaCol}>
              <Text style={styles.firmaLinea}>{e.administrador}</Text>
              <Text style={styles.firmaRol}>ADMINISTRADOR DE CONTRATO</Text>
            </View>
        </View>
      </View>
    </Page>
  )
}

export function PlanillaCronogramaEpaPdfDocument({
  programado,
  ejecutado,
  firmaContratista,
  logos,
}: Props) {
  return (
    <Document title="Cronogramas EPA">
      <CronogramaEpaPdfPage datos={programado} firmaContratista={firmaContratista} logos={logos} />
      <CronogramaEpaPdfPage datos={ejecutado} firmaContratista={firmaContratista} logos={logos} />
    </Document>
  )
}
