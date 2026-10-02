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

export function RelojOficioNotificacionPdfDocument({ data }: Props) {
  const { contrato, periodo, fechaCarta } = data
  const destinatario = [contrato.administrador.nombre, ...contrato.administrador.cargoLineas].join("\n")

  return (
    <Document
      title="Oficio de notificación"
      author={contrato.proveedor.nombre}
      subject={contrato.objetoContractual}
      creator="Control Obra EPA"
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.fecha}>{fechaCarta}</Text>
        <Text style={styles.destinatario}>{destinatario}</Text>
        <Text style={styles.fecha}>Ciudad.-</Text>
        <Text style={styles.cuerpo}>De mi consideración:</Text>
        <Text style={styles.cuerpo}>
          Por medio del presente documento notifico que procederé a ejecutar las actividades de
          mantenimiento preventivo y correctivo del reloj público, correspondientes al periodo{" "}
          {periodo.fechasTexto.periodoLargo}, en el marco del contrato {contrato.codigo}. Informo
          que, una vez culminado dicho periodo, remitiré la documentación respectiva solicitando
          que se reciba el servicio entregado a conformidad.
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
