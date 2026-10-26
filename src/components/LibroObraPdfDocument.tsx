import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import {
  CONSORCIO_CONTRATISTA_RAZON,
  LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH,
  LOGO_EPA_PUBLIC_PATH,
} from "@/src/data/brand/logos-proyecto"
import { OBJETO_CONTRATO } from "@/src/data/contrato-emergencia-severino-trasvase"
import { PROVINCIA_LIBRO_OBRA_EPA } from "@/src/data/libro-obra-formato-epa"
import { partesFechaLibroObra } from "@/src/lib/libro-obra-epa-datos"
import type { LibroObraEntradaDia } from "@/src/lib/libro-obra"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#0a0a0a",
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
    paddingBottom: 4,
    marginBottom: 4,
  },
  logoEpa: { width: 78, height: 26, objectFit: "contain" },
  logoConsorcio: { width: 58, height: 32, objectFit: "contain" },
  headerCentro: { flex: 1, alignItems: "center", paddingHorizontal: 6 },
  titulo: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  fechaTabla: { borderWidth: 1, borderColor: "#171717", width: 90 },
  fechaFila: { flexDirection: "row" },
  fechaCeldaHead: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#171717",
    backgroundColor: "#f5f5f5",
    paddingVertical: 1,
    paddingHorizontal: 2,
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    textAlign: "center",
    textTransform: "uppercase",
  },
  fechaCelda: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#171717",
    paddingVertical: 2,
    paddingHorizontal: 2,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textAlign: "center",
  },
  labelMini: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  objetoBox: {
    borderWidth: 1,
    borderColor: "#171717",
    padding: 3,
    fontSize: 7,
    marginBottom: 3,
    lineHeight: 1.25,
  },
  provincia: { fontSize: 7.5, marginBottom: 3 },
  provinciaBold: { fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  tabla: { borderWidth: 1, borderColor: "#171717", marginBottom: 3 },
  fila: { flexDirection: "row" },
  th: {
    borderWidth: 0.5,
    borderColor: "#171717",
    backgroundColor: "#f5f5f5",
    paddingVertical: 2,
    paddingHorizontal: 3,
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    textTransform: "uppercase",
  },
  thLeft: {
    borderWidth: 0.5,
    borderColor: "#171717",
    backgroundColor: "#f5f5f5",
    paddingVertical: 2,
    paddingHorizontal: 3,
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
  },
  td: {
    borderWidth: 0.5,
    borderColor: "#171717",
    paddingVertical: 2,
    paddingHorizontal: 3,
    fontSize: 7.5,
  },
  tdCenter: { textAlign: "center" },
  dosColumnas: { flexDirection: "row", marginBottom: 3 },
  col: { flex: 1, marginRight: 2 },
  colLast: { flex: 1, marginLeft: 2 },
  area: {
    borderWidth: 1,
    borderColor: "#171717",
    padding: 3,
    marginBottom: 3,
    fontSize: 7.5,
    lineHeight: 1.3,
    minHeight: 18,
  },
  bloqueTitulo: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    marginBottom: 1,
    color: "#262626",
  },
  anexoNota: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Oblique",
    color: "#525252",
    marginBottom: 4,
  },
  firmas: {
    flexDirection: "row",
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#171717",
    paddingTop: 12,
  },
  firmaCol: {
    flex: 1,
    alignItems: "center",
    minHeight: 56,
    justifyContent: "flex-end",
    marginHorizontal: 8,
  },
  firmaLinea: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
    marginBottom: 6,
    minHeight: 36,
  },
  firmaLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
  },
})

type LogosPdf = {
  epa: string
  consorcio: string
}

type LibroObraPdfDocumentProps = {
  entradas: LibroObraEntradaDia[]
  logos: LogosPdf
}

function CeldaHead({
  children,
  flex = 1,
  left = false,
}: {
  children: string
  flex?: number
  left?: boolean
}) {
  return (
    <Text style={[left ? styles.thLeft : styles.th, { flex }]}>{children}</Text>
  )
}

function Celda({
  children,
  flex = 1,
  center = false,
}: {
  children: string
  flex?: number
  center?: boolean
}) {
  return (
    <Text style={[styles.td, center ? styles.tdCenter : {}, { flex }]}>
      {children || " "}
    </Text>
  )
}

function HojaEpaPdf({
  entrada,
  logos,
}: {
  entrada: LibroObraEntradaDia
  logos: LogosPdf
}) {
  const epa = entrada.formatoEpa
  if (!epa) return null

  const { dia, mes, anio } = partesFechaLibroObra(entrada.fecha)
  const comunicacionesVacias = !epa.comunicaciones?.trim()

  return (
    <Page size="A4" style={styles.page} wrap={false}>
      <View style={styles.header}>
        <Image src={logos.epa} style={styles.logoEpa} />
        <View style={styles.headerCentro}>
          <Text style={styles.titulo}>Libro de obra</Text>
          <View style={styles.fechaTabla}>
            <View style={styles.fechaFila}>
              <Text style={[styles.fechaCeldaHead, { flex: 3 }]}>Fecha</Text>
            </View>
            <View style={styles.fechaFila}>
              <Text style={styles.fechaCeldaHead}>Día</Text>
              <Text style={styles.fechaCeldaHead}>Mes</Text>
              <Text style={styles.fechaCeldaHead}>Año</Text>
            </View>
            <View style={styles.fechaFila}>
              <Text style={styles.fechaCelda}>{dia}</Text>
              <Text style={styles.fechaCelda}>{mes}</Text>
              <Text style={styles.fechaCelda}>{anio}</Text>
            </View>
          </View>
        </View>
        <Image src={logos.consorcio} style={styles.logoConsorcio} />
      </View>

      <Text style={styles.labelMini}>Objeto contractual</Text>
      <Text style={styles.objetoBox}>{OBJETO_CONTRATO}</Text>

      <Text style={styles.provincia}>
        <Text style={styles.provinciaBold}>Provincia: </Text>
        {PROVINCIA_LIBRO_OBRA_EPA}
      </Text>

      <View style={styles.tabla}>
        <View style={styles.fila}>
          <CeldaHead flex={3}>Estado del tiempo</CeldaHead>
        </View>
        <View style={styles.fila}>
          <CeldaHead>Mañana</CeldaHead>
          <CeldaHead>Tarde</CeldaHead>
          <CeldaHead>Noche</CeldaHead>
        </View>
        <View style={styles.fila}>
          <Celda center>{epa.clima.manana || " "}</Celda>
          <Celda center>{epa.clima.tarde || " "}</Celda>
          <Celda center>{epa.clima.noche || " "}</Celda>
        </View>
      </View>

      <View style={styles.dosColumnas}>
        <View style={[styles.tabla, styles.col]}>
          <View style={styles.fila}>
            <CeldaHead left flex={4}>
              Equipos utilizados
            </CeldaHead>
            <CeldaHead flex={1}>Cant.</CeldaHead>
          </View>
          {epa.equiposUtilizados.map((f) => (
            <View style={styles.fila} key={f.etiqueta}>
              <Celda flex={4}>{f.etiqueta}</Celda>
              <Celda flex={1} center>
                {f.cantidad != null ? String(f.cantidad) : " "}
              </Celda>
            </View>
          ))}
        </View>
        <View style={[styles.tabla, styles.colLast]}>
          <View style={styles.fila}>
            <CeldaHead left flex={4}>
              Personal utilizado
            </CeldaHead>
            <CeldaHead flex={1}>Cant.</CeldaHead>
          </View>
          {epa.personalUtilizado.map((f) => (
            <View style={styles.fila} key={f.etiqueta}>
              <Celda flex={4}>{f.etiqueta}</Celda>
              <Celda flex={1} center>
                {f.cantidad != null ? String(f.cantidad) : " "}
              </Celda>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.labelMini}>Visita al proyecto</Text>
      <Text style={styles.area}>{epa.visitaProyecto || " "}</Text>

      <Text style={styles.labelMini}>Trabajos realizados</Text>
      {epa.bloquesFrente && epa.bloquesFrente.length > 0 ? (
        <View>
          {epa.bloquesFrente.map((bloque) => (
            <View key={bloque.id} style={{ marginBottom: 3 }}>
              <Text style={styles.bloqueTitulo}>
                {bloque.titulo} — {bloque.residente}
              </Text>
              <Text style={styles.area}>{bloque.trabajosRealizados}</Text>
            </View>
          ))}
          {epa.bloqueSeverino ? (
            <View style={{ marginBottom: 3 }}>
              <Text style={styles.bloqueTitulo}>
                {epa.bloqueSeverino.titulo} — {epa.bloqueSeverino.residente}
              </Text>
              <Text style={styles.area}>{epa.bloqueSeverino.trabajosRealizados}</Text>
            </View>
          ) : null}
          {epa.registroCampoDia?.trim() ? (
            <View style={{ marginBottom: 3 }}>
              <Text style={styles.bloqueTitulo}>
                Registro de campo (maquinaria / desalojo)
              </Text>
              <Text style={styles.area}>{epa.registroCampoDia}</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <Text style={styles.area}>{epa.trabajosRealizados || " "}</Text>
      )}

      <View style={styles.tabla}>
        <View style={styles.fila}>
          <CeldaHead left flex={3}>
            Equipos
          </CeldaHead>
          <CeldaHead>Mañana</CeldaHead>
          <CeldaHead>Tarde</CeldaHead>
          <CeldaHead>Total</CeldaHead>
        </View>
        {epa.horasEquipos.length > 0 ? (
          epa.horasEquipos.map((f) => (
            <View style={styles.fila} key={f.equipo}>
              <Celda flex={3}>{f.equipo}</Celda>
              <Celda center>{f.manana}</Celda>
              <Celda center>{f.tarde}</Celda>
              <Celda center>{f.total}</Celda>
            </View>
          ))
        ) : (
          <View style={styles.fila}>
            <Celda flex={6} center>
              Sin equipos registrados este día
            </Celda>
          </View>
        )}
      </View>

      <Text style={styles.labelMini}>Novedades y observaciones</Text>
      <Text style={styles.area}>{epa.novedadesObservaciones || " "}</Text>

      {!comunicacionesVacias ? (
        <View>
          <Text style={styles.labelMini}>
            Comunicaciones enviadas por el fiscalizador y/o contratista
          </Text>
          <Text style={styles.area}>{epa.comunicaciones}</Text>
        </View>
      ) : null}

      <Text style={styles.anexoNota}>
        Anexo fotográfico: pendiente. Las fotos se agregan al cargarlas en módulo Fotos.
      </Text>

      <View style={styles.firmas}>
        <View style={styles.firmaCol}>
          <View style={styles.firmaLinea} />
          <Text style={styles.firmaLabel}>Contratista</Text>
        </View>
        <View style={styles.firmaCol}>
          <View style={styles.firmaLinea} />
          <Text style={styles.firmaLabel}>Fiscalizador</Text>
        </View>
      </View>
    </Page>
  )
}

export function LibroObraPdfDocument({ entradas, logos }: LibroObraPdfDocumentProps) {
  const conEpa = entradas.filter((e) => e.formatoEpa)

  return (
    <Document
      title="Libro de obra"
      author={CONSORCIO_CONTRATISTA_RAZON}
      subject="Libro de obra EPA"
    >
      {conEpa.map((entrada) => (
        <HojaEpaPdf key={entrada.fecha} entrada={entrada} logos={logos} />
      ))}
    </Document>
  )
}

export function rutasLogosLibroObra(origen: string): LogosPdf {
  const base = origen.replace(/\/$/, "")
  return {
    epa: `${base}${LOGO_EPA_PUBLIC_PATH}`,
    consorcio: `${base}${LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH}`,
  }
}
