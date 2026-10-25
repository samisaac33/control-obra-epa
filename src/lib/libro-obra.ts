import type { DatosHojaLibroObraEpa } from "@/src/data/libro-obra-formato-epa"
import type { LibroObraFrenteId } from "@/src/data/planilla/libro-obra-frentes"
import {
  agruparRegistrosFotograficos,
  type EvidenciaGrupo,
  type RegistroFotoBase,
} from "@/src/lib/evidencias-grupo"

export type LibroObraLineaRegistro = {
  categoria: "actividad" | "maquinaria" | "desalojo" | "paralizacion"
  texto: string
}

export type LibroObraEntradaDia = {
  fecha: string
  diaSemana: string
  evidencias: EvidenciaGrupo[]
  /** Texto operativo (mapa, volquetas, paralizaciones). */
  lineasRegistro: LibroObraLineaRegistro[]
  /** Frente / residente (planilla desazolve). */
  frenteId?: LibroObraFrenteId
  /** Formato EPA (hoja diaria impresa). */
  formatoEpa?: DatosHojaLibroObraEpa
}

export function claveFechaLocal(isoOClave: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOClave)) return isoOClave

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoOClave))
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function nombreDiaSemana(fechaClave: string): string {
  const fecha = new Date(`${fechaClave}T12:00:00`)
  return capitalizar(
    new Intl.DateTimeFormat("es-EC", { weekday: "long" }).format(fecha)
  )
}

export function formatearFechaLibroObra(fechaClave: string): string {
  const fecha = new Date(`${fechaClave}T12:00:00`)
  return capitalizar(
    new Intl.DateTimeFormat("es-EC", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(fecha)
  )
}

export function formatearHoraCaptura(fechaCaptura: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(fechaCaptura))
}

export function consolidarLibroObra(registros: RegistroFotoBase[]): LibroObraEntradaDia[] {
  const evidenciasPorFecha = new Map<string, EvidenciaGrupo[]>()

  for (const grupo of agruparRegistrosFotograficos(registros)) {
    const clave = claveFechaLocal(grupo.representante.fecha_captura)
    const actual = evidenciasPorFecha.get(clave) ?? []
    actual.push(grupo)
    evidenciasPorFecha.set(clave, actual)
  }

  return [...evidenciasPorFecha.entries()]
    .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
    .map(([fecha, evidencias]) => {
      evidencias.sort(
        (a, b) =>
          new Date(a.representante.fecha_captura).getTime() -
          new Date(b.representante.fecha_captura).getTime()
      )

      return {
        fecha,
        diaSemana: nombreDiaSemana(fecha),
        evidencias,
        lineasRegistro: [],
      }
    })
}

function addDaysIso(fechaIso: string, dias: number): string {
  const d = new Date(`${fechaIso}T12:00:00`)
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function fechasCalendarioInclusive(desde: string, hasta: string): string[] {
  if (!desde || !hasta || desde > hasta) return []
  const fechas: string[] = []
  let cursor = desde
  while (cursor <= hasta) {
    fechas.push(cursor)
    cursor = addDaysIso(cursor, 1)
  }
  return fechas
}

export function filtrarEntradasLibroObra(
  entradas: LibroObraEntradaDia[],
  desde?: string,
  hasta?: string
): LibroObraEntradaDia[] {
  return entradas.filter((entrada) => {
    if (desde && entrada.fecha < desde) return false
    if (hasta && entrada.fecha > hasta) return false
    return true
  })
}
