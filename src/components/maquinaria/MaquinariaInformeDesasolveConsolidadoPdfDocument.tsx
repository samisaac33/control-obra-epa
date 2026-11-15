import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import type { InformeDesasolveConsolidadoPayload } from "@/src/lib/maquinaria/cargar-informe-desasolve-consolidado"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import { formatearFechaRegistro } from "@/src/lib/tramo-maquinaria-historial"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
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
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  meta: {
    fontSize: 9,
    textAlign: "center",
    color: "#404040",
    marginBottom: 16,
  },
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  kpi: {
    flexGrow: 1,
    minWidth: "22%",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 4,
    padding: 8,
  },
  kpiLabel: { fontSize: 7, color: "#737373", marginBottom: 2 },
  kpiValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#a3a3a3",
    paddingBottom: 4,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    fontSize: 9,
  },
  colEquipo: { flex: 2.2 },
  colNum: { flex: 0.7, textAlign: "right" },
})

type Props = {
  data: InformeDesasolveConsolidadoPayload
}

export function MaquinariaInformeDesasolveConsolidadoPdfDocument({ data }: Props) {
  const { proyecto, periodoEtiqueta, generadoEnIso, kpis, porEquipo } = data
  const generado = formatearFechaRegistro(generadoEnIso.slice(0, 10))

  return (
    <Document title="Informe consolidado de maquinaria">
      <Page size="A4" style={styles.page}>
        <Text style={styles.kicker}>Control de Obra · EPA</Text>
        <Text style={styles.title}>Informe consolidado de maquinaria y transporte</Text>
        <Text style={styles.meta}>
          {proyecto.nombreObra} · {periodoEtiqueta} · Generado {generado}
        </Text>

        <View style={styles.kpiRow}>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Días con actividad</Text>
            <Text style={styles.kpiValue}>{kpis.diasConActividad}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Horas registradas</Text>
            <Text style={styles.kpiValue}>{formatearNumero(kpis.totalHoras, 1)}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Metros desazolados</Text>
            <Text style={styles.kpiValue}>{data.formatearMetros(kpis.totalMetros)}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Tramos con jornada</Text>
            <Text style={styles.kpiValue}>{kpis.tramosConJornada}</Text>
          </View>
        </View>

        <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 6, fontSize: 10 }}>
          Consolidado por equipo
        </Text>
        <View style={styles.tableHead}>
          <Text style={styles.colEquipo}>Equipo</Text>
          <Text style={styles.colNum}>Jornadas</Text>
          <Text style={styles.colNum}>Metros</Text>
          <Text style={styles.colNum}>Horas</Text>
        </View>
        {porEquipo.map((fila) => (
          <View key={fila.clave} style={styles.tableRow}>
            <Text style={styles.colEquipo}>{fila.nombreEquipo}</Text>
            <Text style={styles.colNum}>{fila.jornadas}</Text>
            <Text style={styles.colNum}>{data.formatearMetros(fila.metros)}</Text>
            <Text style={styles.colNum}>
              {fila.horas > 0 ? formatearNumero(fila.horas, 1) : "—"}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}