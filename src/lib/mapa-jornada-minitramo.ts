import type { CanalTramo } from "@/src/data/tramos/types"
import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"
import {
  estadoEfectivoMinitramo,
  minitramosDesdePuntos,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"
import {
  mapaEquiposPorId,
  normalizarRegistroMaquinaria,
  nombreEquipoParaMostrar,
  type JornadaMinitramoMapa,
  type TramoRegistroMaquinaria,
} from "@/src/lib/tramo-maquinaria-historial"

export type { JornadaMinitramoMapa }

/** Longitud GPS (m) de cada minitramo indexada por id del punto final. */
export function mapaLongitudMinitramoPorPuntoFin(
  tramos: CanalTramo[],
  puntos: TramoPuntoAvance[]
): Map<string, number> {
  const indice = new Map<string, number>()
  for (const tramo of tramos) {
    for (const mt of minitramosDesdePuntos(puntos, tramo.id, tramo)) {
      indice.set(mt.puntoFin.id, mt.longitud_m)
    }
  }
  return indice
}

function registroCoincideLegacyJornada(
  registro: TramoRegistroMaquinaria,
  puntoFin: TramoPuntoAvance,
  longitudMinitramo_m: number
): boolean {
  if (registro.punto_avance_id) {
    return registro.punto_avance_id === puntoFin.id
  }

  if (longitudMinitramo_m <= 0) return false
  const tolerancia = Math.max(1, longitudMinitramo_m * 0.05)
  const metrosCoinciden =
    Math.abs(registro.metros_desasolados - longitudMinitramo_m) <= tolerancia
  if (!metrosCoinciden) return false

  const fechaPunto = puntoFin.created_at.slice(0, 10)
  return registro.fecha === fechaPunto
}

function buscarRegistroJornadaLegacyParaPunto(
  puntoFin: TramoPuntoAvance,
  registrosTramo: TramoRegistroMaquinaria[],
  longitudMinitramo_m: number,
  excluirRegistroIds?: ReadonlySet<string>
): TramoRegistroMaquinaria | null {
  const candidatos = registrosTramo.filter(
    (r) =>
      !(excluirRegistroIds?.has(r.id) ?? false) &&
      !r.punto_avance_id &&
      registroCoincideLegacyJornada(r, puntoFin, longitudMinitramo_m)
  )
  if (candidatos.length === 1) return candidatos[0]!
  return null
}

/** Misma regla que el tooltip del mapa: una jornada canónica por minitramo (GPS o legacy). */
export function idsRegistrosMaquinariaCanonicosPorMinitramo(
  tramos: CanalTramo[],
  puntos: TramoPuntoAvance[],
  registros: TramoRegistroMaquinaria[]
): Set<string> {
  const porTramo = new Map<string, TramoRegistroMaquinaria[]>()
  for (const registro of registros) {
    const lista = porTramo.get(registro.tramo_id) ?? []
    lista.push(registro)
    porTramo.set(registro.tramo_id, lista)
  }

  const ids = new Set<string>()
  for (const tramo of tramos) {
    const regsTramo = porTramo.get(tramo.id) ?? []
    const minitramos = minitramosDesdePuntos(puntos, tramo.id, tramo)
    const registrosUsados = new Set<string>()
    for (const mt of minitramos) {
      let registro =
        regsTramo.find((r) => r.punto_avance_id === mt.puntoFin.id) ?? null
      if (!registro) {
        registro =
          buscarRegistroJornadaLegacyParaPunto(
            mt.puntoFin,
            regsTramo,
            mt.longitud_m,
            registrosUsados
          ) ?? null
      }
      if (!registro) continue
      registrosUsados.add(registro.id)
      ids.add(registro.id)
    }
  }
  return ids
}

export function tramoTienePuntosGpsConfirmados(
  tramoId: string,
  puntos: TramoPuntoAvance[]
): boolean {
  return puntos.some((p) => p.tramo_id === tramoId && p.confirmado)
}

/** Punto final de minitramo en estado terminado (base del avance en mapa). */
export function mapaMinitramoTerminadoPorPuntoFin(
  tramos: CanalTramo[],
  puntos: TramoPuntoAvance[]
): Map<string, boolean> {
  const indice = new Map<string, boolean>()
  for (const tramo of tramos) {
    for (const mt of minitramosDesdePuntos(puntos, tramo.id, tramo)) {
      indice.set(mt.puntoFin.id, estadoEfectivoMinitramo(mt.puntoFin) === "terminado")
    }
  }
  return indice
}

export async function cargarRegistrosMaquinariaPorTramoIds(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  tramoIds: string[]
): Promise<TramoRegistroMaquinaria[]> {
  if (tramoIds.length === 0) return []

  const { data, error } = await supabase
    .from("tramo_registros_maquinaria")
    .select("*")
    .in("tramo_id", tramoIds)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => normalizarRegistroMaquinaria(row as Record<string, unknown>))
}

export function indiceJornadaMinitramoPorPuntoFin(
  tramos: CanalTramo[],
  puntos: TramoPuntoAvance[],
  registros: TramoRegistroMaquinaria[],
  equipos: ProyectoEquipoMaquinaria[]
): Map<string, JornadaMinitramoMapa> {
  const equiposPorId = mapaEquiposPorId(equipos)
  const porTramo = new Map<string, TramoRegistroMaquinaria[]>()
  for (const registro of registros) {
    const lista = porTramo.get(registro.tramo_id) ?? []
    lista.push(registro)
    porTramo.set(registro.tramo_id, lista)
  }

  const indice = new Map<string, JornadaMinitramoMapa>()

  for (const tramo of tramos) {
    const regsTramo = porTramo.get(tramo.id) ?? []
    const minitramos = minitramosDesdePuntos(puntos, tramo.id, tramo)
    const registrosUsados = new Set<string>()
    for (const mt of minitramos) {
      let registro =
        regsTramo.find((r) => r.punto_avance_id === mt.puntoFin.id) ?? null
      if (!registro) {
        registro =
          buscarRegistroJornadaLegacyParaPunto(
            mt.puntoFin,
            regsTramo,
            mt.longitud_m,
            registrosUsados
          ) ?? null
      }
      if (!registro) continue
      registrosUsados.add(registro.id)

      indice.set(mt.puntoFin.id, {
        fecha: registro.fecha.slice(0, 10),
        metros_desasolados: mt.longitud_m,
        equipoNombre: nombreEquipoParaMostrar(registro, equiposPorId),
        duracion_horas: registro.duracion_horas,
      })
    }
  }

  return indice
}
