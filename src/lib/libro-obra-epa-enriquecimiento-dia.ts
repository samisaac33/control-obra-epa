import type {
  DatosHojaLibroObraEpa,
  FilaHorasEquipoEpa,
} from "@/src/data/libro-obra-formato-epa"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"

export type ContextoEnriquecimientoEpa = {
  fecha: string
  excavadoras: number
  volquetas: number
  tieneSeverino: boolean
  tramosActivos: number
}

function hashCadena(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pick<T>(lista: T[], seed: number): T {
  return lista[seed % lista.length]!
}

const CLIMA_MANANA = [
  "Parcialmente nublado, 24 °C",
  "Soleado, 26 °C",
  "Nublado, 23 °C",
  "Bruma ligera, 22 °C",
  "Despejado, 27 °C",
] as const

const CLIMA_TARDE = [
  "Caluroso, 29 °C",
  "Parcial nublado, 28 °C",
  "Lluvia ligera, 25 °C",
  "Chubasco breve, 24 °C",
  "Soleado, 30 °C",
] as const

const CLIMA_NOCHE = [
  "Despejado, 22 °C",
  "Nublado, 21 °C",
  "Llovizna, 20 °C",
  "Parcial nublado, 23 °C",
  "Sin precipitación, 22 °C",
] as const

export function climaProgramaticoDia(fecha: string): DatosHojaLibroObraEpa["clima"] {
  const h = hashCadena(`clima-${fecha}`)
  return {
    manana: pick([...CLIMA_MANANA], h),
    tarde: pick([...CLIMA_TARDE], h >>> 8),
    noche: pick([...CLIMA_NOCHE], h >>> 16),
  }
}

function formatearHora(minutos: number): string {
  const h = Math.floor(minutos / 60) % 24
  const m = minutos % 60
  return `${h}:${m.toString().padStart(2, "0")}`
}

function formatearRango(inicio: number, fin: number): string {
  return `${formatearHora(inicio)} - ${formatearHora(fin)}`
}

/** Jornada variable por equipo (7,5–10 h), determinística por fecha + nombre. */
export function horasEquipoProgramaticas(
  fecha: string,
  nombreEquipo: string,
  indice: number
): FilaHorasEquipoEpa {
  const h = hashCadena(`horas-${fecha}-${nombreEquipo}-${indice}`)
  const esVolqueta = nombreEquipo.toLowerCase().includes("volqueta")
  const esGps = nombreEquipo.toLowerCase().includes("gps")

  const inicioBase = esVolqueta ? 420 : esGps ? 450 : 405
  const inicioJitter = h % 46
  const inicio = inicioBase + inicioJitter

  const finManana = 720 + (h % 31) - 15
  const inicioTarde = 780 + ((h >>> 4) % 31) - 10
  const finTarde = esVolqueta
    ? 1050 + ((h >>> 8) % 91)
    : 1020 + ((h >>> 8) % 121)

  const mananaMin = Math.max(inicio, finManana - 240)
  const horasManana = (finManana - mananaMin) / 60
  const horasTarde = (finTarde - inicioTarde) / 60
  const total = Math.round((horasManana + horasTarde) * 10) / 10

  return {
    equipo: nombreEquipo,
    manana: formatearRango(mananaMin, finManana),
    tarde: formatearRango(inicioTarde, finTarde),
    total: `${formatearNumero(total, 1)} h`,
  }
}

const NOVEDADES_POOL: Array<(ctx: ContextoEnriquecimientoEpa) => string> = [
  (c) =>
    `Control topográfico de PK en ${c.tramosActivos} frente(s); cubicación VAE coherente con avance del día.`,
  (c) =>
    `Coordinación desalojo–botadero (≤ 5 km); flota de ${c.volquetas} volqueta(s) sin congestión en accesos.`,
  (c) =>
    `Reconformación de taludes verificada antes de registrar excedente; humedad de material dentro de rango operativo.`,
  (c) =>
    `Replanteo y señalización de frentes activos; sin interferencia con faenas de terceros en canal.`,
  (c) =>
    `Jornada continua en excavación; horómetros al cierre pendientes de consolidado de planilla.`,
  (c) =>
    `Se mantuvo criterio VAE 1:1 desazolve–desalojo–tendido en tramos programados del periodo.`,
  (c) => `Charla de 5 minutos SST: tránsito de volquetas y zonas de giro en bermas.`,
  (c) =>
    c.tieneSeverino
      ? "Coordinación civil–eléctrico: frentes canal y hito Severino sin cruce de energía."
      : "Sin novedades eléctricas; producción civil según cronograma.",
]

export function novedadesProgramaticasDia(ctx: ContextoEnriquecimientoEpa): string {
  const h = hashCadena(`novedad-${ctx.fecha}`)
  const probabilidad = (h % 100) / 100
  if (probabilidad > 0.55) {
    return pick(NOVEDADES_POOL, h >>> 2)(ctx)
  }
  if (probabilidad > 0.25) {
    const a = pick(NOVEDADES_POOL, h >>> 2)(ctx)
    const b = pick(NOVEDADES_POOL, h >>> 5)(ctx)
    return a === b ? a : `${a} ${b}`
  }
  return "Sin novedades que afecten plazo o calidad; jornada conforme a programación VAE."
}

export function enriquecerFormatoEpaProgramatico(
  formato: DatosHojaLibroObraEpa,
  ctx: ContextoEnriquecimientoEpa
): DatosHojaLibroObraEpa {
  const clima = climaProgramaticoDia(ctx.fecha)
  const horasEquipos = formato.horasEquipos.map((f, i) =>
    horasEquipoProgramaticas(ctx.fecha, f.equipo, i)
  )
  const novedadesObservaciones = novedadesProgramaticasDia(ctx)

  return {
    ...formato,
    clima,
    horasEquipos,
    novedadesObservaciones,
  }
}
