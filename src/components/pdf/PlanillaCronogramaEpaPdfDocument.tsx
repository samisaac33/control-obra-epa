import { Document, Page, Text, View } from "@react-pdf/renderer"

import {
  formatearNumeroCronograma,
  formatearUsdCronograma,
} from "@/src/lib/planilla-cronograma-valorado-formato"
import type { ResumenCronogramaEpa } from "@/src/lib/planilla-cronograma-epa"

import { dailyReportCgePdfStyles as styles } from "./dailyReportCgePdfStyles"

type Props = {
  programado: ResumenCronogramaEpa
  ejecutado: ResumenCronogramaEpa
  firmaContratista?: string
}

function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function CronogramaEpaPdfPage({
  datos,
  firmaContratista,
}: {
  datos: ResumenCronogramaEpa
  firmaContratista?: string
}) {
  const e = datos.encabezado
  const [d1, d2] = e.etiquetasDias

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Text style={[styles.tituloDocumento, { fontSize: 10 }]}>{e.tituloVertical}</Text>
      <Text style={[styles.meta, { textAlign: "center", fontWeight: "bold", fontSize: 8 }]}>
        {e.objeto}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4, fontSize: 7 }}>
        <View style={{ width: "55%" }}>
          <Text>CONTRATISTA: {e.contratista}</Text>
          <Text>FISCALIZADOR: {e.fiscalizador}</Text>
          <Text>ADMINISTRADOR: {e.administrador}</Text>
          {e.planillaEtiqueta ? <Text>{e.planillaEtiqueta}</Text> : null}
        </View>
        <View style={{ width: "42%" }}>
          <Text>Monto: {formatearUsdCronograma(e.montoContratoUsd)}</Text>
          <Text>Contrato: {e.numeroContrato}</Text>
          <Text>
            Plazo: {formatearFecha(e.fechaInicioContrato)} — {formatearFecha(e.fechaFinContrato)}
          </Text>
        </View>
      </View>

      <View style={[styles.table, { marginTop: 6, fontSize: 6 }]}>
        <View style={styles.row}>
          <Text style={[styles.headerCell, { flex: 0.35 }]}>Rub.</Text>
          <Text style={[styles.headerCell, { flex: 2 }]}>Detalle</Text>
          <Text style={[styles.headerCell, { flex: 0.35 }]}>Und</Text>
          <Text style={[styles.headerCell, { flex: 0.5, textAlign: "right" }]}>Cant.</Text>
          <Text style={[styles.headerCell, { flex: 0.45, textAlign: "right" }]}>P.U.</Text>
          <Text style={[styles.headerCell, { flex: 0.55, textAlign: "right" }]}>Total</Text>
          <Text style={[styles.headerCell, { flex: 0.45, textAlign: "right" }]}>D{d1}</Text>
          <Text style={[styles.headerCell, { flex: 0.45, textAlign: "right" }]}>D{d2}</Text>
        </View>

        {datos.filas.map((fila, idx) => {
          if (fila.tipo === "seccion") {
            return (
              <View key={`s-${idx}`} style={styles.row}>
                <Text style={[styles.cell, { flex: 0.35, fontWeight: "bold" }]}>{fila.rubro}</Text>
                <Text style={[styles.cell, { flex: 2, fontWeight: "bold", textTransform: "uppercase" }]}>
                  {fila.titulo}
                </Text>
                <Text style={[styles.cell, { flex: 1.85 }]} />
                <Text style={[styles.cell, { flex: 0.55, textAlign: "right", fontWeight: "bold" }]}>
                  {formatearNumeroCronograma(fila.montoTotalSeccion)}
                </Text>
                <Text style={[styles.cell, { flex: 0.9 }]} />
              </View>
            )
          }
          return (
            <View key={`r-${idx}`} style={styles.row}>
              <Text style={[styles.cell, { flex: 0.35 }]}>{fila.rubro}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{fila.detalle}</Text>
              <Text style={[styles.cell, { flex: 0.35 }]}>{fila.unidad}</Text>
              <Text style={[styles.cell, { flex: 0.5, textAlign: "right" }]}>
                {formatearNumeroCronograma(fila.cantidad)}
              </Text>
              <Text style={[styles.cell, { flex: 0.45, textAlign: "right" }]}>
                {formatearNumeroCronograma(fila.precioUnitario)}
              </Text>
              <Text style={[styles.cell, { flex: 0.55, textAlign: "right" }]}>
                {formatearNumeroCronograma(fila.total)}
              </Text>
              <Text style={[styles.cell, { flex: 0.45, textAlign: "right" }]}>
                {fila.montosPeriodo[0] > 0 ? formatearNumeroCronograma(fila.montosPeriodo[0]) : ""}
              </Text>
              <Text style={[styles.cell, { flex: 0.45, textAlign: "right" }]}>
                {fila.montosPeriodo[1] > 0 ? formatearNumeroCronograma(fila.montosPeriodo[1]) : ""}
              </Text>
            </View>
          )
        })}

        <View style={styles.rowLast}>
          <Text style={[styles.cell, { flex: 3.65, fontWeight: "bold" }]}>TOTAL</Text>
          <Text style={[styles.cell, { flex: 0.55, textAlign: "right", fontWeight: "bold" }]}>
            {formatearUsdCronograma(datos.montoTotalContrato)}
          </Text>
          <Text style={[styles.cell, { flex: 0.9 }]} />
        </View>
      </View>

      <View style={{ marginTop: 6, fontSize: 7 }}>
        <Text>
          INV. MENSUAL — {d1}: {formatearNumeroCronograma(datos.inversionPeriodo[0])} · {d2}:{" "}
          {formatearNumeroCronograma(datos.inversionPeriodo[1])}
        </Text>
        <Text>
          AVANCE PARCIAL % — {d1}: {formatearNumeroCronograma(datos.avanceParcialPct[0], 2)} · {d2}:{" "}
          {formatearNumeroCronograma(datos.avanceParcialPct[1], 2)}
        </Text>
        <Text>
          AVANCE ACUM. % — {d1}: {formatearNumeroCronograma(datos.avanceAcumuladoPct[0], 2)} · {d2}:{" "}
          {formatearNumeroCronograma(datos.avanceAcumuladoPct[1], 2)}
        </Text>
      </View>

      <View style={{ marginTop: 14, flexDirection: "row", justifyContent: "space-between", fontSize: 7 }}>
        <View style={{ width: "30%", alignItems: "center" }}>
          <Text>{firmaContratista ?? e.contratista}</Text>
          <Text style={{ marginTop: 4, fontWeight: "bold" }}>CONTRATISTA</Text>
        </View>
        <View style={{ width: "30%", alignItems: "center" }}>
          <Text>{e.fiscalizador}</Text>
          <Text style={{ marginTop: 4, fontWeight: "bold" }}>FISCALIZACIÓN</Text>
        </View>
        <View style={{ width: "30%", alignItems: "center" }}>
          <Text>{e.administrador}</Text>
          <Text style={{ marginTop: 4, fontWeight: "bold" }}>ADMINISTRADOR</Text>
        </View>
      </View>
    </Page>
  )
}

export function PlanillaCronogramaEpaPdfDocument({ programado, ejecutado, firmaContratista }: Props) {
  return (
    <Document title="Cronogramas EPA">
      <CronogramaEpaPdfPage datos={programado} firmaContratista={firmaContratista} />
      <CronogramaEpaPdfPage datos={ejecutado} firmaContratista={firmaContratista} />
    </Document>
  )
}
