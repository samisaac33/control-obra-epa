import type { SupabaseClient } from "@supabase/supabase-js"

import { getProyecto, PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"
import { cargarTramosMapaProyecto } from "@/src/lib/cargar-tramos-mapa-proyecto"
import { listarMovimientosCamaBaja } from "@/src/lib/maquinaria-cama-baja-movimientos"
import { listarRegistrosMaquinariaComplementaria } from "@/src/lib/maquinaria-complementaria"
import {
  cargarJornadasMaquinariaProyecto,
  periodoDesdeJornadas,
} from "@/src/lib/maquinaria-desasolve-proyecto"
import {
  combinarResumenPorEquipoConComplementaria,
  kpisMaquinariaDesasolveConComplementaria,
} from "@/src/lib/maquinaria-desasolve-complementaria-reporte"
import {
  combinarResumenPorEquipoDesasolve,
  kpisMaquinariaDesasolveConCamaBaja,
} from "@/src/lib/maquinaria-desasolve-cama-baja-reporte"
import {
  formatearMetrosDesasolveResumen,
  kpisMaquinariaDesasolve,
  resumenPorEquipoDesasolve,
  resumenPorTramoDesasolveAlineadoMapa,
  type KpisMaquinariaDesasolve,
  type ResumenEquipoDesasolve,
} from "@/src/lib/maquinaria-desasolve-resumen"
import { formatearFechaRegistro } from "@/src/lib/tramo-maquinaria-historial"
import { cargarEquiposMaquinariaProyecto } from "@/src/lib/proyecto-equipos-maquinaria"

export type InformeDesasolveConsolidadoPayload = {
  proyecto: ReturnType<typeof getProyecto>
  periodoEtiqueta: string
  generadoEnIso: string
  kpis: KpisMaquinariaDesasolve
  porEquipo: ResumenEquipoDesasolve[]
  formatearMetros: typeof formatearMetrosDesasolveResumen
}

export async function cargarInformeDesasolveConsolidado(
  supabase: SupabaseClient,
  proyectoId: string
): Promise<InformeDesasolveConsolidadoPayload> {
  if (proyectoId !== PROYECTO_DESASOLVE_CANALES) {
    throw new Error("Proyecto no soportado para este informe.")
  }

  const proyecto = getProyecto(proyectoId)
  const tramosMapa = await cargarTramosMapaProyecto(supabase, proyectoId)
  const [jornadas, equipos, movimientosCamaBaja, registrosComplementaria] = await Promise.all([
    cargarJornadasMaquinariaProyecto(supabase, proyectoId, tramosMapa),
    cargarEquiposMaquinariaProyecto(supabase, proyectoId),
    listarMovimientosCamaBaja(supabase, proyectoId),
    listarRegistrosMaquinariaComplementaria(supabase, proyectoId),
  ])

  if (jornadas.length === 0 && movimientosCamaBaja.length === 0 && registrosComplementaria.length === 0) {
    throw new Error("No hay registros de maquinaria para generar el informe.")
  }

  const fechasTodas = new Set<string>()
  for (const j of jornadas) fechasTodas.add(j.fecha)
  for (const m of movimientosCamaBaja) fechasTodas.add(m.fecha)
  for (const r of registrosComplementaria) fechasTodas.add(r.fecha)
  const fechasOrdenadas = [...fechasTodas].sort()
  const periodoEtiqueta =
    fechasOrdenadas.length === 0
      ? periodoDesdeJornadas(jornadas).etiqueta
      : fechasOrdenadas.length === 1
        ? formatearFechaRegistro(fechasOrdenadas[0]!)
        : `${formatearFechaRegistro(fechasOrdenadas[0]!)} — ${formatearFechaRegistro(fechasOrdenadas[fechasOrdenadas.length - 1]!)}`
  const fechasJornadas = jornadas.map((j) => j.fecha)
  let kpis = kpisMaquinariaDesasolve(jornadas)
  kpis = kpisMaquinariaDesasolveConCamaBaja(kpis, movimientosCamaBaja, fechasJornadas)
  const fechasActividad = [...fechasJornadas, ...movimientosCamaBaja.map((m) => m.fecha)]
  kpis = kpisMaquinariaDesasolveConComplementaria(
    kpis,
    registrosComplementaria,
    fechasActividad
  )

  const porTramoTotales = resumenPorTramoDesasolveAlineadoMapa(
    jornadas,
    tramosMapa.tramos,
    tramosMapa.puntosAvance
  )
  const totalMetros = porTramoTotales.reduce((sum, fila) => sum + fila.metros, 0)
  kpis = { ...kpis, totalMetros }

  const porEquipo = combinarResumenPorEquipoConComplementaria(
    combinarResumenPorEquipoDesasolve(resumenPorEquipoDesasolve(jornadas, equipos), movimientosCamaBaja),
    registrosComplementaria
  )

  return {
    proyecto,
    periodoEtiqueta,
    generadoEnIso: new Date().toISOString(),
    kpis,
    porEquipo,
    formatearMetros: formatearMetrosDesasolveResumen,
  }
}