import type { TicketDesalojo } from "@/src/data/auditoria/types"
import { EQUIPO_MINIMO_ARRENDAMIENTO } from "@/src/data/planilla/equipo-minimo-arrendamiento"
import {
  FILAS_EQUIPOS_UTILIZADOS_EPA,
  FILAS_PERSONAL_UTILIZADO_EPA,
  type DatosHojaLibroObraEpa,
  type FilaCantidadEpa,
  type FilaHorasEquipoEpa,
} from "@/src/data/libro-obra-formato-epa"
import type { EvidenciaGrupo } from "@/src/lib/evidencias-grupo"
import type { LibroObraLineaRegistro } from "@/src/lib/libro-obra"
import {
  equiposDesdeCronograma,
  textoTrabajosDesdeCronograma,
  type DiaCronogramaFrente,
} from "@/src/lib/libro-obra-cronograma-frente"
import type { JornadaMaquinariaProyecto } from "@/src/lib/maquinaria-desasolve-proyecto"
import { detalleJornadasDia } from "@/src/lib/maquinaria-desasolve-resumen"
import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import { nombreEquipoParaMostrar, mapaEquiposPorId } from "@/src/lib/tramo-maquinaria-historial"

const JORNADA_MANANA = "8:00 - 12:30"
const JORNADA_TARDE = "13:00 - 17:30"
const HORAS_JORNADA_COMPLETA = 9

export type OpcionesHojaLibroObraEpa = {
  evidencias?: EvidenciaGrupo[]
  ticketsDesalojoDia?: TicketDesalojo[]
  cronogramaDia?: DiaCronogramaFrente | null
  frenteTitulo?: string
  rubDesazolve?: number
  rubDesalojo?: number
  rubTendido?: number
}

function filaHorasEquipo(nombre: string, horas: number): FilaHorasEquipoEpa {
  if (horas >= 7) {
    return {
      equipo: nombre,
      manana: JORNADA_MANANA,
      tarde: JORNADA_TARDE,
      total: `${formatearNumero(horas, 0)} horas`,
    }
  }
  if (horas > 0) {
    return {
      equipo: nombre,
      manana: "Según registro",
      tarde: "—",
      total: `${formatearNumero(horas, 1)} h`,
    }
  }
  return {
    equipo: nombre,
    manana: JORNADA_MANANA,
    tarde: JORNADA_TARDE,
    total: `${HORAS_JORNADA_COMPLETA} horas`,
  }
}

function trabajosDesdeRegistros(
  lineas: LibroObraLineaRegistro[],
  evidencias: EvidenciaGrupo[]
): string {
  const bullets: string[] = []
  for (const linea of lineas) {
    if (linea.categoria === "maquinaria" || linea.categoria === "desalojo" || linea.categoria === "paralizacion") {
      if (!linea.texto.includes("pendiente")) bullets.push(linea.texto)
    }
  }
  for (const grupo of evidencias) {
    const r = grupo.representante
    const actividad = r.actividad_especifica?.trim() || r.sector
    const lugar = r.ubicacion_abscisa?.trim()
    bullets.push(lugar ? `${actividad} — ${lugar}` : actividad)
  }
  if (bullets.length === 0) {
    return "Sin registro operativo en sistema para esta fecha."
  }
  return `Se ejecutó (registro de campo):\n${bullets.map((b) => `- ${b}`).join("\n")}`
}

function novedadesDesdeLineas(lineas: LibroObraLineaRegistro[], incidencias: number): string {
  const partes = lineas.filter((l) => l.categoria === "paralizacion").map((l) => l.texto)
  if (incidencias > 0) partes.push(`Incidencias de maquinaria: ${incidencias}.`)
  return partes.join("\n")
}

function armarDesdeCronograma(
  cronograma: DiaCronogramaFrente,
  frenteTitulo: string,
  rubDesazolve: number,
  rubDesalojo: number,
  rubTendido: number,
  lineas: LibroObraLineaRegistro[],
  evidencias: EvidenciaGrupo[],
  detalle: ReturnType<typeof detalleJornadasDia>,
  jornadas: JornadaMaquinariaProyecto[],
  equiposCatalogo: ProyectoEquipoMaquinaria[]
): DatosHojaLibroObraEpa {
  const acts = cronograma.actividades
  let trabajos = textoTrabajosDesdeCronograma(frenteTitulo, acts)
  trabajos = trabajos.replace(
    /\(rub\. desalojo VAE\)/g,
    `(rub. ${rubDesalojo})`
  )
  trabajos += `\n\nMediciones VAE (1:1): desazolve rub. ${rubDesazolve}; desalojo rub. ${rubDesalojo}; tendido rub. ${rubTendido}.`

  const registroCampo = trabajosDesdeRegistros(lineas, evidencias)
  if (lineas.some((l) => l.categoria === "maquinaria" || l.categoria === "desalojo")) {
    trabajos += `\n\n${registroCampo}`
  }

  const eq = equiposDesdeCronograma(acts)
  const conteo = new Map<string, number>()
  if (eq.excavadoras > 0) conteo.set("EXCAVADORAS", eq.excavadoras)
  if (eq.volquetas > 0) conteo.set("VOLQUETAS", eq.volquetas)
  if (eq.rtk > 0) conteo.set("RTK", eq.rtk)

  const equiposUtilizados: FilaCantidadEpa[] = FILAS_EQUIPOS_UTILIZADOS_EPA.map((etiqueta) => ({
    etiqueta,
    cantidad: conteo.get(etiqueta) ?? null,
  }))

  const operadores = eq.excavadoras + (eq.volquetas > 0 ? 1 : 0)
  const personalUtilizado: FilaCantidadEpa[] = FILAS_PERSONAL_UTILIZADO_EPA.map((etiqueta) => {
    if (etiqueta === "OPERADORES") return { etiqueta, cantidad: operadores > 0 ? operadores : null }
    if (etiqueta === "RESIDENTES") return { etiqueta, cantidad: 1 }
    if (etiqueta === "TOPÓGRAFOS") return { etiqueta, cantidad: eq.rtk > 0 ? 1 : null }
    if (etiqueta === "CHOFERES") return { etiqueta, cantidad: eq.volquetas > 0 ? eq.volquetas : null }
    if (etiqueta === "CADENERO") return { etiqueta, cantidad: acts.length > 0 ? 1 : null }
    return { etiqueta, cantidad: null }
  })

  const horasEquipos: FilaHorasEquipoEpa[] = []
  const exc = EQUIPO_MINIMO_ARRENDAMIENTO.filter((e) => e.categoria === "desazolve")
  for (let i = 0; i < Math.min(eq.excavadoras, exc.length); i++) {
    horasEquipos.push(filaHorasEquipo(`${exc[i]!.marca} ${exc[i]!.modelo}`.trim(), HORAS_JORNADA_COMPLETA))
  }
  if (eq.volquetas > 0) {
    const v = EQUIPO_MINIMO_ARRENDAMIENTO.find((e) => e.categoria === "desalojo")
    horasEquipos.push(
      filaHorasEquipo(
        eq.volquetas > 1 ? `Volquetas (${eq.volquetas} unidades)` : (v?.nombre ?? "Volqueta"),
        HORAS_JORNADA_COMPLETA
      )
    )
  }
  const tractor = EQUIPO_MINIMO_ARRENDAMIENTO.find((e) => e.id === "tractor-d7g")
  const moto = EQUIPO_MINIMO_ARRENDAMIENTO.find((e) => e.id === "moto-niveladora-120g")
  if (eq.tractor && tractor) {
    horasEquipos.push(filaHorasEquipo(`${tractor.marca} ${tractor.modelo}`, HORAS_JORNADA_COMPLETA))
  }
  if (eq.motoniveladora && moto) {
    horasEquipos.push(filaHorasEquipo(`${moto.marca} ${moto.modelo}`, HORAS_JORNADA_COMPLETA))
  }
  const rtk = EQUIPO_MINIMO_ARRENDAMIENTO.find((e) => e.id === "topo-gps-fjd")
  if (eq.rtk && rtk) {
    horasEquipos.push(filaHorasEquipo(`GPS ${rtk.marca} ${rtk.modelo}`, HORAS_JORNADA_COMPLETA))
  }

  const equiposPorId = mapaEquiposPorId(equiposCatalogo)
  for (const j of jornadas.filter((x) => x.fecha === cronograma.fecha && !x.es_incidencia)) {
    const nombre = nombreEquipoParaMostrar(j, equiposPorId)
    if (!horasEquipos.some((h) => h.equipo === nombre)) {
      const horas = j.duracion_horas ?? HORAS_JORNADA_COMPLETA
      horasEquipos.push(filaHorasEquipo(nombre, horas))
    }
  }

  return {
    equiposUtilizados,
    personalUtilizado,
    trabajosRealizados: trabajos,
    horasEquipos,
    visitaProyecto: `Residente de frente — ${frenteTitulo}. Tramos activos: ${acts.map((a) => a.tramoNombre).join("; ")}.`,
    novedadesObservaciones: novedadesDesdeLineas(lineas, detalle.incidencias),
    comunicaciones: "",
    clima: { manana: "", tarde: "", noche: "" },
  }
}

export function armarDatosHojaLibroObraEpa(
  fecha: string,
  lineasRegistro: LibroObraLineaRegistro[],
  jornadas: JornadaMaquinariaProyecto[],
  equiposCatalogo: ProyectoEquipoMaquinaria[],
  opciones: OpcionesHojaLibroObraEpa = {}
): DatosHojaLibroObraEpa {
  const {
    evidencias = [],
    cronogramaDia = null,
    frenteTitulo = "",
    rubDesazolve = 2,
    rubDesalojo = 3,
    rubTendido = 4,
  } = opciones

  const detalle = detalleJornadasDia(fecha, jornadas, equiposCatalogo)

  if (cronogramaDia && frenteTitulo) {
    return armarDesdeCronograma(
      cronogramaDia,
      frenteTitulo,
      rubDesazolve,
      rubDesalojo,
      rubTendido,
      lineasRegistro,
      evidencias,
      detalle,
      jornadas,
      equiposCatalogo
    )
  }

  return {
    equiposUtilizados: FILAS_EQUIPOS_UTILIZADOS_EPA.map((etiqueta) => ({ etiqueta, cantidad: null })),
    personalUtilizado: FILAS_PERSONAL_UTILIZADO_EPA.map((etiqueta) => ({ etiqueta, cantidad: null })),
    trabajosRealizados: trabajosDesdeRegistros(lineasRegistro, evidencias),
    horasEquipos: [],
    visitaProyecto: "",
    novedadesObservaciones: novedadesDesdeLineas(lineasRegistro, detalle.incidencias),
    comunicaciones: "",
    clima: { manana: "", tarde: "", noche: "" },
  }
}

export function partesFechaLibroObra(fechaIso: string): { dia: string; mes: string; anio: string } {
  const [y, m, d] = fechaIso.split("-")
  return { dia: d ?? "", mes: m ?? "", anio: y ?? "" }
}
