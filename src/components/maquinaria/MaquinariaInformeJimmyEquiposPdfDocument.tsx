import { Document, Page, Text, View } from "@react-pdf/renderer"

import { ACCIONISTA_META } from "@/src/data/registro-maquinaria"
import type { ProyectoConfig } from "@/src/data/proyectos/catalog"
import type { MatrizJimmyEquiposPorFrente } from "@/src/lib/maquinaria-informe-jimmy-equipos"
import { EQUIPO_ETIQUETA_CORTA } from "@/src/lib/maquinaria-matriz"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"

import { maquinariaInformeJimmyEquiposPdfStyles as styles } from "./maquinariaInformeJimmyEquiposPdfStyles"

export type MaquinariaInformeJimmyEquiposPdfData = {
  proyecto: Pick<
    ProyectoConfig,
    "nombreObra" | "objeto" | "numeroContrato" | "cliente" | "sistema"
  >
  rangoEtiqueta: string
  generadoEnIso: string
  matriz: MatrizJimmyEquiposPorFrente
}

function formatearGenerado(iso: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso))
}

function etiquetaEquipoColumna(equipo: string): string {
  return EQUIPO_ETIQUETA_CORTA[equipo] ?? equipo
}

function celdaHoras(valor: number): string {
  if (valor <= 0) return "—"
  return formatearNumero(valor, valor % 1 === 0 ? 0 : 1)
}

type Props = {
  data: MaquinariaInformeJimmyEquiposPdfData
}

export function MaquinariaInformeJimmyEquiposPdfDocument({ data }: Props) {
  const { proyecto, rangoEtiqueta, generadoEnIso, matriz } = data
  const labelJimmy = ACCIONISTA_META.consorcio.label
  const nEquipos = matriz.equipos.length
  const anchoEquipo = nEquipos > 0 ? `${Math.floor(72 / nEquipos)}%` : "10%"

  return (
    <Document
      title={`Horas por equipo — ${labelJimmy}`}
      author="Control Obra EPA"
      subject={proyecto.objeto}
      creator="Control Obra EPA"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.kicker}>Horas de maquinaria por frente — {labelJimmy}</Text>
        <Text style={styles.title}>{proyecto.nombreObra}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Período:</Text>
          <Text>{rangoEtiqueta}</Text>
          <Text style={styles.metaSep}>·</Text>
          <Text style={styles.metaLabel}>Generado:</Text>
          <Text>{formatearGenerado(generadoEnIso)}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colFrente, styles.headerCell]}>Frente / sector</Text>
            {matriz.equipos.map((equipo) => (
              <Text
                key={equipo}
                style={[styles.colEquipo, styles.headerCell, { width: anchoEquipo, textAlign: "right" }]}
              >
                {etiquetaEquipoColumna(equipo)}
              </Text>
            ))}
            <Text style={[styles.colTotal, styles.headerCell, { textAlign: "right" }]}>Total</Text>
          </View>

          {matriz.filas.map((fila, index) => (
            <View
              key={fila.label}
              style={index === matriz.filas.length - 1 ? styles.tableRowLast : styles.tableRow}
            >
              <Text style={[styles.colFrente, styles.cell]}>{fila.label}</Text>
              {matriz.equipos.map((equipo) => (
                <Text
                  key={equipo}
                  style={[styles.colEquipo, styles.cellMono, { width: anchoEquipo }]}
                >
                  {celdaHoras(fila.horasPorEquipo[equipo] ?? 0)}
                </Text>
              ))}
              <Text style={[styles.colTotal, styles.cellMono, { fontFamily: "Helvetica-Bold" }]}>
                {celdaHoras(fila.totalHoras)}
              </Text>
            </View>
          ))}

          <View style={styles.tableRowLast}>
            <Text style={[styles.colFrente, styles.cell, { fontFamily: "Helvetica-Bold" }]}>TOTAL</Text>
            {matriz.equipos.map((equipo) => (
              <Text
                key={equipo}
                style={[
                  styles.colEquipo,
                  styles.cellMono,
                  { width: anchoEquipo, fontFamily: "Helvetica-Bold" },
                ]}
              >
                {celdaHoras(matriz.totalesPorEquipo[equipo] ?? 0)}
              </Text>
            ))}
            <Text style={[styles.colTotal, styles.cellMono, { fontFamily: "Helvetica-Bold" }]}>
              {celdaHoras(matriz.totalGeneral)}
            </Text>
          </View>
        </View>

        <Text style={styles.nota}>
          Horas acumuladas del período (día completo = 8 h). Sin volquetas ni viajes de material.
          Accionista: {labelJimmy}.
        </Text>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
