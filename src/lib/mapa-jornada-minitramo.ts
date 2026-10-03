import type { CanalTramo } from "@/src/data/tramos/types"
import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"
import { minitramosDesdePuntos, type TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import {
  formatearFechaRegistro,
  mapaEquiposPorId,
  nombreEquipoParaMostrar,
  type JornadaMinitramoMapa,
  type TramoRegistroMaquinaria,
} from "@/src/lib/tramo-maquinaria-historial"

export type { JornadaMinitramoMapa }

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

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>
    return {
      id: String(r.id),
      tramo_id: String(r.tramo_id),
      fecha: String(r.fecha),
      metros_desasolados: Number(r.metros_desasolados),
      equipo: String(r.equipo),
      equipo_id: r.equipo_id != null ? String(r.equipo_id) : null,
      punto_avance_id: r.punto_avance_id != null ? String(r.punto_avance_id) : null,
      duracion_horas: r.duracion_horas != null ? Number(r.duracion_horas) : null,
      observaciones: r.observaciones ? String(r.observaciones) : null,
      created_at: String(r.created_at),
      updated_at: String(r.updated_at),
    }
  })
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
        fecha: formatearFechaRegistro(registro.fecha),
        metros_desasolados: mt.longitud_m,
        equipoNombre: nombreEquipoParaMostrar(registro, equiposPorId),
        duracion_horas: registro.duracion_horas,
      })
    }
  }

  return indice
}
