import {
  ACCIONISTA_META,
  FRENTE_META,
  type Accionista,
  type DuracionEquipo,
  type FrenteObra,
  type RegistroDia,
  PERIODO_MAQUINARIA,
  REGISTRO_MAQUINARIA,
} from "@/src/data/registro-maquinaria"
import { etiquetaDuracion, formatearFechaCorta, normalizarDuracion } from "@/src/lib/maquinaria-resumen"

export type FilaMatriz = {
  id: string
  equipo: string
  accionista: Accionista
  frente?: FrenteObra
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
  "Viajes de material para vía",
  "Descarga de tubos de hormigón",
  "Descarga de segundo lote de tubos de hormigón",
  "Instalación de tubos",
] as const

const ORDEN_FRENTE: Record<string, number> = {
  "": 0,
  cienega: 1,
  poza_honda: 2,
  pechiche: 3,
  las_penas: 4,
}

function claveCelda(filaId: string, fecha: string): string {
  return `${filaId}::${fecha}`
}

export function claveFila(
  equipo: string,
  accionista: Accionista,
  frente?: FrenteObra
): string {
  return frente ? `${equipo}::${accionista}::${frente}` : `${equipo}::${accionista}`
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

function ordenFrente(frente?: FrenteObra): number {
  return ORDEN_FRENTE[frente ?? ""] ?? 99
}

function construirFilas(dias: RegistroDia[]): FilaMatriz[] {
  const vistos = new Set<string>()
  const filas: FilaMatriz[] = []

  for (const dia of dias) {
    for (const registro of dia.registros) {
      const id = claveFila(registro.equipo, registro.accionista, registro.frente)
      if (vistos.has(id)) continue
      vistos.add(id)
      filas.push({
        id,
        equipo: registro.equipo,
        accionista: registro.accionista,
        frente: registro.frente,
        esViajes: registro.duracion === "viajes",
        esActividad: registro.duracion === "actividad",
      })
    }
  }

  return filas.sort((a, b) => {
    if (a.accionista !== b.accionista) {
      return a.accionista === "consorcio" ? -1 : 1
    }
    const frenteCmp = ordenFrente(a.frente) - ordenFrente(b.frente)
    if (frenteCmp !== 0) return frenteCmp
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
      const filaId = claveFila(registro.equipo, registro.accionista, registro.frente)
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

export function etiquetaFrente(fila: FilaMatriz, compacta = false): string | null {
  if (!fila.frente) return null
  const meta = FRENTE_META[fila.frente]
  return compacta ? meta.abrev : meta.label
}

export function etiquetaFilaConFrente(fila: FilaMatriz, compacta = false): string {
  const accionista = ACCIONISTA_META[fila.accionista].label
  const equipo = compacta ? (EQUIPO_ETIQUETA_CORTA[fila.equipo] ?? fila.equipo) : fila.equipo
  const frente = etiquetaFrente(fila, compacta)
  return frente ? `${equipo} · ${frente} · ${accionista}` : `${equipo} · ${accionista}`
}

export function etiquetaFila(fila: FilaMatriz): string {
  return etiquetaFilaConFrente(fila, false)
}

export function tituloColumna(columna: ColumnaMatriz): string {
  const fecha = new Date(`${columna.fecha}T12:00:00`)
  const dia = fecha.getDate()
  return String(dia)
}

function diaSemanaNumero(fechaIso: string): number {
  const dia = new Date(`${fechaIso}T12:00:00`).getDay()
  return dia === 0 ? 7 : dia
}

function diaSemanaCortoPdf(fechaIso: string): string {
  return new Intl.DateTimeFormat("es-EC", { weekday: "short" }).format(
    new Date(`${fechaIso}T12:00:00`)
  )
}

function mesCortoPdf(fechaIso: string): string {
  return new Intl.DateTimeFormat("es-EC", { month: "short" })
    .format(new Date(`${fechaIso}T12:00:00`))
    .replace(/\.$/, "")
}

export function tituloColumnaPdf(
  columna: ColumnaMatriz,
  columnaAnterior?: ColumnaMatriz
): { dia: string; diaSemana: string; mes?: string } {
  const fecha = new Date(`${columna.fecha}T12:00:00`)
  const mesActual = mesCortoPdf(columna.fecha)
  const mesAnterior = columnaAnterior ? mesCortoPdf(columnaAnterior.fecha) : null
  const mostrarMes =
    !columnaAnterior ||
    mesActual !== mesAnterior ||
    fecha.getDate() === 1

  return {
    dia: String(fecha.getDate()),
    diaSemana: diaSemanaCortoPdf(columna.fecha),
    mes: mostrarMes ? mesActual : undefined,
  }
}

export function partesEtiquetaFilaPdf(fila: FilaMatriz): {
  equipo: string
  frente: string | null
  accionista: string
} {
  return {
    equipo: EQUIPO_ETIQUETA_CORTA[fila.equipo] ?? fila.equipo,
    frente: fila.frente ? FRENTE_META[fila.frente].label : null,
    accionista: ACCIONISTA_META[fila.accionista].label,
  }
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

export function agruparSemanasCalendario(columnas: ColumnaMatriz[]): SemanaMatriz[] {
  if (columnas.length === 0) return []

  const semanas: SemanaMatriz[] = []
  let inicio = 0

  for (let i = 1; i <= columnas.length; i++) {
    const esFin = i === columnas.length
    const esLunes = !esFin && diaSemanaNumero(columnas[i].fecha) === 1

    if (esFin || esLunes) {
      const bloque = columnas.slice(inicio, i)
      semanas.push({
        indice: semanas.length,
        etiqueta: `${formatearFechaCorta(bloque[0].fecha)} – ${formatearFechaCorta(bloque[bloque.length - 1].fecha)}`,
        columnas: bloque,
      })
      inicio = i
    }
  }

  return semanas
}

export type PaginaMatrizImpresa = {
  indice: number
  semanas: SemanaMatriz[]
}

export function agruparSemanasEnPaginasImpresion(semanas: SemanaMatriz[]): PaginaMatrizImpresa[] {
  const paginas: PaginaMatrizImpresa[] = []
  let cursor = 0

  while (cursor < semanas.length) {
    const restantes = semanas.length - cursor
    const tamano = restantes === 3 ? 3 : Math.min(2, restantes)

    paginas.push({
      indice: paginas.length,
      semanas: semanas.slice(cursor, cursor + tamano),
    })
    cursor += tamano
  }

  return paginas
}

export function filtrarFilasActivasEnBloque(
  filas: FilaMatriz[],
  columnas: ColumnaMatriz[],
  celdas: Map<string, CeldaMatriz>
): FilaMatriz[] {
  const fechas = new Set(columnas.map((columna) => columna.fecha))

  return filas.filter((fila) =>
    [...fechas].some((fecha) => {
      const celda = celdas.get(claveCelda(fila.id, fecha))
      return celda !== undefined && celda.intensidad > 0
    })
  )
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
  "Viajes de material para vía": "Viajes material vía",
}
