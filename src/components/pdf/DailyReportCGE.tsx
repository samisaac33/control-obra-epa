import { Document, Page, Text, View } from "@react-pdf/renderer"

import {
  MEMBRETE_EPA,
  OBJETO_CONTRATO,
  RESOLUCION_EMERGENCIA,
  TITULO_PROCEDIMIENTO_EMERGENCIA,
} from "@/src/data/contrato-emergencia-severino-trasvase"
import type { CanalAbscisa, RegistroMaquinariaJornada, TicketDesalojo } from "@/src/data/auditoria/types"
import { etiquetaEstadoAbscisa } from "@/src/data/auditoria/types"

import { dailyReportCgePdfStyles as styles } from "./dailyReportCgePdfStyles"

export type DailyReportCgeData = {
  fecha: string
  frenteTrabajo: string
  condicionesClimaticas: string
  abscisasDia: CanalAbscisa[]
  ticketsDia: TicketDesalojo[]
  jornadasDia: RegistroMaquinariaJornada[]
  generadoEnIso: string
}

function TablaAbscisas({ filas }: { filas: CanalAbscisa[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.row}>
        <Text style={styles.headerCell}>Estación</Text>
        <Text style={styles.headerCell}>Sector</Text>
        <Text style={styles.headerCell}>Estado</Text>
        <Text style={styles.headerCell}>Volumen m³</Text>
      </View>
      {filas.length === 0 ? (
        <View style={styles.rowLast}>
          <Text style={[styles.cell, { flex: 4 }]}>Sin tramos cubicados en la fecha.</Text>
        </View>
      ) : (
        filas.map((f, i) => (
          <View key={f.id} style={i === filas.length - 1 ? styles.rowLast : styles.row}>
            <Text style={styles.cell}>{f.codigo_estacion}</Text>
            <Text style={styles.cell}>{f.sector_nombre}</Text>
            <Text style={styles.cell}>{etiquetaEstadoAbscisa(f.estado)}</Text>
            <Text style={styles.cell}>
              {f.volumen_teorico_m3 != null ? f.volumen_teorico_m3.toFixed(2) : "—"}
            </Text>
          </View>
        ))
      )}
    </View>
  )
}

function TablaTickets({ tickets }: { tickets: TicketDesalojo[] }) {
  const volumen = tickets.reduce((s, t) => s + t.capacidad_m3, 0)
  const placas = [...new Set(tickets.map((t) => t.placa_volqueta))]

  return (
    <View>
      <Text style={styles.meta}>
        Volquetas activas: {placas.length || "—"} · Viajes: {tickets.length} · Volumen:{" "}
        {volumen.toFixed(2)} m³
      </Text>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.headerCell}>Ticket</Text>
          <Text style={styles.headerCell}>Placa</Text>
          <Text style={styles.headerCell}>Botadero</Text>
          <Text style={styles.headerCell}>m³</Text>
          <Text style={styles.headerCell}>Estado</Text>
        </View>
        {tickets.length === 0 ? (
          <View style={styles.rowLast}>
            <Text style={[styles.cell, { flex: 5 }]}>Sin viajes registrados.</Text>
          </View>
        ) : (
          tickets.map((t, i) => (
            <View key={t.id} style={i === tickets.length - 1 ? styles.rowLast : styles.row}>
              <Text style={styles.cell}>{t.numero_ticket}</Text>
              <Text style={styles.cell}>{t.placa_volqueta}</Text>
              <Text style={styles.cell}>{t.botadero_nombre}</Text>
              <Text style={styles.cell}>{t.capacidad_m3.toFixed(1)}</Text>
              <Text style={styles.cell}>{t.estado}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  )
}

function TablaJornadas({ jornadas }: { jornadas: RegistroMaquinariaJornada[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.row}>
        <Text style={styles.headerCell}>Código</Text>
        <Text style={styles.headerCell}>Tipo</Text>
        <Text style={styles.headerCell}>Horómetro</Text>
        <Text style={styles.headerCell}>Horas</Text>
        <Text style={styles.headerCell}>Gal combustible</Text>
      </View>
      {jornadas.length === 0 ? (
        <View style={styles.rowLast}>
          <Text style={[styles.cell, { flex: 5 }]}>Sin jornadas de horómetro.</Text>
        </View>
      ) : (
        jornadas.map((j, i) => (
          <View key={j.id} style={i === jornadas.length - 1 ? styles.rowLast : styles.row}>
            <Text style={styles.cell}>{j.maquina_codigo}</Text>
            <Text style={styles.cell}>{j.tipo_maquina}</Text>
            <Text style={styles.cell}>
              {j.horometro_inicio.toFixed(1)} – {j.horometro_fin.toFixed(1)}
            </Text>
            <Text style={styles.cell}>{j.horas_efectivas.toFixed(2)}</Text>
            <Text style={styles.cell}>
              {j.combustible_galones != null ? j.combustible_galones.toFixed(1) : "—"}
            </Text>
          </View>
        ))
      )}
    </View>
  )
}

type Props = { data: DailyReportCgeData }

export function DailyReportCGEDocument({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.membrete}>
          <Text style={styles.membreteTitulo}>{MEMBRETE_EPA}</Text>
          <Text style={styles.membreteSub}>{TITULO_PROCEDIMIENTO_EMERGENCIA}</Text>
        </View>

        <Text style={styles.tituloDocumento}>
          REPORTE DIARIO DE CONCILIACIÓN DE DESAZOLVE, TRANSPORTE Y HORÓMETROS
        </Text>

        <Text style={styles.meta}>Fecha: {data.fecha}</Text>
        <Text style={styles.meta}>Frente de trabajo: {data.frenteTrabajo}</Text>
        <Text style={styles.meta}>Condiciones climáticas: {data.condicionesClimaticas}</Text>
        <Text style={styles.meta}>Objeto: {OBJETO_CONTRATO}</Text>
        <Text style={styles.meta}>Resolución: {RESOLUCION_EMERGENCIA}</Text>
        <Text style={styles.meta}>Generado: {data.generadoEnIso}</Text>

        <Text style={styles.sectionTitle}>Tabla 1 — Tramos intervenidos y volumen topográfico</Text>
        <TablaAbscisas filas={data.abscisasDia} />

        <Text style={styles.sectionTitle}>Tabla 2 — Volquetas y volumen desalojado</Text>
        <TablaTickets tickets={data.ticketsDia} />

        <Text style={styles.sectionTitle}>Tabla 3 — Maquinaria y horómetros</Text>
        <TablaJornadas jornadas={data.jornadasDia} />

        <View style={styles.firmas}>
          <View style={styles.firmaCol}>
            <Text style={styles.firmaLinea}>Superintendente de Obra (Contratista)</Text>
          </View>
          <View style={styles.firmaCol}>
            <Text style={styles.firmaLinea}>Fiscalizador de Obra (EPA EP)</Text>
          </View>
          <View style={styles.firmaCol}>
            <Text style={styles.firmaLinea}>Administrador del Contrato (EPA EP)</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
