import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import {
  ETIQUETA_CLASIFICACION,
  GUIA_ENSAYOS_CONTRATANTE,
  type EnsayoRequeridoGuia,
  type GuiaEnsayoRubro,
} from "@/data/guia-ensayos-contratante-severino"
import { SOLICITUD_CONTRATANTE } from "@/data/ensayos-tolerancias-severino"
import { CONTEXTO_SEVERINO } from "@/data/severino-contexto-calidad"
import { DiagramaFlujoRubro, DiagramaPaso } from "@/lib/sicc/guia-practica-pdf/diagramas-paso"
import { diagramaIdParaPaso } from "@/lib/sicc/guia-practica-pdf/ids-diagrama-por-ensayo"

const PAGE_PADDING = 54
const ACCENT = "#1e3a5f"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.45,
    paddingTop: PAGE_PADDING,
    paddingBottom: PAGE_PADDING,
    paddingHorizontal: PAGE_PADDING,
    color: "#1a1a1a",
  },
  coverTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: ACCENT,
    textAlign: "center",
    marginTop: 80,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#334155",
    marginBottom: 32,
  },
  coverMeta: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
  },
  coverMetaRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  coverLabel: {
    fontFamily: "Helvetica-Bold",
    width: 100,
    color: ACCENT,
  },
  coverValue: {
    flex: 1,
  },
  coverDate: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#64748b",
  },
  pageNumber: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: "#64748b",
  },
  introTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: ACCENT,
    marginBottom: 8,
  },
  paragraph: {
    textAlign: "justify",
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  legendChip: {
    fontSize: 8,
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  rubroHeader: {
    backgroundColor: ACCENT,
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
  rubroHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#ffffff",
  },
  rubroSub: {
    fontSize: 9,
    color: "#e2e8f0",
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: ACCENT,
    marginTop: 8,
    marginBottom: 4,
  },
  actividadBox: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  actividadTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 4,
  },
  badge: {
    fontSize: 8,
    color: ACCENT,
    marginBottom: 6,
  },
  metaLine: {
    fontSize: 8,
    color: "#475569",
    marginBottom: 3,
  },
  pasoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  pasoNumWrap: {
    width: 22,
    height: 22,
    backgroundColor: ACCENT,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pasoNum: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  pasoText: {
    flex: 1,
    fontSize: 9,
    textAlign: "justify",
    paddingRight: 6,
  },
  pasoDiagram: {
    width: 64,
    height: 64,
  },
  fotoTable: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  fotoRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    fontSize: 7,
  },
  fotoRowLast: {
    flexDirection: "row",
    fontSize: 7,
  },
  fotoCellId: {
    width: 48,
    padding: 4,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#f1f5f9",
  },
  fotoCell: {
    width: 88,
    padding: 4,
  },
  fotoCellWide: {
    flex: 1,
    padding: 4,
  },
  docFooter: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 6,
    fontStyle: "italic",
  },
  backNote: {
    marginTop: 60,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
  },
})

function PieDePagina() {
  return (
    <Text
      style={styles.pageNumber}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      fixed
    />
  )
}

function PasosConDiagramas({ ensayo }: { ensayo: EnsayoRequeridoGuia }) {
  return (
    <>
      <Text style={styles.sectionLabel}>Cómo se realiza</Text>
      {ensayo.pasos.map((paso, index) => (
        <View key={`${ensayo.nombre}-paso-${index}`} style={styles.pasoRow} wrap={false}>
          <View style={styles.pasoNumWrap}>
            <Text style={styles.pasoNum}>{index + 1}</Text>
          </View>
          <Text style={styles.pasoText}>{paso}</Text>
          <View style={styles.pasoDiagram}>
            <DiagramaPaso id={diagramaIdParaPaso(ensayo, index)} />
          </View>
        </View>
      ))}
    </>
  )
}

function TablaFotos({ ensayo }: { ensayo: EnsayoRequeridoGuia }) {
  if (ensayo.fotosAdjuntar.length === 0) return null
  return (
    <>
      <Text style={styles.sectionLabel}>Fotos a adjuntar</Text>
      <View style={styles.fotoTable}>
        <View style={styles.fotoRow}>
          <Text style={styles.fotoCellId}>ID</Text>
          <Text style={styles.fotoCell}>Título</Text>
          <Text style={styles.fotoCell}>Momento</Text>
          <Text style={styles.fotoCellWide}>Contenido mínimo</Text>
        </View>
        {ensayo.fotosAdjuntar.map((f, i) => {
          const isLast = i === ensayo.fotosAdjuntar.length - 1
          const rowStyle = isLast ? styles.fotoRowLast : styles.fotoRow
          return (
            <View key={f.id} style={rowStyle}>
              <Text style={styles.fotoCellId}>{f.id}</Text>
              <Text style={styles.fotoCell}>{f.titulo}</Text>
              <Text style={styles.fotoCell}>{f.momento}</Text>
              <Text style={styles.fotoCellWide}>{f.contenidoMinimo}</Text>
            </View>
          )
        })}
      </View>
    </>
  )
}

function BloqueRubro({ guia }: { guia: GuiaEnsayoRubro }) {
  const flujoLabels = guia.ensayosRequeridos.map((e) => e.nombre.split(" ")[0])

  return (
    <View>
      <View style={styles.rubroHeader}>
        <Text style={styles.rubroHeaderText}>
          Rubro {guia.rubroId} — § {guia.seccion}
        </Text>
        <Text style={styles.rubroSub}>{guia.imagenReferencia}</Text>
      </View>
      <Text style={styles.actividadTitle}>{guia.actividadContractual}</Text>
      <Text style={styles.paragraph}>{guia.quePideLaContratante}</Text>
      <Text style={styles.sectionLabel}>Flujo de actividades del rubro</Text>
      <View style={{ marginBottom: 10 }}>
        <DiagramaFlujoRubro etiquetas={flujoLabels} />
      </View>
      {guia.ensayosRequeridos.map((ensayo) => (
        <View key={ensayo.nombre} style={styles.actividadBox}>
          <Text style={styles.actividadTitle}>{ensayo.nombre}</Text>
          <Text style={styles.badge}>{ETIQUETA_CLASIFICACION[ensayo.clasificacion]}</Text>
          <Text style={styles.paragraph}>{ensayo.descripcionPractica}</Text>
          <Text style={styles.metaLine}>Instrumento: {ensayo.instrumento}</Text>
          <Text style={styles.metaLine}>Norma: {ensayo.normaReferencia}</Text>
          <Text style={styles.metaLine}>Evidencia: {ensayo.evidenciaAEntregar}</Text>
          <PasosConDiagramas ensayo={ensayo} />
          <TablaFotos ensayo={ensayo} />
        </View>
      ))}
      <Text style={styles.docFooter}>
        Documentos generados: {guia.documentosGenerados.join(" · ")}
      </Text>
    </View>
  )
}

export type GuiaPracticaSeverinoPdfProps = {
  fechaGeneracion?: string
}

export function GuiaPracticaSeverinoPdfDocument({
  fechaGeneracion,
}: GuiaPracticaSeverinoPdfProps) {
  const fecha =
    fechaGeneracion ??
    new Date().toLocaleDateString("es-EC", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const ctx = CONTEXTO_SEVERINO.confirmado
  const leyenda = Object.values(ETIQUETA_CLASIFICACION)

  return (
    <Document
      title="Guía práctica — Ensayos y tolerancias EB Severino"
      author={SOLICITUD_CONTRATANTE.entidad}
      subject={`Planilla ${SOLICITUD_CONTRATANTE.planillaReferencia}`}
      creator="Control Obra EPA — SICC Calidad"
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.coverTitle}>Guía práctica de ensayos y tolerancias</Text>
        <Text style={styles.coverSubtitle}>
          {SOLICITUD_CONTRATANTE.categoria}
        </Text>
        <Text style={[styles.coverSubtitle, { fontSize: 11 }]}>
          Secciones § 1.5, 2.5, 3.5 y 4.5 — Planilla {SOLICITUD_CONTRATANTE.planillaReferencia}
        </Text>
        <View style={styles.coverMeta}>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverLabel}>Contratante</Text>
            <Text style={styles.coverValue}>{SOLICITUD_CONTRATANTE.entidad}</Text>
          </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverLabel}>Contrato</Text>
            <Text style={styles.coverValue}>{ctx.numeroContrato}</Text>
          </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverLabel}>Obra</Text>
            <Text style={styles.coverValue}>{ctx.nombreObra}</Text>
          </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverLabel}>Ubicación</Text>
            <Text style={styles.coverValue}>{ctx.ubicacion}</Text>
          </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverLabel}>Equipo</Text>
            <Text style={styles.coverValue}>
              {ctx.unidadesOperativas} unidades · {ctx.caudalUnitarioM3s} m³/s ·{" "}
              {ctx.potenciaMotorKw} kW
            </Text>
          </View>
        </View>
        <Text style={styles.coverDate}>Generado: {fecha}</Text>
        <PieDePagina />
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.introTitle}>Introducción</Text>
        <Text style={styles.paragraph}>
          Este documento interpreta de forma operativa lo solicitado por la entidad contratante
          tras la presentación de la Planilla {SOLICITUD_CONTRATANTE.planillaReferencia}: procedimiento
          en campo, clasificación de cada actividad (ensayo, medición, inspección, etc.), pasos de
          ejecución con referencia gráfica y fotos mínimas para el expediente. No sustituye el pliego
          ni los actas firmadas; orienta al equipo de obra y calidad.
        </Text>
        <Text style={styles.sectionLabel}>Clasificaciones usadas en la guía</Text>
        <View style={styles.legendRow}>
          {leyenda.map((l) => (
            <Text key={l} style={styles.legendChip}>
              {l}
            </Text>
          ))}
        </View>
        <PieDePagina />
      </Page>

      {GUIA_ENSAYOS_CONTRATANTE.map((guia) => (
        <Page key={guia.rubroId} size="LETTER" style={styles.page} wrap>
          <BloqueRubro guia={guia} />
          <PieDePagina />
        </Page>
      ))}

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.introTitle}>Nota de replicación</Text>
        <View style={styles.backNote}>
          <Text style={styles.paragraph}>{ctx.notaReplicacion}</Text>
          <Text style={styles.paragraph}>
            Cantidades contractuales de referencia: desmontaje motores{" "}
            {ctx.cantidadesContrato.desmontajeMotores}, desmontaje bombas{" "}
            {ctx.cantidadesContrato.desmontajeBombas}, corrección de ejes{" "}
            {ctx.cantidadesContrato.correccionEjes}, mantenimiento de motores{" "}
            {ctx.cantidadesContrato.mantenimientoMotores}.
          </Text>
          <Text style={styles.paragraph}>
            Solicitud de la contratante: {SOLICITUD_CONTRATANTE.resumen}
          </Text>
        </View>
        <PieDePagina />
      </Page>
    </Document>
  )
}
