import type { MovimientoCamaBaja } from "@/src/lib/maquinaria-cama-baja-movimientos"
import { totalHorasMovimientosCamaBaja } from "@/src/lib/maquinaria-cama-baja-movimientos"
import type {
  KpisMaquinariaDesasolve,
  ResumenEquipoDesasolve,
} from "@/src/lib/maquinaria-desasolve-resumen"

const PREFIJO_CLAVE_CAMA_BAJA = "cama-baja:"

function claveCamaBaja(nombre: string): string {
  return `${PREFIJO_CLAVE_CAMA_BAJA}${nombre.trim().toLowerCase()}`
}

export function esClaveResumenCamaBaja(clave: string): boolean {
  return clave.startsWith(PREFIJO_CLAVE_CAMA_BAJA)
}

export function resumenCamaBajaPorUnidad(
  movimientos: readonly MovimientoCamaBaja[]
): ResumenEquipoDesasolve[] {
  const map = new Map<string, ResumenEquipoDesasolve>()

  for (const m of movimientos) {
    const nombre = m.cama_baja.trim()
    const clave = claveCamaBaja(nombre)
    const prev = map.get(clave) ?? {
      clave,
      nombreEquipo: `Cama baja — ${nombre}`,
      jornadas: 0,
      metros: 0,
      horas: 0,
    }
    prev.jornadas += 1
    if (m.duracion_horas != null) prev.horas += m.duracion_horas
    map.set(clave, prev)
  }

  return [...map.values()].sort((a, b) => a.nombreEquipo.localeCompare(b.nombreEquipo, "es"))
}

export function combinarResumenPorEquipoDesasolve(
  jornadas: ResumenEquipoDesasolve[],
  movimientos: readonly MovimientoCamaBaja[]
): ResumenEquipoDesasolve[] {
  const camaBaja = resumenCamaBajaPorUnidad(movimientos)
  if (camaBaja.length === 0) return jornadas
  return [...jornadas, ...camaBaja].sort(
    (a, b) => b.metros - a.metros || b.horas - a.horas || a.nombreEquipo.localeCompare(b.nombreEquipo, "es")
  )
}

export function kpisMaquinariaDesasolveConCamaBaja(
  base: KpisMaquinariaDesasolve,
  movimientos: readonly MovimientoCamaBaja[],
  fechasJornadas: Iterable<string>
): KpisMaquinariaDesasolve {
  if (movimientos.length === 0) return base

  const fechas = new Set(fechasJornadas)
  for (const m of movimientos) fechas.add(m.fecha)

  return {
    ...base,
    diasConActividad: fechas.size,
    totalHoras: base.totalHoras + totalHorasMovimientosCamaBaja(movimientos),
  }
}

export function movimientosCamaBajaEnFecha(
  movimientos: readonly MovimientoCamaBaja[],
  fecha: string
): MovimientoCamaBaja[] {
  return movimientos.filter((m) => m.fecha === fecha)
}
