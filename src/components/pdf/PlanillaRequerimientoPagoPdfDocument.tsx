import { Document, Page, Text, View } from "@react-pdf/renderer"

import {
  MEMBRETE_EPA,
  RESOLUCION_EMERGENCIA,
  TITULO_PROCEDIMIENTO_EMERGENCIA,
} from "@/src/data/contrato-emergencia-severino-trasvase"
import type { ResumenRequerimientoPago } from "@/src/lib/planilla-requerimiento-pago"
import { formatearCantidad, formatearUsd } from "@/lib/sicc/format"

import { dailyReportCgePdfStyles as styles } from "./dailyReportCgePdfStyles"

type Props = {
  proyectoNombre: string
  numeroContrato: string
  resumen: ResumenRequerimientoPago
  generadoEnIso: string
}

export function PlanillaRequerimientoPagoPdfDocument({
  proyectoNombre,
  numeroContrato,
  resumen,
  generadoEnIso,
}: Props) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.membrete}>
          <Text style={styles.membreteTitulo}>{MEMBRETE_EPA}</Text>
          <Text style={styles.membreteSub}>{TITULO_PROCEDIMIENTO_EMERGENCIA}</Text>
        </View>

        <Text style={styles.tituloDocumento}>REQUERIMIENTO DE PAGO / MEDICIÓN POR RUBRO</Text>

        <Text style={styles.meta}>Obra: {proyectoNombre}</Text>
        <Text style={styles.meta}>Contrato: {numeroContrato} · {RESOLUCION_EMERGENCIA}</Text>
        <Text style={styles.meta}>
          {resumen.periodo.etiqueta}: {resumen.periodo.fecha_inicio} — {resumen.periodo.fecha_fin}
        </Text>
        <Text style={styles.meta}>
          Avance acum. objetivo: {resumen.pctAvanceAcumuladoObjetivo}% · Generado: {generadoEnIso}
        </Text>

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.headerCell, { flex: 0.4 }]}>Rub.</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Detalle</Text>
            <Text style={[styles.headerCell, { flex: 0.6, textAlign: "right" }]}>PU</Text>
            <Text style={[styles.headerCell, { flex: 0.7, textAlign: "right" }]}>Cant. periodo</Text>
            <Text style={[styles.headerCell, { flex: 0.8, textAlign: "right" }]}>Monto periodo</Text>
          </View>
          {resumen.lineas
            .filter((l) => l.montoPeriodo > 0)
            .map((l, i, arr) => (
              <View key={l.rubroId} style={i === arr.length - 1 ? styles.rowLast : styles.row}>
                <Text style={[styles.cell, { flex: 0.4 }]}>{l.rubroId}</Text>
                <Text style={[styles.cell, { flex: 2 }]}>{l.detalle}</Text>
                <Text style={[styles.cell, { flex: 0.6, textAlign: "right" }]}>
                  {formatearUsd(l.precioUnitario)}
                </Text>
                <Text style={[styles.cell, { flex: 0.7, textAlign: "right" }]}>
                  {formatearCantidad(l.cantidadPeriodo)} {l.unidad}
                </Text>
                <Text style={[styles.cell, { flex: 0.8, textAlign: "right" }]}>
                  {formatearUsd(l.montoPeriodo)}
                </Text>
              </View>
            ))}
        </View>

        <Text style={styles.meta}>
          Total periodo: {formatearUsd(resumen.montoPeriodo)} · Acumulado:{" "}
          {formatearUsd(resumen.montoAcumulado)} · Saldo contrato:{" "}
          {formatearUsd(resumen.montoSaldoContrato)}
        </Text>

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
