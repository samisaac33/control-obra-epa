import { Document, Page, Text, View } from "@react-pdf/renderer"

import type { RelojPublicoInformeData } from "@/src/data/infimas/reloj-publico-types"

import { relojPublicoPdfStyles as styles } from "./relojPublicoPdfStyles"

type Props = {
  data: RelojPublicoInformeData
}

function PieDePagina() {
  return (
    <Text
      style={styles.pageNumber}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      fixed
    />
  )
}

export function RelojInformeActividadesPdfDocument({ data }: Props) {
  const { contrato, periodo, fechaCarta } = data
  const destinatario = `${contrato.administrador.nombre}\nAdministrador del contrato\nGobierno Provincial de Manabí`

  return (
    <Document
      title="Informe de actividades"
      author={contrato.proveedor.nombre}
      subject={contrato.objetoContractual}
      creator="Control Obra EPA"
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.fecha}>{fechaCarta}</Text>
        <Text style={styles.destinatario}>{destinatario}</Text>
        <Text style={styles.cuerpo}>
          Por medio del presente, hago entrega de los informes del {contrato.objetoContractual}{" "}
          {periodo.fechasTexto.periodoLargo}.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colSemana, styles.headerCell]}>SEMANA</Text>
            <Text style={[styles.colAnio, styles.headerCell]}>AÑO</Text>
            <Text style={[styles.colActividad, styles.headerCell]}>ACTIVIDAD</Text>
            <Text style={[styles.colObservacion, styles.headerCell]}>OBSERVACIÓN</Text>
          </View>
          {periodo.filasInforme.map((fila, index) => {
            const isLast = index === periodo.filasInforme.length - 1
            return (
              <View key={index} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <Text style={styles.colSemana}>{fila.semanaLabel}</Text>
                <Text style={styles.colAnio}>{fila.anio}</Text>
                <Text style={styles.colActividad}>{fila.actividad}</Text>
                <Text style={styles.colObservacion}>{fila.observacion}</Text>
              </View>
            )
          })}
        </View>

        <Text style={[styles.cuerpo, { marginTop: 24, fontFamily: "Times-Bold" }]}>ATENTAMENTE</Text>
        <View style={styles.firmaBlock}>
          <Text style={styles.firmaNombre}>{contrato.proveedor.nombre}</Text>
          <Text style={styles.firmaLinea}>{contrato.proveedor.ruc}</Text>
        </View>
        <PieDePagina />
      </Page>
    </Document>
  )
}
