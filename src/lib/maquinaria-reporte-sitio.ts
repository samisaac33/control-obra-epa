import {
  ACCIONISTA_META,
  FRENTE_META,
  type FrenteObra,
  type RegistroDia,
  type RegistroEquipo,
} from "@/src/data/registro-maquinaria"
import { etiquetaDuracion, formatearFechaCorta } from "@/src/lib/maquinaria-resumen"

const EQUIPOS_VIAJES = new Set(["Viajes de material para vía", "Viajes de arena"])

const ORDEN_FRENTE: FrenteObra[] = ["poza_honda", "pechiche", "las_penas"]

export type FilaReporteSitio = {
  fecha: string
  diaSemana: string
  maquinaria: string[]
  viajesJimmy: number | null
  viajesMauricio: number | null
  sinActividad: boolean
}

export type TotalesReporteSitio = {
  diasConMaquinaria: number
  viajesJimmy: number
  viajesMauricio: number
}

export type SeccionReporteSitio = {
  frente: FrenteObra
  label: string
  filas: FilaReporteSitio[]
  totales: TotalesReporteSitio
}

export type ReportePorSitio = {
  secciones: SeccionReporteSitio[]
  totalesGlobales: {
    diasConActividad: number
    viajesJimmy: number
    viajesMauricio: number
  }
}

function esRegistroViajes(registro: RegistroEquipo): boolean {
  return registro.duracion === "viajes" && EQUIPOS_VIAJES.has(registro.equipo)
}

function textoMaquinaria(registro: RegistroEquipo): string {
  return `${registro.equipo} — ${etiquetaDuracion(registro)}`
}

function registrosDelFrente(dia: RegistroDia, frente: FrenteObra): RegistroEquipo[] {
  return dia.registros.filter((registro) => registro.frente === frente)
}

function filaDesdeDia(dia: RegistroDia, frente: FrenteObra, sinActividad = false): FilaReporteSitio | null {
  const delFrente = registrosDelFrente(dia, frente)
  const maquinaria = delFrente.filter((r) => !esRegistroViajes(r)).map(textoMaquinaria)
  const viajes = delFrente.filter(esRegistroViajes)

  let viajesJimmy: number | null = null
  let viajesMauricio: number | null = null

  for (const registro of viajes) {
    const cantidad = registro.cantidad ?? 0
    if (registro.accionista === "consorcio") {
      viajesJimmy = (viajesJimmy ?? 0) + cantidad
    } else {
      viajesMauricio = (viajesMauricio ?? 0) + cantidad
    }
  }

  const tieneContenido =
    sinActividad || maquinaria.length > 0 || viajesJimmy !== null || viajesMauricio !== null

  if (!tieneContenido) return null

  return {
    fecha: dia.fecha,
    diaSemana: dia.diaSemana,
    maquinaria,
    viajesJimmy,
    viajesMauricio,
    sinActividad,
  }
}

function calcularTotales(filas: FilaReporteSitio[]): TotalesReporteSitio {
  return filas.reduce(
    (acc, fila) => {
      if (!fila.sinActividad && fila.maquinaria.length > 0) {
        acc.diasConMaquinaria += 1
      }
      if (fila.viajesJimmy !== null) acc.viajesJimmy += fila.viajesJimmy
      if (fila.viajesMauricio !== null) acc.viajesMauricio += fila.viajesMauricio
      return acc
    },
    { diasConMaquinaria: 0, viajesJimmy: 0, viajesMauricio: 0 }
  )
}

function construirSeccion(
  dias: RegistroDia[],
  frente: FrenteObra,
  incluirDiasSinObra: boolean
): SeccionReporteSitio {
  const filas: FilaReporteSitio[] = []

  for (const dia of dias) {
    if (incluirDiasSinObra && !dia.trabajado) {
      const fila = filaDesdeDia(dia, frente, true)
      if (fila) filas.push(fila)
      continue
    }

    if (!dia.trabajado) continue

    const fila = filaDesdeDia(dia, frente)
    if (fila) filas.push(fila)
  }

  return {
    frente,
    label: FRENTE_META[frente].label,
    filas,
    totales: calcularTotales(filas),
  }
}

export function construirReportePorSitio(
  dias: RegistroDia[],
  frentes: readonly FrenteObra[] = ORDEN_FRENTE
): ReportePorSitio {
  const secciones = frentes.map((frente) =>
    construirSeccion(dias, frente, frente === "poza_honda")
  )

  const totalesGlobales = secciones.reduce(
    (acc, seccion) => {
      acc.viajesJimmy += seccion.totales.viajesJimmy
      acc.viajesMauricio += seccion.totales.viajesMauricio
      return acc
    },
    {
      diasConActividad: dias.filter((dia) => dia.trabajado).length,
      viajesJimmy: 0,
      viajesMauricio: 0,
    }
  )

  return { secciones, totalesGlobales }
}

export function etiquetaViajesReporte(valor: number | null): string {
  if (valor === null || valor === 0) return "—"
  return String(valor)
}

export function etiquetaMaquinariaReporte(fila: FilaReporteSitio): string {
  if (fila.sinActividad) return "Sin actividad"
  if (fila.maquinaria.length === 0) return "—"
  return fila.maquinaria.join(" · ")
}

export function formatearFechaReporteSitio(fechaIso: string): string {
  return formatearFechaCorta(fechaIso)
}

export function etiquetaAccionistaJimmy(): string {
  return ACCIONISTA_META.consorcio.label
}

export function etiquetaAccionistaMauricio(): string {
  return ACCIONISTA_META.mauricio.label
}
