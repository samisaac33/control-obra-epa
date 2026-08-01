import {
  ACCIONISTA_META,
  type Accionista,
  type DuracionEquipo,
  type RegistroDia,
  PERIODO_MAQUINARIA,
  REGISTRO_MAQUINARIA,
} from "@/src/data/registro-maquinaria"
import { etiquetaDuracion, formatearFechaCorta, normalizarDuracion } from "@/src/lib/maquinaria-resumen"

export type FilaMatriz = {
  id: string
  equipo: string
  accionista: Accionista
  esViajes: boolean
  esActividad: boolean
}

export type CeldaMatriz = {
  intensidad: number
  duracion: DuracionEquipo
  cantidad: number
  etiqueta: string
  nota?: string
}

export type ColumnaMatriz = {
  fecha: string
  diaSemana: string
  trabajado: boolean | null
  sinRegistro: boolean
  eventos: string[]
}

export type MatrizCalendario = {
  columnas: ColumnaMatriz[]
  filas: FilaMatriz[]
  celdas: Map<string, CeldaMatriz>
}

const ORDEN_EQUIPOS = [
  "Excavadora brazo largo",
  "Tractor",
  "Volqueta",
  "Gallineta",
  "Payloader",
  "Motoniveladora",
  "Rodillo",
  "Excavadora brazo corto",
  "Viajes de arena",
  "Descarga de tubos de hormigón",
  "Descarga de segundo lote de tubos de hormigón",
  "Instalación de tubos",
] as const

function claveCelda(filaId: string, fecha: string): string {
  return `${filaId}::${fecha}`
}

function claveFila(equipo: string, accionista: Accionista): string {
  return `${equipo}::${accionista}`
}

export function generarRangoFechas(inicio: string, fin: string): string[] {
  const fechas: string[] = []
  const cursor = new Date(`${inicio}T12:00:00`)
  const limite = new Date(`${fin}T12:00:00`)

  while (cursor <= limite) {
    fechas.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }

  return fechas
}

function diaSemanaCorto(fechaIso: string): string {
  const fecha = new Date(`${fechaIso}T12:00:00`)
  return new Intl.DateTimeFormat("es-EC", { weekday: "narrow" }).format(fecha)
}

function construirFilas(dias: RegistroDia[]): FilaMatriz[] {
  const vistos = new Set<string>()
  const filas: FilaMatriz[] = []

  for (const dia of dias) {
    for (const registro of dia.registros) {
      const id = claveFila(registro.equipo, registro.accionista)
      if (vistos.has(id)) continue
      vistos.add(id)
      filas.push({
        id,
        equipo: registro.equipo,
        accionista: registro.accionista,
        esViajes: registro.duracion === "viajes",
        esActividad: registro.duracion === "actividad",
      })
    }
  }

  return filas.sort((a, b) => {
    if (a.accionista !== b.accionista) {
      return a.accionista === "consorcio" ? -1 : 1
    }
    const idxA = ORDEN_EQUIPOS.indexOf(a.equipo as (typeof ORDEN_EQUIPOS)[number])
    const idxB = ORDEN_EQUIPOS.indexOf(b.equipo as (typeof ORDEN_EQUIPOS)[number])
    const ordenA = idxA === -1 ? 99 : idxA
    const ordenB = idxB === -1 ? 99 : idxB
    if (ordenA !== ordenB) return ordenA - ordenB
    return a.equipo.localeCompare(b.equipo, "es")
  })
}

function mapaDiasRegistrados(dias: RegistroDia[]): Map<string, RegistroDia> {
  return new Map(dias.map((dia) => [dia.fecha, dia]))
}

function eventosDeColumna(dia: RegistroDia | undefined): string[] {
  if (!dia) return []
  const eventos: string[] = []
  if (!dia.trabajado) eventos.push("Sin actividad en obra")
  for (const registro of dia.registros) {
    if (registro.nota) eventos.push(`${registro.equipo}: ${registro.nota}`)
    if (registro.duracion === "actividad") {
      eventos.push(registro.equipo)
    }
  }
  return eventos
}

export type RangoMatrizCalendario = {
  inicio: string
  fin: string
}

export function construirMatrizCalendario(
  dias: RegistroDia[] = REGISTRO_MAQUINARIA,
  rango: RangoMatrizCalendario = PERIODO_MAQUINARIA
): MatrizCalendario {
  const mapaDias = mapaDiasRegistrados(dias)
  const fechas = generarRangoFechas(rango.inicio, rango.fin)
  const filas = construirFilas(dias)
  const celdas = new Map<string, CeldaMatriz>()

  const columnas: ColumnaMatriz[] = fechas.map((fecha) => {
    const dia = mapaDias.get(fecha)
    return {
      fecha,
      diaSemana: diaSemanaCorto(fecha),
      trabajado: dia ? dia.trabajado : null,
      sinRegistro: !dia,
      eventos: eventosDeColumna(dia),
    }
  })

  for (const dia of dias) {
    if (!dia.trabajado) continue

    for (const registro of dia.registros) {
      const filaId = claveFila(registro.equipo, registro.accionista)
      const key = claveCelda(filaId, dia.fecha)
      const existente = celdas.get(key)
      const cantidad = registro.cantidad ?? 1
      const intensidad =
        registro.duracion === "viajes" || registro.duracion === "actividad"
          ? cantidad
          : normalizarDuracion(registro)

      if (existente) {
        existente.intensidad += intensidad
        existente.cantidad += cantidad
        existente.etiqueta = `${existente.etiqueta}; ${etiquetaDuracion(registro)}`
        if (registro.nota) existente.nota = registro.nota
      } else {
        celdas.set(key, {
          intensidad,
          duracion: registro.duracion,
          cantidad,
          etiqueta: etiquetaDuracion(registro),
          nota: registro.nota,
        })
      }
    }
  }

  return { columnas, filas, celdas }
}

export function etiquetaFila(fila: FilaMatriz): string {
  const accionista = ACCIONISTA_META[fila.accionista].label
  return `${fila.equipo} · ${accionista}`
}

export function tituloColumna(columna: ColumnaMatriz): string {
  const fecha = new Date(`${columna.fecha}T12:00:00`)
  const dia = fecha.getDate()
  return String(dia)
}

export function tooltipColumna(columna: ColumnaMatriz): string {
  const partes = [formatearFechaCorta(columna.fecha)]
  if (columna.sinRegistro) partes.push("Sin registro")
  else if (columna.trabajado === false) partes.push("Sin actividad")
  if (columna.eventos.length > 0) partes.push(...columna.eventos)
  return partes.join(" · ")
}

export function intensidadVisual(celda: CeldaMatriz): number {
  if (celda.duracion === "viajes" || celda.duracion === "actividad") {
    return celda.intensidad > 0 ? 1 : 0
  }
  return Math.min(celda.intensidad, 1)
}

export type SemanaMatriz = {
  indice: number
  etiqueta: string
  columnas: ColumnaMatriz[]
}

export function agruparSemanas(
  columnas: ColumnaMatriz[],
  tamano = 7
): SemanaMatriz[] {
  const semanas: SemanaMatriz[] = []

  for (let i = 0; i < columnas.length; i += tamano) {
    const bloque = columnas.slice(i, i + tamano)
    semanas.push({
      indice: semanas.length,
      etiqueta: `${formatearFechaCorta(bloque[0].fecha)} – ${formatearFechaCorta(bloque[bloque.length - 1].fecha)}`,
      columnas: bloque,
    })
  }

  return semanas
}

export function textoDetalleCelda(
  fila: FilaMatriz,
  columna: ColumnaMatriz,
  celda: CeldaMatriz | undefined
): string {
  if (columna.trabajado === false) {
    return `${etiquetaFila(fila)} · ${tooltipColumna(columna)} · Sin actividad en obra`
  }

  if (!celda || celda.intensidad <= 0) {
    return `${etiquetaFila(fila)} · ${tooltipColumna(columna)} · Sin uso`
  }

  return [etiquetaFila(fila), tooltipColumna(columna), celda.etiqueta, celda.nota]
    .filter(Boolean)
    .join(" · ")
}

export const EQUIPO_ETIQUETA_CORTA: Record<string, string> = {
  "Excavadora brazo largo": "Exc. brazo largo",
  "Excavadora brazo corto": "Exc. brazo corto",
  "Descarga de tubos de hormigón": "Descarga tubos",
  "Descarga de segundo lote de tubos de hormigón": "2.º lote tubos",
  "Instalación de tubos": "Inst. tubos",
  Payloader: "Payloader",
  "Viajes de arena": "Viajes arena",
}
