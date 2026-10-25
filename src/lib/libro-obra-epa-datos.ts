import type { TicketDesalojo } from "@/src/data/auditoria/types"
import type { DiaPlanMaestro } from "@/src/data/planilla/plan-maestro-ejecucion-desasolve"
import {
  FILAS_EQUIPOS_UTILIZADOS_EPA,
  FILAS_PERSONAL_UTILIZADO_EPA,
  type DatosHojaLibroObraEpa,
  type FilaCantidadEpa,
  type FilaHorasEquipoEpa,
} from "@/src/data/libro-obra-formato-epa"
import type { EvidenciaGrupo } from "@/src/lib/evidencias-grupo"
import type { LibroObraLineaRegistro } from "@/src/lib/libro-obra"
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
  planDia?: DiaPlanMaestro | null
  ticketsDesalojoDia?: TicketDesalojo[]
}

function clasificarEquipoEpa(nombre: string): (typeof FILAS_EQUIPOS_UTILIZADOS_EPA)[number] | null {
  const n = nombre.toLowerCase()
  if (n.includes("excavad")) return "EXCAVADORAS"
  if (n.includes("volquet")) return "VOLQUETAS"
  if (n.includes("rtk") || n.includes("gps") || n.includes("sokkia") || n.includes("topo")) return "RTK"
  if (n.includes("camioneta")) return "CAMIONETA"
  if (n.includes("plataforma") || n.includes("cama baja") || n.includes("grúa") || n.includes("grua")) {
    return "CAMA BAJA / PLATAFORMA"
  }
  return null
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

function incrementarConteo(map: Map<string, number>, clase: string, delta: number) {
  map.set(clase, (map.get(clase) ?? 0) + delta)
}

function inferirEquiposDesdeTexto(texto: string, conteo: Map<string, number>) {
  const t = texto.toLowerCase()
  if (t.includes("excavad") || t.includes("doosan") || t.includes("volvo")) incrementarConteo(conteo, "EXCAVADORAS", 1)
  if (t.includes("volquet") || t.includes("mack")) incrementarConteo(conteo, "VOLQUETAS", 1)
  if (t.includes("replanteo") || t.includes("topograf") || t.includes("rtk") || t.includes("gps")) {
    incrementarConteo(conteo, "RTK", 1)
  }
  if (t.includes("camioneta")) incrementarConteo(conteo, "CAMIONETA", 1)
  if (t.includes("plataforma") || t.includes("cama baja") || t.includes("grúa") || t.includes("grua")) {
    incrementarConteo(conteo, "CAMA BAJA / PLATAFORMA", 1)
  }
}

function bulletsPlanMaestro(plan: DiaPlanMaestro): string[] {
  const out: string[] = [`${plan.foco} (día de obra ${plan.diaObra}).`]
  const bloques: [string, string[]][] = [
    ["Trasvase", plan.trasvase],
    ["San Antonio", plan.sanAntonio],
    ["Severino", plan.severino],
    ["Coordinación", plan.transversal],
  ]
  for (const [nombre, tareas] of bloques) {
    for (const t of tareas) {
      out.push(`${nombre}: ${t}`)
    }
  }
  return out
}

function bulletsDesdePlantilla(lineaPlantilla: string): string[] {
  const cuerpo = lineaPlantilla.replace(/^Actividades contractuales programadas:\s*/i, "").trim()
  return cuerpo
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function trabajosDesdeContexto(
  lineas: LibroObraLineaRegistro[],
  detalle: ReturnType<typeof detalleJornadasDia>,
  evidencias: EvidenciaGrupo[],
  planDia: DiaPlanMaestro | null | undefined
): string {
  const bullets: string[] = []

  if (planDia) {
    bullets.push(...bulletsPlanMaestro(planDia))
  }

  const plantilla = lineas.find((l) => l.categoria === "actividad" && l.texto.startsWith("Actividades contractuales"))
  if (plantilla && !planDia) {
    bullets.push(...bulletsDesdePlantilla(plantilla.texto))
  }

  for (const linea of detalle.lineasJornada) {
    const t = linea.replace(/^\-\s*/, "").trim()
    bullets.push(`Maquinaria — ${t}`)
  }

  for (const linea of lineas) {
    if (linea.categoria === "desalojo" || linea.categoria === "paralizacion") {
      bullets.push(linea.texto)
    }
    if (linea.categoria === "maquinaria" && linea.texto.startsWith("Tramo ")) {
      bullets.push(linea.texto)
    }
  }

  for (const grupo of evidencias) {
    const r = grupo.representante
    const actividad = r.actividad_especifica?.trim() || r.sector
    const lugar = r.ubicacion_abscisa?.trim()
    const rubro = r.numero_rubro?.trim()
    const partes = [actividad]
    if (lugar) partes.push(lugar)
    if (rubro) partes.push(`rub. ${rubro}`)
    bullets.push(partes.join(" — "))
  }

  const unicos = [...new Set(bullets.map((b) => b.trim()).filter(Boolean))]
  if (unicos.length === 0) {
    return "Se programaron actividades de desazolve, reconformación de taludes, desalojo (VAE) y trabajos en Severino / Trasvase Manabí según cronograma."
  }

  return `Se inició con los trabajos de:\n${unicos.map((b) => `- ${b}`).join("\n")}`
}

function novedadesDesdeContexto(
  lineas: LibroObraLineaRegistro[],
  incidencias: number
): string {
  const partes: string[] = []
  const paral = lineas.filter((l) => l.categoria === "paralizacion").map((l) => l.texto)
  partes.push(...paral)
  if (incidencias > 0) {
    partes.push(`Incidencias de maquinaria registradas en sistema: ${incidencias}.`)
  }
  return partes.join("\n")
}

function visitaDesdePlan(plan: DiaPlanMaestro | null | undefined): string {
  if (!plan) return ""
  return `Foco del día: ${plan.foco}. Planilla ${plan.planilla} — seguimiento residente y fiscalización EPA.`
}

export function armarDatosHojaLibroObraEpa(
  fecha: string,
  lineasRegistro: LibroObraLineaRegistro[],
  jornadas: JornadaMaquinariaProyecto[],
  equiposCatalogo: ProyectoEquipoMaquinaria[],
  opciones: OpcionesHojaLibroObraEpa = {}
): DatosHojaLibroObraEpa {
  const { evidencias = [], planDia = null, ticketsDesalojoDia = [] } = opciones
  const detalle = detalleJornadasDia(fecha, jornadas, equiposCatalogo)
  const equiposPorId = mapaEquiposPorId(equiposCatalogo)

  const conteoEpa = new Map<string, number>()
  const unicosPorClase = new Map<string, Set<string>>()
  const horasPorNombre = new Map<string, number>()
  const nombresExtra = new Set<string>()

  for (const j of jornadas.filter((x) => x.fecha === fecha && !x.es_incidencia)) {
    const nombre = nombreEquipoParaMostrar(j, equiposPorId)
    const clase = clasificarEquipoEpa(nombre)
    if (clase) {
      const set = unicosPorClase.get(clase) ?? new Set<string>()
      set.add(nombre)
      unicosPorClase.set(clase, set)
    } else {
      nombresExtra.add(nombre)
    }
    const horas =
      j.duracion_horas != null && j.duracion_horas > 0 ? j.duracion_horas : HORAS_JORNADA_COMPLETA
    horasPorNombre.set(nombre, (horasPorNombre.get(nombre) ?? 0) + horas)
  }

  for (const [clase, set] of unicosPorClase) {
    conteoEpa.set(clase, set.size)
  }

  const placasVolqueta = new Set(ticketsDesalojoDia.map((t) => t.placa_volqueta).filter(Boolean))
  if (placasVolqueta.size > 0) {
    conteoEpa.set("VOLQUETAS", Math.max(conteoEpa.get("VOLQUETAS") ?? 0, placasVolqueta.size))
  }

  const lineaPlantilla = lineasRegistro.find((l) => l.texto.startsWith("Actividades contractuales"))
  if (planDia) {
    const textoPlan = bulletsPlanMaestro(planDia).join(" ")
    inferirEquiposDesdeTexto(textoPlan, conteoEpa)
  } else if (lineaPlantilla) {
    inferirEquiposDesdeTexto(lineaPlantilla.texto, conteoEpa)
  }

  for (const grupo of evidencias) {
    const m = grupo.representante.maquinaria_utilizada
    if (m?.trim()) inferirEquiposDesdeTexto(m, conteoEpa)
  }

  for (const [clase, cant] of conteoEpa) {
    if (cant > 0 && !horasPorNombre.has(clase)) {
      const etiqueta =
        clase === "EXCAVADORAS"
          ? "Excavadora"
          : clase === "VOLQUETAS"
            ? "Volqueta"
            : clase === "RTK"
              ? "RTK"
              : clase === "CAMIONETA"
                ? "Camioneta"
                : clase
      horasPorNombre.set(etiqueta, HORAS_JORNADA_COMPLETA)
    }
  }

  for (const nombre of nombresExtra) {
    if (!horasPorNombre.has(nombre)) {
      horasPorNombre.set(nombre, HORAS_JORNADA_COMPLETA)
    }
  }

  const equiposUtilizados: FilaCantidadEpa[] = FILAS_EQUIPOS_UTILIZADOS_EPA.map((etiqueta) => ({
    etiqueta,
    cantidad: conteoEpa.get(etiqueta) ?? null,
  }))

  for (const extra of nombresExtra) {
    equiposUtilizados.push({ etiqueta: extra.toUpperCase(), cantidad: 1 })
  }

  const hayActividad =
    detalle.equiposDistintos > 0 ||
    detalle.totalMetros > 0 ||
    ticketsDesalojoDia.length > 0 ||
    planDia != null ||
    evidencias.length > 0

  const operadores = Math.max(
    detalle.equiposDistintos,
    conteoEpa.get("EXCAVADORAS") ?? 0,
    conteoEpa.get("VOLQUETAS") ?? 0 ? 1 : 0
  )
  const volquetas = conteoEpa.get("VOLQUETAS") ?? 0
  const rtk = conteoEpa.get("RTK") ?? 0

  const personalUtilizado: FilaCantidadEpa[] = FILAS_PERSONAL_UTILIZADO_EPA.map((etiqueta) => {
    if (etiqueta === "OPERADORES") {
      return { etiqueta, cantidad: operadores > 0 ? operadores : hayActividad ? 1 : null }
    }
    if (etiqueta === "RESIDENTES") {
      return { etiqueta, cantidad: hayActividad ? 1 : null }
    }
    if (etiqueta === "TOPÓGRAFOS") {
      return { etiqueta, cantidad: rtk > 0 ? 1 : null }
    }
    if (etiqueta === "CHOFERES") {
      return { etiqueta, cantidad: volquetas > 0 ? volquetas : null }
    }
    if (etiqueta === "CADENERO") {
      return { etiqueta, cantidad: detalle.totalMetros > 0 ? 1 : null }
    }
    return { etiqueta, cantidad: null }
  })

  const horasEquipos: FilaHorasEquipoEpa[] = [...horasPorNombre.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([nombre, horas]) => filaHorasEquipo(nombre, horas))

  return {
    equiposUtilizados,
    personalUtilizado,
    trabajosRealizados: trabajosDesdeContexto(lineasRegistro, detalle, evidencias, planDia),
    horasEquipos,
    visitaProyecto: visitaDesdePlan(planDia),
    novedadesObservaciones: novedadesDesdeContexto(lineasRegistro, detalle.incidencias),
    comunicaciones: "",
    clima: { manana: "", tarde: "", noche: "" },
  }
}

export function partesFechaLibroObra(fechaIso: string): { dia: string; mes: string; anio: string } {
  const [y, m, d] = fechaIso.split("-")
  return { dia: d ?? "", mes: m ?? "", anio: y ?? "" }
}
