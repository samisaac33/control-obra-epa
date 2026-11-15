import type { SupabaseClient } from "@supabase/supabase-js"

import { getProyecto, PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"
import { cargarTramosMapaProyecto } from "@/src/lib/cargar-tramos-mapa-proyecto"
import type { MovimientoCamaBaja } from "@/src/lib/maquinaria-cama-baja-movimientos"
import { listarMovimientosCamaBaja } from "@/src/lib/maquinaria-cama-baja-movimientos"
import type { RegistroMaquinariaComplementaria } from "@/src/lib/maquinaria-complementaria"
import { listarRegistrosMaquinariaComplementaria } from "@/src/lib/maquinaria-complementaria"
import {
  cargarJornadasMaquinariaProyecto,
  type JornadaMaquinariaProyecto,
} from "@/src/lib/maquinaria-desasolve-proyecto"
import { formatearMetrosDesasolveResumen } from "@/src/lib/maquinaria-desasolve-resumen"
import {
  etiquetaSemanaCalendario,
  lunesSemanaCalendario,
} from "@/src/lib/maquinaria/semana-calendario-informe"
import { cargarEquiposMaquinariaProyecto } from "@/src/lib/proyecto-equipos-maquinaria"
import {
  formatearFechaRegistro,
  mapaEquiposPorId,
  nombreEquipoParaMostrar,
} from "@/src/lib/tramo-maquinaria-historial"

export type FilaInformeDesasolveContrato = {
  fecha: string
  tramoReferencia: string
  tipo: "Desasolve" | "Incidencia"
  canalUbicacion: string
  equipo: string
  metros: number | null
  horas: number | null
  textoDetalle: string | null
}

export type FilaInformeComplementario = {
  fecha: string
  tramoReferencia: string
  tipo: "Complementario"
  canalUbicacion: string
  equipo: string
  horas: number | null
  textoDetalle: string | null
}

export type FilaInformeCamaBaja = {
  fecha: string
  camaBaja: string
  maquinaTransportada: string
  ruta: string
  horas: number | null
  observaciones: string | null
}

export type SemanaInformeDesasolveCompleto = {
  lunes: string
  etiqueta: string
  desasolve: FilaInformeDesasolveContrato[]
  complementarios: FilaInformeComplementario[]
}

export type SemanaInformeCamaBaja = {
  lunes: string
  etiqueta: string
  filas: FilaInformeCamaBaja[]
}

export type InformeDesasolveCompletoPayload = {
  proyecto: ReturnType<typeof getProyecto>
  periodoEtiqueta: string
  generadoEnIso: string
  semanas: SemanaInformeDesasolveCompleto[]
  camaBajaPorSemana: SemanaInformeCamaBaja[]
  formatearMetros: typeof formatearMetrosDesasolveResumen
}

function textoObservacionesJornada(j: JornadaMaquinariaProyecto): string | null {
  const obs = j.observaciones?.trim()
  return obs ? obs : null
}

function textoDetalleComplementario(r: RegistroMaquinariaComplementaria): string | null {
  const partes: string[] = []
  const desc = r.descripcion_trabajo.trim()
  if (desc) partes.push(desc)
  const obs = r.observaciones?.trim()
  if (obs) partes.push(obs)
  return partes.length > 0 ? partes.join(" · ") : null
}

function construirSemanasDesasolve(
  jornadas: JornadaMaquinariaProyecto[],
  complementarios: RegistroMaquinariaComplementaria[],
  equiposPorId: ReturnType<typeof mapaEquiposPorId>
): SemanaInformeDesasolveCompleto[] {
  const porLunes = new Map<string, SemanaInformeDesasolveCompleto>()

  function semana(lunes: string): SemanaInformeDesasolveCompleto {
    let s = porLunes.get(lunes)
    if (!s) {
      s = {
        lunes,
        etiqueta: etiquetaSemanaCalendario(lunes),
        desasolve: [],
        complementarios: [],
      }
      porLunes.set(lunes, s)
    }
    return s
  }

  const jornadasOrdenadas = [...jornadas].sort(
    (a, b) =>
      a.fecha.localeCompare(b.fecha) ||
      Number(a.tramo_codigo) - Number(b.tramo_codigo) ||
      a.tramo_codigo.localeCompare(b.tramo_codigo, undefined, { numeric: true }) ||
      a.created_at.localeCompare(b.created_at)
  )

  for (const j of jornadasOrdenadas) {
    const lunes = lunesSemanaCalendario(j.fecha)
    const esIncidencia = j.es_incidencia
    semana(lunes).desasolve.push({
      fecha: j.fecha,
      tramoReferencia: j.tramo_codigo,
      tipo: esIncidencia ? "Incidencia" : "Desasolve",
      canalUbicacion: j.tramo_canal,
      equipo: esIncidencia ? "—" : nombreEquipoParaMostrar(j, equiposPorId),
      metros: esIncidencia ? null : j.metros_desasolados,
      horas: j.duracion_horas,
      textoDetalle: textoObservacionesJornada(j),
    })
  }

  const complementariosOrdenados = [...complementarios].sort(
    (a, b) => a.fecha.localeCompare(b.fecha) || a.created_at.localeCompare(b.created_at)
  )

  const contadorPorSemana = new Map<string, number>()

  for (const r of complementariosOrdenados) {
    const lunes = lunesSemanaCalendario(r.fecha)
    const n = (contadorPorSemana.get(lunes) ?? 0) + 1
    contadorPorSemana.set(lunes, n)
    semana(lunes).complementarios.push({
      fecha: r.fecha,
      tramoReferencia: `C-${n}`,
      tipo: "Complementario",
      canalUbicacion: r.ubicacion_referencia?.trim() || "—",
      equipo: nombreEquipoParaMostrar(r, equiposPorId),
      horas: r.duracion_horas,
      textoDetalle: textoDetalleComplementario(r),
    })
  }

  return [...porLunes.values()].sort((a, b) => a.lunes.localeCompare(b.lunes))
}

function construirCamaBajaPorSemana(movimientos: MovimientoCamaBaja[]): SemanaInformeCamaBaja[] {
  const porLunes = new Map<string, SemanaInformeCamaBaja>()

  const ordenados = [...movimientos].sort(
    (a, b) => a.fecha.localeCompare(b.fecha) || a.created_at.localeCompare(b.created_at)
  )

  for (const m of ordenados) {
    const lunes = lunesSemanaCalendario(m.fecha)
    let bloque = porLunes.get(lunes)
    if (!bloque) {
      bloque = { lunes, etiqueta: etiquetaSemanaCalendario(lunes), filas: [] }
      porLunes.set(lunes, bloque)
    }
    bloque.filas.push({
      fecha: m.fecha,
      camaBaja: m.cama_baja,
      maquinaTransportada: m.maquina_transportada,
      ruta: [m.origen, m.destino].filter(Boolean).join(" → ") || "—",
      horas: m.duracion_horas,
      observaciones: m.observaciones?.trim() || null,
    })
  }

  return [...porLunes.values()].sort((a, b) => a.lunes.localeCompare(b.lunes))
}

export async function cargarInformeDesasolveCompleto(
  supabase: SupabaseClient,
  proyectoId: string
): Promise<InformeDesasolveCompletoPayload> {
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

  if (
    jornadas.length === 0 &&
    movimientosCamaBaja.length === 0 &&
    registrosComplementaria.length === 0
  ) {
    throw new Error("No hay registros de maquinaria para generar el informe.")
  }

  const equiposPorId = mapaEquiposPorId(equipos)
  const semanas = construirSemanasDesasolve(jornadas, registrosComplementaria, equiposPorId)
  const camaBajaPorSemana = construirCamaBajaPorSemana(movimientosCamaBaja)

  const fechasTodas = [
    ...jornadas.map((j) => j.fecha),
    ...registrosComplementaria.map((r) => r.fecha),
    ...movimientosCamaBaja.map((m) => m.fecha),
  ].sort()

  const periodoEtiqueta =
    fechasTodas.length === 0
      ? "Sin registros"
      : fechasTodas.length === 1
        ? formatearFechaRegistro(fechasTodas[0]!)
        : `${formatearFechaRegistro(fechasTodas[0]!)} — ${formatearFechaRegistro(fechasTodas[fechasTodas.length - 1]!)}`

  const semanasActivas = semanas.filter(
    (s) => s.desasolve.length > 0 || s.complementarios.length > 0
  )

  return {
    proyecto,
    periodoEtiqueta,
    generadoEnIso: new Date().toISOString(),
    semanas: semanasActivas,
    camaBajaPorSemana,
    formatearMetros: formatearMetrosDesasolveResumen,
  }
}