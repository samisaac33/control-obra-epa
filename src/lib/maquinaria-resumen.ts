import {
  ACCIONISTA_META,
  type Accionista,
  type DuracionEquipo,
  type RegistroDia,
  type RegistroEquipo,
  REGISTRO_MAQUINARIA,
} from "@/src/data/registro-maquinaria"

export type ResumenEquipoFila = {
  equipo: string
  accionista: Accionista
  diasCompletos: number
  mediosDias: number
  horas: number
  viajes: number
  actividades: number
  totalDiaEquipo: number
}

export type KpisMaquinaria = {
  diasConActividad: number
  diasSinTrabajo: number
  diasEquipoMauricio: number
  diasEquipoConsorcio: number
  totalViajesArena: number
  eventosDestacados: string[]
}

const HORAS_POR_DIA = 8

export function normalizarDuracion(registro: RegistroEquipo): number {
  const cantidad = registro.cantidad ?? 1

  switch (registro.duracion) {
    case "dia_completo":
      return cantidad
    case "medio_dia":
      return cantidad * 0.5
    case "hora":
      return cantidad / HORAS_POR_DIA
    case "viajes":
    case "actividad":
      return 0
  }
}

export function etiquetaDuracion(registro: RegistroEquipo): string {
  const cantidad = registro.cantidad ?? 1

  switch (registro.duracion) {
    case "dia_completo":
      return cantidad > 1 ? `${cantidad} × día completo` : "Todo el día"
    case "medio_dia":
      return cantidad > 1 ? `${cantidad} × medio día` : "Medio día"
    case "hora":
      return cantidad === 1 ? "1 hora" : `${cantidad} horas`
    case "viajes":
      return cantidad === 1 ? "1 viaje" : `${cantidad} viajes`
    case "actividad":
      return "Actividad"
  }
}

function claveEquipo(registro: RegistroEquipo): string {
  return `${registro.equipo}::${registro.accionista}`
}

export function resumenPorEquipo(dias: RegistroDia[] = REGISTRO_MAQUINARIA): ResumenEquipoFila[] {
  const mapa = new Map<string, ResumenEquipoFila>()

  for (const dia of dias) {
    if (!dia.trabajado) continue

    for (const registro of dia.registros) {
      const clave = claveEquipo(registro)
      const fila =
        mapa.get(clave) ??
        ({
          equipo: registro.equipo,
          accionista: registro.accionista,
          diasCompletos: 0,
          mediosDias: 0,
          horas: 0,
          viajes: 0,
          actividades: 0,
          totalDiaEquipo: 0,
        } satisfies ResumenEquipoFila)

      const cantidad = registro.cantidad ?? 1

      switch (registro.duracion) {
        case "dia_completo":
          fila.diasCompletos += cantidad
          break
        case "medio_dia":
          fila.mediosDias += cantidad
          break
        case "hora":
          fila.horas += cantidad
          break
        case "viajes":
          fila.viajes += cantidad
          break
        case "actividad":
          fila.actividades += cantidad
          break
      }

      fila.totalDiaEquipo += normalizarDuracion(registro)
      mapa.set(clave, fila)
    }
  }

  return [...mapa.values()].sort((a, b) => {
    if (a.accionista !== b.accionista) {
      return a.accionista === "consorcio" ? -1 : 1
    }
    return a.equipo.localeCompare(b.equipo, "es")
  })
}

export function resumenPorAccionista(dias: RegistroDia[] = REGISTRO_MAQUINARIA): Record<Accionista, number> {
  const totales: Record<Accionista, number> = { mauricio: 0, consorcio: 0 }

  for (const dia of dias) {
    if (!dia.trabajado) continue
    for (const registro of dia.registros) {
      if (registro.duracion === "viajes" || registro.duracion === "actividad") continue
      totales[registro.accionista] += normalizarDuracion(registro)
    }
  }

  return totales
}

export function conteoRegistrosPorAccionista(dia: RegistroDia): Record<Accionista, number> {
  const conteo: Record<Accionista, number> = { mauricio: 0, consorcio: 0 }
  for (const registro of dia.registros) {
    conteo[registro.accionista] += 1
  }
  return conteo
}

export function formatearFechaCorta(fechaIso: string): string {
  const fecha = new Date(`${fechaIso}T12:00:00`)
  return new Intl.DateTimeFormat("es-EC", {
    day: "numeric",
    month: "short",
  }).format(fecha)
}

export function formatearNumero(valor: number, decimales = 1): string {
  return new Intl.NumberFormat("es-EC", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  }).format(valor)
}

export function kpisMaquinaria(dias: RegistroDia[] = REGISTRO_MAQUINARIA): KpisMaquinaria {
  const porAccionista = resumenPorAccionista(dias)
  const eventosDestacados: string[] = []

  let totalViajesArena = 0

  for (const dia of dias) {
    for (const registro of dia.registros) {
      if (registro.equipo === "Viajes de arena" && registro.duracion === "viajes") {
        totalViajesArena += registro.cantidad ?? 0
      }
      if (registro.nota) {
        eventosDestacados.push(
          `${formatearFechaCorta(dia.fecha)}: ${registro.equipo} (${registro.nota})`
        )
      }
      if (registro.duracion === "actividad") {
        eventosDestacados.push(`${formatearFechaCorta(dia.fecha)}: ${registro.equipo}`)
      }
    }
  }

  return {
    diasConActividad: dias.filter((dia) => dia.trabajado).length,
    diasSinTrabajo: dias.filter((dia) => !dia.trabajado).length,
    diasEquipoMauricio: porAccionista.mauricio,
    diasEquipoConsorcio: porAccionista.consorcio,
    totalViajesArena,
    eventosDestacados,
  }
}

export function resumenAccionistaEtiqueta(accionista: Accionista): string {
  return ACCIONISTA_META[accionista].label
}
