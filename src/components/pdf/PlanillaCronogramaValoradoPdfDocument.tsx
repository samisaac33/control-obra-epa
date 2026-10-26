import { Document, Page, Text, View } from "@react-pdf/renderer"

import type { ResumenCronogramaValoradoVigente } from "@/src/lib/planilla-cronograma-valorado-vigente"
import {
  formatearNumeroCronograma,
  formatearUsdCronograma,
} from "@/src/lib/planilla-cronograma-valorado-formato"

import { dailyReportCgePdfStyles as styles } from "./dailyReportCgePdfStyles"

type Props = {
  cronograma: ResumenCronogramaValoradoVigente
}

export function PlanillaCronogramaValoradoPdfDocument({ cronograma }: Props) {
  return (
    <Document title="Cronograma valorado vigente">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={[styles.tituloDocumento, { fontSize: 11 }]}>{cronograma.titulo}</Text>
        <Text style={[styles.meta, { textAlign: "center", fontWeight: "bold" }]}>
          {cronograma.objeto}
        </Text>
        <Text style={styles.meta}>Nombre del oferente: {cronograma.oferente}</Text>

        <View style={[styles.table, { marginTop: 8 }]}>
          <View style={styles.row}>
            <Text style={[styles.headerCell, { flex: 0.5 }]}>Item</Text>
            <Text style={[styles.headerCell, { flex: 2.2 }]}>Descripción</Text>
            <Text style={[styles.headerCell, { flex: 0.45 }]}>Und.</Text>
            <Text style={[styles.headerCell, { flex: 0.65, textAlign: "right" }]}>Cant.</Text>
            <Text style={[styles.headerCell, { flex: 0.55, textAlign: "right" }]}>P.U.</Text>
            <Text style={[styles.headerCell, { flex: 0.75, textAlign: "right" }]}>P.Total</Text>
            <Text style={[styles.headerCell, { flex: 0.55, textAlign: "right" }]}>Per. 1</Text>
            <Text style={[styles.headerCell, { flex: 0.55, textAlign: "right" }]}>Per. 2</Text>
          </View>

          {cronograma.secciones.map((sec) => (
            <View key={`s-${sec.numero}`}>
              <View style={styles.row}>
                <Text style={[styles.cell, { flex: 0.5, fontWeight: "bold" }]}>{sec.numero}</Text>
                <Text style={[styles.cell, { flex: 2.2, fontWeight: "bold", textTransform: "uppercase" }]}>
                  {sec.titulo}
                </Text>
                <Text style={[styles.cell, { flex: 0.45 }]} />
                <Text style={[styles.cell, { flex: 0.65 }]} />
                <Text style={[styles.cell, { flex: 0.55 }]} />
                <Text style={[styles.cell, { flex: 0.75, textAlign: "right", fontWeight: "bold" }]}>
                  {formatearNumeroCronograma(sec.montoTotalSeccion)}
                </Text>
                <Text style={[styles.cell, { flex: 0.55 }]} />
                <Text style={[styles.cell, { flex: 0.55 }]} />
              </View>
              {sec.filas.map((f) => (
                <View key={f.rubroId} style={styles.row}>
                  <Text style={[styles.cell, { flex: 0.5 }]}>{f.codigoItem}</Text>
                  <Text style={[styles.cell, { flex: 2.2 }]}>{f.descripcion}</Text>
                  <Text style={[styles.cell, { flex: 0.45 }]}>{f.unidad}</Text>
                  <Text style={[styles.cell, { flex: 0.65, textAlign: "right" }]}>
                    {formatearNumeroCronograma(f.cantidadContrato)}
                  </Text>
                  <Text style={[styles.cell, { flex: 0.55, textAlign: "right" }]}>
                    {formatearNumeroCronograma(f.precioUnitario)}
                  </Text>
                  <Text style={[styles.cell, { flex: 0.75, textAlign: "right" }]}>
                    {formatearNumeroCronograma(f.montoTotalRubro)}
                  </Text>
                  <Text style={[styles.cell, { flex: 0.55, textAlign: "right" }]}>
                    {formatearNumeroCronograma(f.cantidadPeriodo1)}
                  </Text>
                  <Text style={[styles.cell, { flex: 0.55, textAlign: "right" }]}>
                    {formatearNumeroCronograma(f.cantidadPeriodo2)}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.rowLast}>
            <Text style={[styles.cell, { flex: 4.35, fontWeight: "bold" }]}>TOTAL:</Text>
            <Text style={[styles.cell, { flex: 0.75, textAlign: "right", fontWeight: "bold" }]}>
              {formatearUsdCronograma(cronograma.montoTotalContrato)}
            </Text>
            <Text style={[styles.cell, { flex: 1.1 }]} />
          </View>
        </View>

        <View style={{ marginTop: 10, fontSize: 8 }}>
          <Text>
            INVERSIÓN MENSUAL — Per. 1: {formatearNumeroCronograma(cronograma.inversionPeriodo1)} · Per. 2:{" "}
            {formatearNumeroCronograma(cronograma.inversionPeriodo2)}
          </Text>
          <Text>
            AVANCE PARCIAL % — Per. 1: {formatearNumeroCronograma(cronograma.avanceParcialPct1, 2)} · Per. 2:{" "}
            {formatearNumeroCronograma(cronograma.avanceParcialPct2, 2)}
          </Text>
          <Text>
            INVERSIÓN ACUMULADA — Per. 1: {formatearNumeroCronograma(cronograma.inversionAcumulada1)} · Per. 2:{" "}
            {formatearNumeroCronograma(cronograma.inversionAcumulada2)}
          </Text>
          <Text>
            AVANCE ACUMULADO % — Per. 1: {formatearNumeroCronograma(cronograma.avanceAcumuladoPct1, 2)} · Per. 2:{" "}
            {formatearNumeroCronograma(cronograma.avanceAcumuladoPct2, 2)}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
