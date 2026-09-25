import type { SupabaseClient } from "@supabase/supabase-js"

import type { CanalTramo, EstadoTramo, OrigenExtremoTramo } from "@/src/data/tramos/types"
import { ESTADOS_TRAMO } from "@/src/data/tramos/types"
import {
  abscisaNaturalExtremoInicio,
  esFinPar,
  esRolValido,
  extremoInicioCoord,
  intervalosDesdePuntos,
  metrosDesdeIntervalos,
  ordenDesdeRol,
  puntosOrdenadosTramo,
  type PuntoMarcado,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"
import { sincronizarAvanceDesdeMetros } from "@/src/lib/tramos-avance"

const ESTADOS_VALIDOS = new Set(ESTADOS_TRAMO.map((e) => e.id))

function parseEstadoMinitramo(raw: unknown): EstadoTramo | null {
  if (raw == null || raw === "") return null
  const value = String(raw) as EstadoTramo
  return ESTADOS_VALIDOS.has(value) ? value : null
}

export function normalizarPuntoAvance(row: Record<string, unknown>): TramoPuntoAvance {
  const rolRaw = row.rol ? String(row.rol).toLowerCase() : null
  return {
    id: String(row.id),
    tramo_id: String(row.tramo_id),
    registro_foto_id: row.registro_foto_id ? String(row.registro_foto_id) : null,
    lat: Number(row.lat),
    lng: Number(row.lng),
    abscisa_m: Number(row.abscisa_m),
    confirmado: Boolean(row.confirmado),
    created_at: String(row.created_at),
    rol: esRolValido(rolRaw) ? rolRaw : null,
    grupo_id: row.grupo_id ? String(row.grupo_id) : null,
    estado_minitramo: parseEstadoMinitramo(row.estado_minitramo),
  }
}

export async function actualizarEstadoPuntoAvance(
  supabase: SupabaseClient,
  tramoId: string,
  puntoId: string,
  estado: EstadoTramo | null
): Promise<void> {
  if (estado === null) {
    const { error } = await supabase
      .from("tramo_puntos_avance")
      .update({ estado_minitramo: null })
      .eq("id", puntoId)

    if (error) throw new Error(error.message)
    return
  }

  if (estado === "en_ejecucion") {
    const { error: clearError } = await supabase
      .from("tramo_puntos_avance")
      .update({ estado_minitramo: null })
      .eq("tramo_id", tramoId)
      .eq("estado_minitramo", "en_ejecucion")
      .neq("id", puntoId)

    if (clearError) throw new Error(clearError.message)
  }

  const { error } = await supabase
    .from("tramo_puntos_avance")
    .update({ estado_minitramo: estado })
    .eq("id", puntoId)

  if (error) throw new Error(error.message)
}

export async function actualizarEstadoMinitramo(
  supabase: SupabaseClient,
  puntoFinId: string,
  estado: EstadoTramo,
  tramoId: string
): Promise<void> {
  await actualizarEstadoPuntoAvance(supabase, tramoId, puntoFinId, estado)
}

export async function cargarPuntosAvancePorProyecto(
  supabase: SupabaseClient,
  proyectoId: string
): Promise<TramoPuntoAvance[]> {
  const { data: tramos } = await supabase
    .from("canal_tramos")
    .select("id")
    .eq("proyecto_id", proyectoId)

  const tramoIds = (tramos ?? []).map((t) => String(t.id))
  if (tramoIds.length === 0) return []

  const { data, error } = await supabase
    .from("tramo_puntos_avance")
    .select("*")
    .in("tramo_id", tramoIds)
    .eq("confirmado", true)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => normalizarPuntoAvance(row as Record<string, unknown>))
}

export async function cargarPuntosAvancePorTramo(
  supabase: SupabaseClient,
  tramoId: string
): Promise<TramoPuntoAvance[]> {
  const { data, error } = await supabase
    .from("tramo_puntos_avance")
    .select("*")
    .eq("tramo_id", tramoId)
    .eq("confirmado", true)
    .order("created_at", { ascending: false })
    .limit(40)

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => normalizarPuntoAvance(row as Record<string, unknown>))
}

function estadoDesdeAvanceRecalculo(avancePct: number, estadoActual: EstadoTramo): EstadoTramo {
  if (avancePct >= 100) return "terminado"
  if (avancePct > 0) return estadoActual === "programado" ? "programado" : "pendiente"
  return estadoActual === "programado" ? "programado" : "pendiente"
}

export async function recalcularAvanceTramoDesdePuntos(
  supabase: SupabaseClient,
  tramo: CanalTramo,
  estadoOverride?: EstadoTramo
): Promise<void> {
  const { data, error } = await supabase
    .from("tramo_puntos_avance")
    .select("*")
    .eq("tramo_id", tramo.id)
    .eq("confirmado", true)

  if (error) throw new Error(error.message)

  const puntos = (data ?? []).map((row) => normalizarPuntoAvance(row as Record<string, unknown>))
  const intervalos = intervalosDesdePuntos(puntos, tramo.id)
  const metros = metrosDesdeIntervalos(intervalos, tramo.longitud_m)
  const avancePct = sincronizarAvanceDesdeMetros(tramo.longitud_m, metros)
  const estado = estadoOverride ?? estadoDesdeAvanceRecalculo(avancePct, tramo.estado)

  const { error: updateError } = await supabase
    .from("canal_tramos")
    .update({
      metros_ejecutados: metros,
      avance_pct: avancePct,
      estado,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tramo.id)

  if (updateError) throw new Error(updateError.message)
}

export type ConfirmarPuntoMinitramoInput = {
  tramo: CanalTramo
  punto: PuntoMarcado
  rol: string
  orden: number
  estado: EstadoTramo
  registro_foto_id?: string | null
  userId: string
}

export async function confirmarPuntoMinitramo(
  supabase: SupabaseClient,
  input: ConfirmarPuntoMinitramoInput
): Promise<void> {
  const cierraMinitramo = esFinPar(input.orden)
  const estadoMinitramoInicial: EstadoTramo | null = cierraMinitramo
    ? input.estado === "pendiente"
      ? "en_ejecucion"
      : input.estado
    : null

  const { error: insertError } = await supabase.from("tramo_puntos_avance").insert({
    tramo_id: input.tramo.id,
    registro_foto_id: input.registro_foto_id ?? null,
    lat: input.punto.lat,
    lng: input.punto.lng,
    abscisa_m: input.punto.abscisa_m,
    confirmado: true,
    created_by: input.userId,
    rol: input.rol,
    grupo_id: null,
    estado_minitramo: estadoMinitramoInicial,
  })

  if (insertError) throw new Error(insertError.message)

  await recalcularAvanceTramoDesdePuntos(supabase, input.tramo, input.estado)

  if (input.registro_foto_id) {
    const { error: fotoError } = await supabase
      .from("registros_fotograficos")
      .update({ tramo_id: input.tramo.id })
      .eq("id", input.registro_foto_id)

    if (fotoError) throw new Error(fotoError.message)
  }
}

export type CorregirPuntoMinitramoInput = {
  tramo: CanalTramo
  puntoId: string
  punto: PuntoMarcado
  estado: EstadoTramo
}

export async function corregirPuntoMinitramo(
  supabase: SupabaseClient,
  input: CorregirPuntoMinitramoInput
): Promise<void> {
  const { error: updateError } = await supabase
    .from("tramo_puntos_avance")
    .update({
      lat: input.punto.lat,
      lng: input.punto.lng,
      abscisa_m: input.punto.abscisa_m,
    })
    .eq("id", input.puntoId)

  if (updateError) throw new Error(updateError.message)

  await recalcularAvanceTramoDesdePuntos(supabase, input.tramo, input.estado)
}

export async function eliminarMinitramo(
  supabase: SupabaseClient,
  segmentoPuntoFinId: string,
  tramo: CanalTramo
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("tramo_puntos_avance")
    .delete()
    .eq("id", segmentoPuntoFinId)

  if (deleteError) throw new Error(deleteError.message)

  await recalcularAvanceTramoDesdePuntos(supabase, tramo)
}

export type GuardarOrigenTramoEInicioInput = {
  tramo: CanalTramo
  origen_extremo: OrigenExtremoTramo
  userId: string
  marcarEnEjecucion?: boolean
}

export async function reiniciarOrigenTramoYPuntos(
  supabase: SupabaseClient,
  tramo: CanalTramo
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("tramo_puntos_avance")
    .delete()
    .eq("tramo_id", tramo.id)

  if (deleteError) throw new Error(deleteError.message)

  const { error: updateError } = await supabase
    .from("canal_tramos")
    .update({
      origen_extremo: null,
      metros_ejecutados: 0,
      avance_pct: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tramo.id)

  if (updateError) throw new Error(updateError.message)

  const tramoReset: CanalTramo = {
    ...tramo,
    origen_extremo: null,
    metros_ejecutados: 0,
    avance_pct: 0,
  }
  await recalcularAvanceTramoDesdePuntos(supabase, tramoReset)
}

export async function guardarOrigenTramoEInicio(
  supabase: SupabaseClient,
  input: GuardarOrigenTramoEInicioInput
): Promise<void> {
  const abscisa = abscisaNaturalExtremoInicio({
    ...input.tramo,
    origen_extremo: input.origen_extremo,
  })
  const coord = extremoInicioCoord({
    ...input.tramo,
    origen_extremo: input.origen_extremo,
  })

  const { error: updateError } = await supabase
    .from("canal_tramos")
    .update({
      origen_extremo: input.origen_extremo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.tramo.id)

  if (updateError) throw new Error(updateError.message)

  const { error: insertError } = await supabase.from("tramo_puntos_avance").insert({
    tramo_id: input.tramo.id,
    registro_foto_id: null,
    lat: coord.lat,
    lng: coord.lng,
    abscisa_m: abscisa,
    confirmado: true,
    created_by: input.userId,
    rol: "a",
    grupo_id: null,
    estado_minitramo: input.marcarEnEjecucion ? "en_ejecucion" : null,
  })

  if (insertError) throw new Error(insertError.message)

  const tramoActualizado: CanalTramo = {
    ...input.tramo,
    origen_extremo: input.origen_extremo,
  }
  await recalcularAvanceTramoDesdePuntos(supabase, tramoActualizado)
}

export async function eliminarPuntoHuérfano(
  supabase: SupabaseClient,
  puntoId: string,
  tramo: CanalTramo
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("tramo_puntos_avance")
    .delete()
    .eq("id", puntoId)

  if (deleteError) throw new Error(deleteError.message)

  await recalcularAvanceTramoDesdePuntos(supabase, tramo)
}

/** Desenlaza un minitramo si se corrige un punto impar que tenía par. */
export async function desenlazarMinitramoPorPunto(
  supabase: SupabaseClient,
  punto: TramoPuntoAvance
): Promise<void> {
  if (!punto.grupo_id) return

  const { error } = await supabase
    .from("tramo_puntos_avance")
    .update({ grupo_id: null })
    .eq("grupo_id", punto.grupo_id)

  if (error) throw new Error(error.message)
}

export function ultimoMinitramoTramo(puntos: TramoPuntoAvance[], tramoId: string) {
  const ordenados = puntosOrdenadosTramo(puntos, tramoId)
  const conGrupo = ordenados.filter((p) => p.grupo_id)
  if (conGrupo.length < 2) return null

  const ultimoGrupoId = conGrupo.at(-1)?.grupo_id
  if (!ultimoGrupoId) return null

  const pts = conGrupo.filter((p) => p.grupo_id === ultimoGrupoId)
  if (pts.length < 2) return null

  const sorted = [...pts].sort((a, b) => ordenDesdeRol(a.rol ?? "a") - ordenDesdeRol(b.rol ?? "b"))
  return {
    grupo_id: ultimoGrupoId,
    puntoInicio: sorted[0],
    puntoFin: sorted[sorted.length - 1],
  }
}
