import type { RegistroMaquinariaComplementaria } from "@/src/lib/maquinaria-complementaria"
import { kpisMaquinariaComplementaria } from "@/src/lib/maquinaria-complementaria"
import type {
  KpisMaquinariaDesasolve,
  ResumenEquipoDesasolve,
} from "@/src/lib/maquinaria-desasolve-resumen"

const PREFIJO_CLAVE_COMPLEMENTARIA = "complementaria:"

function claveComplementaria(equipo: string): string {
  return `${PREFIJO_CLAVE_COMPLEMENTARIA}${equipo.trim().toLowerCase()}`
}

export function esClaveResumenComplementaria(clave: string): boolean {
  return clave.startsWith(PREFIJO_CLAVE_COMPLEMENTARIA)
}

export function resumenComplementariaPorEquipo(
  registros: readonly RegistroMaquinariaComplementaria[]
): ResumenEquipoDesasolve[] {
  const map = new Map<string, ResumenEquipoDesasolve>()

  for (const r of registros) {
    const nombre = r.equipo.trim()
    const clave = claveComplementaria(nombre)
    const prev = map.get(clave) ?? {
      clave,
      nombreEquipo: `Complementario — ${nombre}`,
      jornadas: 0,
      metros: 0,
      horas: 0,
    }
    prev.jornadas += 1
    if (r.duracion_horas != null) prev.horas += r.duracion_horas
    map.set(clave, prev)
  }

  return [...map.values()].sort((a, b) => a.nombreEquipo.localeCompare(b.nombreEquipo, "es"))
}

export function combinarResumenPorEquipoConComplementaria(
  jornadas: ResumenEquipoDesasolve[],
  registros: readonly RegistroMaquinariaComplementaria[]
): ResumenEquipoDesasolve[] {
  const complementaria = resumenComplementariaPorEquipo(registros)
  if (complementaria.length === 0) return jornadas
  return [...jornadas, ...complementaria].sort(
    (a, b) => b.metros - a.metros || b.horas - a.horas || a.nombreEquipo.localeCompare(b.nombreEquipo, "es")
  )
}

export function kpisMaquinariaDesasolveConComplementaria(
  base: KpisMaquinariaDesasolve,
  registros: readonly RegistroMaquinariaComplementaria[],
  fechasExistentes: Iterable<string>
): KpisMaquinariaDesasolve {
  if (registros.length === 0) return base

  const fechas = new Set(fechasExistentes)
  for (const r of registros) fechas.add(r.fecha)

  const { totalHoras: horasComplementarias } = kpisMaquinariaComplementaria([...registros])

  return {
    ...base,
    diasConActividad: fechas.size,
    totalHoras: base.totalHoras + horasComplementarias,
  }
}

export function registrosComplementariosEnFecha(
  registros: readonly RegistroMaquinariaComplementaria[],
  fecha: string
): RegistroMaquinariaComplementaria[] {
  return registros.filter((r) => r.fecha === fecha)
}
