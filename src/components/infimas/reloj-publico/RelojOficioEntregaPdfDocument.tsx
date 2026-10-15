import { Document, Page, Text, View } from "@react-pdf/renderer"

import type { RelojPublicoCartaData } from "@/src/data/infimas/reloj-publico-types"

import { relojPublicoPdfStyles as styles } from "./relojPublicoPdfStyles"

type Props = {
  data: RelojPublicoCartaData
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

export function RelojOficioEntregaPdfDocument({ data }: Props) {
  const { contrato, periodo, fechaCarta } = data
  const destinatario = `${contrato.administrador.nombre}\n${contrato.administrador.cargoLineas.join(" ")}`

  return (
    <Document
      title="Oficio de entrega"
      author={contrato.proveedor.nombre}
      subject={contrato.objetoContractual}
      creator="Control Obra EPA"
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.fecha}>{fechaCarta}</Text>
        <Text style={styles.destinatario}>{destinatario}</Text>
        <Text style={styles.cuerpo}>
          Por medio de la presente hago la entrega del informe de los servicios de mantenimiento
          preventivo y correctivo durante el periodo {periodo.fechasTexto.periodoLargo},
          correspondiente al {contrato.objetoContractual}.
        </Text>
        <Text style={styles.cuerpo}>Atentamente,</Text>
        <View style={styles.firmaBlock}>
          <Text style={styles.firmaNombre}>{contrato.proveedor.nombre}</Text>
          <Text style={styles.firmaLinea}>{contrato.proveedor.ruc}</Text>
        </View>
        <PieDePagina />
      </Page>
    </Document>
  )
}
