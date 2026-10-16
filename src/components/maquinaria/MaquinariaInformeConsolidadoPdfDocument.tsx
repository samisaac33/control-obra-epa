import { Document, Page, Text, View } from "@react-pdf/renderer"

import { ACCIONISTA_META } from "@/src/data/registro-maquinaria"
import type { ProyectoConfig } from "@/src/data/proyectos/catalog"
import type {
  InformeConsolidadoMaquinaria,
  SeccionDetalleMaquinasPorFrente,
} from "@/src/lib/maquinaria-informe-consolidado"
import { formatearNumero, resumenAccionistaEtiqueta } from "@/src/lib/maquinaria-resumen"

import { maquinariaInformeConsolidadoPdfStyles as styles } from "./maquinariaInformeConsolidadoPdfStyles"

export type MaquinariaInformeConsolidadoPdfData = {
  proyecto: Pick<
    ProyectoConfig,
    "nombreObra" | "objeto" | "numeroContrato" | "cliente" | "sistema"
  >
  rangoEtiqueta: string
  generadoEnIso: string
  informe: InformeConsolidadoMaquinaria
}

function formatearGenerado(iso: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso))
}

function celdaNumero(valor: number, decimales = 1): string {
  if (valor <= 0) return "—"
  return formatearNumero(valor, decimales)
}

function celdaEntero(valor: number): string {
  if (valor <= 0) return "—"
  return String(valor)
}

type Props = {
  data: MaquinariaInformeConsolidadoPdfData
}

function TablaDetalleFrente({ seccion }: { seccion: SeccionDetalleMaquinasPorFrente }) {
  return (
    <View style={styles.seccionFrente}>
      <Text style={styles.seccionFrenteTitulo}>{seccion.label}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.colEquipo, styles.headerCell]}>Equipo</Text>
          <Text style={[styles.colAcc, styles.headerCell]}>Accionista</Text>
          <Text style={[styles.colHorasDet, styles.headerCell, { textAlign: "right" }]}>
            Horas máquina
          </Text>
          <Text style={[styles.colViajesDet, styles.headerCell, { textAlign: "right" }]}>
            Viajes volqueta
          </Text>
        </View>
        {seccion.filas.map((fila, index) => (
          <View
            key={`${fila.equipo}-${fila.accionista}-${index}`}
            style={index === seccion.filas.length - 1 ? styles.tableRowLast : styles.tableRow}
          >
            <Text style={[styles.colEquipo, styles.cell]}>{fila.equipo}</Text>
            <Text style={[styles.colAcc, styles.cell]}>
              {resumenAccionistaEtiqueta(fila.accionista)}
            </Text>
            <Text style={[styles.colHorasDet, styles.cellMono]}>
              {celdaNumero(fila.horasMaquina)}
            </Text>
            <Text style={[styles.colViajesDet, styles.cellMono]}>
              {celdaEntero(fila.viajesVolqueta)}
            </Text>
          </View>
        ))}
        <View style={styles.tableRowLast}>
          <Text style={[styles.colEquipo, styles.cell, { fontFamily: "Helvetica-Bold" }]}>
            Subtotal {seccion.label}
          </Text>
          <Text style={[styles.colAcc, styles.cell]} />
          <Text style={[styles.colHorasDet, styles.cellMono, { fontFamily: "Helvetica-Bold" }]}>
            {celdaNumero(seccion.subtotalHoras)}
          </Text>
          <Text style={[styles.colViajesDet, styles.cellMono, { fontFamily: "Helvetica-Bold" }]}>
            {celdaEntero(seccion.subtotalViajes)}
          </Text>
        </View>
      </View>
    </View>
  )
}

export function MaquinariaInformeConsolidadoPdfDocument({ data }: Props) {
  const { proyecto, rangoEtiqueta, generadoEnIso, informe } = data
  const labelJimmy = ACCIONISTA_META.consorcio.label
  const labelMauricio = ACCIONISTA_META.mauricio.label

  return (
    <Document
      title="Informe consolidado de maquinaria"
      author="Control Obra EPA"
      subject={proyecto.objeto}
      creator="Control Obra EPA"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.kicker}>Informe consolidado de maquinaria y transporte</Text>
        <Text style={styles.title}>{proyecto.nombreObra}</Text>
        <Text style={styles.subtitle}>{proyecto.objeto}</Text>

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Contrato:</Text>
            <Text>{proyecto.numeroContrato}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Cliente:</Text>
            <Text>{proyecto.cliente}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Sistema:</Text>
            <Text>{proyecto.sistema}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Período del reporte:</Text>
            <Text>{rangoEtiqueta}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Generado:</Text>
            <Text>{formatearGenerado(generadoEnIso)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Consolidado por frente de trabajo</Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colFrente, styles.headerCell]}>Frente / sector</Text>
            <Text style={[styles.colHoras, styles.headerCell, { textAlign: "right" }]}>
              Horas máquina
            </Text>
            <Text style={[styles.colViajes, styles.headerCell, { textAlign: "right" }]}>
              Viajes {labelJimmy}
            </Text>
            <Text style={[styles.colViajes, styles.headerCell, { textAlign: "right" }]}>
              Viajes {labelMauricio}
            </Text>
            <Text style={[styles.colViajes, styles.headerCell, { textAlign: "right" }]}>
              Viajes total
            </Text>
          </View>

          {informe.filas.map((fila, index) => (
            <View
              key={`${fila.frente ?? "sin"}-${index}`}
              style={
                index === informe.filas.length - 1 ? styles.tableRowLast : styles.tableRow
              }
            >
              <Text style={[styles.colFrente, styles.cell]}>{fila.label}</Text>
              <Text style={[styles.colHoras, styles.cellMono]}>
                {celdaNumero(fila.horasMaquina)}
              </Text>
              <Text style={[styles.colViajes, styles.cellMono]}>
                {celdaEntero(fila.viajesJimmy)}
              </Text>
              <Text style={[styles.colViajes, styles.cellMono]}>
                {celdaEntero(fila.viajesMauricio)}
              </Text>
              <Text style={[styles.colViajes, styles.cellMono]}>
                {celdaEntero(fila.viajesTotal)}
              </Text>
            </View>
          ))}

          <View style={styles.tableRowLast}>
            <Text style={[styles.colFrente, styles.cell, { fontFamily: "Helvetica-Bold" }]}>
              TOTAL
            </Text>
            <Text style={[styles.colHoras, styles.cellMono, { fontFamily: "Helvetica-Bold" }]}>
              {celdaNumero(informe.totales.horasMaquina)}
            </Text>
            <Text style={[styles.colViajes, styles.cellMono, { fontFamily: "Helvetica-Bold" }]}>
              {celdaEntero(informe.totales.viajesJimmy)}
            </Text>
            <Text style={[styles.colViajes, styles.cellMono, { fontFamily: "Helvetica-Bold" }]}>
              {celdaEntero(informe.totales.viajesMauricio)}
            </Text>
            <Text style={[styles.colViajes, styles.cellMono, { fontFamily: "Helvetica-Bold" }]}>
              {celdaEntero(informe.totales.viajesTotal)}
            </Text>
          </View>
        </View>

        <Text style={styles.nota}>
          Horas máquina: suma de equipos en jornada (día completo = 8 h, medio día = 4 h, registro
          por hora según cantidad), Jimmy y Mauricio combinados por frente. Viajes de volquetas:
          conteo de registros «Viajes de arena» y «Viajes de material para vía». Sin detalle diario
          ni semanal.
        </Text>

        <View style={styles.footer}>
          <Text>Registro operativo de maquinaria — {proyecto.nombreObra}</Text>
          <Text>Uso exclusivo para fiscalización interna. No sustituye firmas oficiales.</Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>

      <Page size="A4" style={styles.page} break>
        <Text style={styles.kicker}>Detalle consolidado por frente</Text>
        <Text style={styles.sectionTitle}>Horas por equipo y sector</Text>
        <Text style={[styles.nota, { marginTop: 0, marginBottom: 8 }]}>
          Totales acumulados del período por frente. Incluye maquinaria en jornada y registros de
          viajes de material (volqueta).
        </Text>

        {informe.detallePorFrente.map((seccion) => (
          <TablaDetalleFrente key={seccion.label} seccion={seccion} />
        ))}

        <View style={styles.footer}>
          <Text>Registro operativo de maquinaria — {proyecto.nombreObra}</Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
