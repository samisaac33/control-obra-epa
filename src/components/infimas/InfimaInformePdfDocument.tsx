import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import type { InfimaAnexoFotografico, InfimaInformeData, InfimaSeccion } from "@/src/data/infimas/types"

const PAGE_PADDING = 72
const CONTENT_WIDTH = 612 - PAGE_PADDING * 2

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 12,
    lineHeight: 2,
    paddingTop: PAGE_PADDING,
    paddingBottom: PAGE_PADDING,
    paddingHorizontal: PAGE_PADDING,
    color: "#000000",
  },
  title: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 24,
  },
  memoBlock: {
    marginBottom: 24,
  },
  memoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  memoLabel: {
    fontFamily: "Times-Bold",
    width: 72,
  },
  memoValue: {
    flex: 1,
  },
  memoAsuntoBlock: {
    marginBottom: 4,
  },
  memoAsuntoValue: {
    lineHeight: 1.5,
    textAlign: "justify",
  },
  heading1: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  heading2: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  paragraph: {
    textAlign: "justify",
    marginBottom: 0,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 0,
    paddingLeft: 24,
  },
  bullet: {
    width: 12,
  },
  listText: {
    flex: 1,
    textAlign: "justify",
  },
  table: {
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#cccccc",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableLabel: {
    fontFamily: "Times-Bold",
    width: "38%",
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#cccccc",
    backgroundColor: "#f7f7f7",
  },
  tableValue: {
    width: "62%",
    padding: 6,
    textAlign: "justify",
  },
  signatureBlock: {
    marginTop: 36,
  },
  signatureLine: {
    marginBottom: 4,
  },
  pageNumber: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 11,
  },
  anexoIntro: {
    textAlign: "justify",
    marginBottom: 16,
    lineHeight: 1.6,
  },
  figuraImage: {
    width: CONTENT_WIDTH,
    height: 340,
    objectFit: "contain",
    marginBottom: 12,
  },
  figuraCaption: {
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: "center",
  },
})

type InfimaInformePdfDocumentProps = {
  informe: InfimaInformeData
  resolverImagen?: (archivo: string) => string
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

function Parrafos({ textos }: { textos: string[] }) {
  return (
    <>
      {textos.map((texto, index) => (
        <Text key={index} style={styles.paragraph}>
          {texto}
        </Text>
      ))}
    </>
  )
}

function ListaItems({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem} wrap={false}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </>
  )
}

function SeccionPdf({ seccion, numero }: { seccion: InfimaSeccion; numero: number }) {
  return (
    <View>
      <Text style={styles.heading1}>
        {numero}. {seccion.titulo}
      </Text>
      {seccion.parrafos ? <Parrafos textos={seccion.parrafos} /> : null}
      {seccion.items ? <ListaItems items={seccion.items} /> : null}
      {seccion.subsecciones?.map((sub, index) => (
        <View key={index}>
          <Text style={styles.heading2}>
            {numero}.{index + 1}. {sub.titulo}
          </Text>
          {sub.parrafos ? <Parrafos textos={sub.parrafos} /> : null}
          {sub.items ? <ListaItems items={sub.items} /> : null}
        </View>
      ))}
    </View>
  )
}

function PaginaAnexoFigura({
  anexo,
  resolverImagen,
  mostrarEncabezado,
}: {
  anexo: InfimaAnexoFotografico
  resolverImagen?: (archivo: string) => string
  mostrarEncabezado: boolean
}) {
  const src = resolverImagen ? resolverImagen(anexo.archivo) : anexo.archivo

  return (
    <Page size="LETTER" style={styles.page}>
      {mostrarEncabezado ? (
        <>
          <Text style={styles.heading1}>7. ANEXO: REGISTRO FOTOGRÁFICO</Text>
          <Text style={styles.anexoIntro}>
            A continuación, se presenta el registro fotográfico de las actividades ejecutadas
            durante la rehabilitación integral de la compuerta Leopoldo Cedeño.
          </Text>
        </>
      ) : null}
      <Image src={src} style={styles.figuraImage} />
      <Text style={styles.figuraCaption}>
        Figura {anexo.numero}. {anexo.descripcion}
      </Text>
      <PieDePagina />
    </Page>
  )
}

export function InfimaInformePdfDocument({
  informe,
  resolverImagen,
}: InfimaInformePdfDocumentProps) {
  return (
    <Document
      title={informe.titulo}
      author={informe.de}
      subject={informe.asunto}
      creator="Control Obra EPA"
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{informe.titulo}</Text>

        <View style={styles.memoBlock}>
          <View style={styles.memoRow}>
            <Text style={styles.memoLabel}>FECHA:</Text>
            <Text style={styles.memoValue}>{informe.fecha}</Text>
          </View>
          <View style={styles.memoRow}>
            <Text style={styles.memoLabel}>PARA:</Text>
            <Text style={styles.memoValue}>{informe.para}</Text>
          </View>
          <View style={styles.memoRow}>
            <Text style={styles.memoLabel}>DE:</Text>
            <Text style={styles.memoValue}>{informe.de}</Text>
          </View>
          <View style={styles.memoAsuntoBlock}>
            <Text style={styles.memoLabel}>ASUNTO:</Text>
            <Text style={styles.memoAsuntoValue}>{informe.asunto}</Text>
          </View>
        </View>

        <Text style={styles.heading1}>1. DATOS GENERALES DEL PROYECTO</Text>
        <View style={styles.table}>
          {informe.datosGenerales.map((dato, index) => {
            const isLast = index === informe.datosGenerales.length - 1
            return (
              <View key={dato.etiqueta} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <Text style={styles.tableLabel}>{dato.etiqueta}</Text>
                <Text style={styles.tableValue}>{dato.valor}</Text>
              </View>
            )
          })}
        </View>

        {informe.secciones.map((seccion, index) => (
          <SeccionPdf key={seccion.titulo} seccion={seccion} numero={index + 2} />
        ))}

        <PieDePagina />
      </Page>

      {informe.anexosFotograficos.map((anexo, index) => (
        <PaginaAnexoFigura
          key={anexo.numero}
          anexo={anexo}
          resolverImagen={resolverImagen}
          mostrarEncabezado={index === 0}
        />
      ))}

      <Page size="LETTER" style={styles.page}>
        <View style={styles.signatureBlock}>
          <Text style={styles.paragraph}>Atentamente,</Text>
          <Text style={[styles.signatureLine, { marginTop: 48 }]}>{informe.firma.nombre}</Text>
          <Text style={styles.signatureLine}>{informe.firma.ruc}</Text>
          <Text style={styles.signatureLine}>{informe.firma.cargo}</Text>
        </View>
        <PieDePagina />
      </Page>
    </Document>
  )
}
