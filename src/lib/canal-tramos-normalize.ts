import type { CanalTramo, OrigenExtremoTramo } from "@/src/data/tramos/types"

export function normalizarTramo(row: Record<string, unknown>): CanalTramo {
  const origenRaw = row.origen_extremo ? String(row.origen_extremo) : null
  const origen_extremo: OrigenExtremoTramo | null =
    origenRaw === "geometria_inicio" || origenRaw === "geometria_fin" ? origenRaw : null

  return {
    id: String(row.id),
    proyecto_id: String(row.proyecto_id),
    codigo: String(row.codigo),
    canal: String(row.canal),
    longitud_m: Number(row.longitud_m),
    geometria: row.geometria as CanalTramo["geometria"],
    origen_extremo,
    estado: row.estado as CanalTramo["estado"],
    avance_pct: Number(row.avance_pct),
    metros_ejecutados: Number(row.metros_ejecutados),
    fecha_inicio: row.fecha_inicio ? String(row.fecha_inicio) : null,
    fecha_fin: row.fecha_fin ? String(row.fecha_fin) : null,
    semana_programada: row.semana_programada ? String(row.semana_programada) : null,
    maquinaria_asignada: row.maquinaria_asignada ? String(row.maquinaria_asignada) : null,
    observaciones: row.observaciones ? String(row.observaciones) : null,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  }
}
