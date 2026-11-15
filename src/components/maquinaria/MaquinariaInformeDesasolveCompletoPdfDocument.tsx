import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import type { InformeDesasolveCompletoPayload } from "@/src/lib/maquinaria/cargar-informe-desasolve-completo"
import { fondoFilaPorEquipoInformePdf } from "@/src/lib/maquinaria/colores-equipo-informe-pdf"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import { formatearFechaRegistro, formatearMetrosDesasolados } from "@/src/lib/tramo-maquinaria-historial"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    padding: 32,
    color: "#171717",
  },
  kicker: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#525252",
    textAlign: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 6,
  },
  meta: {
    fontSize: 8,
    textAlign: "center",
    color: "#404040",
    marginBottom: 14,
  },
  weekTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 6,
    marginBottom: 4,
    color: "#262626",
  },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#a3a3a3",
    paddingBottom: 3,
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    fontSize: 7,
  },
  empty: {
    fontSize: 8,
    color: "#737373",
    marginBottom: 4,
    fontStyle: "italic",
  },
  cFecha: { width: "11%" },
  cRef: { width: "7%" },
  cTipo: { width: "10%" },
  cUbic: { width: "16%" },
  cEquipo: { width: "14%" },
  cMetros: { width: "11%", textAlign: "right" },
  cHoras: { width: "8%", textAlign: "right" },
  cDetalle: { width: "23%" },
  cCbFecha: { width: "12%" },
  cCbUnidad: { width: "16%" },
  cCbMaq: { width: "16%" },
  cCbRuta: { width: "22%" },
  cCbHoras: { width: "10%", textAlign: "right" },
  cCbObs: { width: "24%" },
  sectionDivider: {
    marginTop: 16,
    marginBottom: 6,
    borderTopWidth: 1,
    borderTopColor: "#d4d4d4",
    paddingTop: 8,
  },
})

type Props = {
  data: InformeDesasolveCompletoPayload
}

function fmtHoras(h: number | null): string {
  if (h == null || h <= 0) return "—"
  return formatearNumero(h, 1)
}

function CabeceraDetalle() {
  return (
    <View style={styles.tableHead}>
      <Text style={styles.cFecha}>Fecha</Text>
      <Text style={styles.cRef}>Tramo / ref.</Text>
      <Text style={styles.cTipo}>Tipo</Text>
      <Text style={styles.cUbic}>Canal / ubicación</Text>
      <Text style={styles.cEquipo}>Equipo</Text>
      <Text style={styles.cMetros}>Metros</Text>
      <Text style={styles.cHoras}>Horas</Text>
      <Text style={styles.cDetalle}>Descripción / obs.</Text>
    </View>
  )
}

function FilaDetalle(props: {
  fecha: string
  referencia: string
  tipo: string
  ubic: string
  equipo: string
  metros: string
  horas: string
  detalle: string
  fondoFila?: string
}) {
  return (
    <View style={[styles.tableRow, props.fondoFila ? { backgroundColor: props.fondoFila } : {}]}>
      <Text style={styles.cFecha}>{formatearFechaRegistro(props.fecha)}</Text>
      <Text style={styles.cRef}>{props.referencia}</Text>
      <Text style={styles.cTipo}>{props.tipo}</Text>
      <Text style={styles.cUbic}>{props.ubic}</Text>
      <Text style={styles.cEquipo}>{props.equipo}</Text>
      <Text style={styles.cMetros}>{props.metros}</Text>
      <Text style={styles.cHoras}>{props.horas}</Text>
      <Text style={styles.cDetalle}>{props.detalle}</Text>
    </View>
  )
}

export function MaquinariaInformeDesasolveCompletoPdfDocument({ data }: Props) {
  const { proyecto, periodoEtiqueta, generadoEnIso, semanas, camaBajaPorSemana, formatearMetros } =
    data
  const generado = formatearFechaRegistro(generadoEnIso.slice(0, 10))

  return (
    <Document title="Informe completo de maquinaria">
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        <Text style={styles.kicker}>Control de Obra · EPA</Text>
        <Text style={styles.title}>Informe completo de maquinaria — desasolve por semana</Text>
        <Text style={styles.meta}>
          {proyecto.nombreObra} · Período {periodoEtiqueta} · Generado {generado}
        </Text>

        {semanas.map((sem) => (
          <View key={sem.lunes}>
            <Text style={styles.weekTitle}>Semana {sem.etiqueta}</Text>

            <Text style={styles.subTitle}>Contrato desasolve</Text>
            <CabeceraDetalle />
            {sem.desasolve.length === 0 ? (
              <Text style={styles.empty}>Sin jornadas en esta semana.</Text>
            ) : (
              sem.desasolve.map((fila, i) => (
                <FilaDetalle
                  key={`d-${sem.lunes}-${i}`}
                  fecha={fila.fecha}
                  referencia={fila.tramoReferencia}
                  tipo={fila.tipo}
                  ubic={fila.canalUbicacion}
                  equipo={fila.equipo}
                  metros={
                    fila.metros != null && fila.metros > 0
                      ? formatearMetros(fila.metros)
                      : fila.tipo === "Desasolve"
                        ? formatearMetrosDesasolados(0)
                        : "—"
                  }
                  horas={fmtHoras(fila.horas)}
                  detalle={fila.textoDetalle ?? "—"}
                  fondoFila={fondoFilaPorEquipoInformePdf(fila.equipo)}
                />
              ))
            )}

            <Text style={styles.subTitle}>Trabajos complementarios (fuera de contrato)</Text>
            <CabeceraDetalle />
            {sem.complementarios.length === 0 ? (
              <Text style={styles.empty}>Sin complementarios en esta semana.</Text>
            ) : (
              sem.complementarios.map((fila, i) => (
                <FilaDetalle
                  key={`c-${sem.lunes}-${i}`}
                  fecha={fila.fecha}
                  referencia={fila.tramoReferencia}
                  tipo={fila.tipo}
                  ubic={fila.canalUbicacion}
                  equipo={fila.equipo}
                  metros="—"
                  horas={fmtHoras(fila.horas)}
                  detalle={fila.textoDetalle ?? "—"}
                  fondoFila={fondoFilaPorEquipoInformePdf(fila.equipo)}
                />
              ))
            )}
          </View>
        ))}

        {camaBajaPorSemana.length > 0 ? (
          <View style={styles.sectionDivider}>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 8 }}>
              Movimientos con cama baja
            </Text>
            {camaBajaPorSemana.map((sem) => (
              <View key={`cb-${sem.lunes}`}>
                <Text style={styles.weekTitle}>Semana {sem.etiqueta}</Text>
                <View style={styles.tableHead}>
                  <Text style={styles.cCbFecha}>Fecha</Text>
                  <Text style={styles.cCbUnidad}>Cama baja</Text>
                  <Text style={styles.cCbMaq}>Máquina transportada</Text>
                  <Text style={styles.cCbRuta}>Ruta</Text>
                  <Text style={styles.cCbHoras}>Horas</Text>
                  <Text style={styles.cCbObs}>Observaciones</Text>
                </View>
                {sem.filas.map((fila, i) => (
                  <View
                    key={`cb-row-${sem.lunes}-${i}`}
                    style={[
                      styles.tableRow,
                      {
                        backgroundColor: fondoFilaPorEquipoInformePdf(fila.maquinaTransportada),
                      },
                    ]}
                  >
                    <Text style={styles.cCbFecha}>{formatearFechaRegistro(fila.fecha)}</Text>
                    <Text style={styles.cCbUnidad}>{fila.camaBaja}</Text>
                    <Text style={styles.cCbMaq}>{fila.maquinaTransportada}</Text>
                    <Text style={styles.cCbRuta}>{fila.ruta}</Text>
                    <Text style={styles.cCbHoras}>{fmtHoras(fila.horas)}</Text>
                    <Text style={styles.cCbObs}>{fila.observaciones ?? "—"}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  )
}