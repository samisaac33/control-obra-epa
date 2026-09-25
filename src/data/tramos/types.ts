export type EstadoTramo =
  | "pendiente"
  | "programado"
  | "en_ejecucion"
  | "terminado"
  | "suspendido"

export type GeoJsonLineString = {
  type: "LineString"
  coordinates: [number, number][]
}

export type OrigenExtremoTramo = "geometria_inicio" | "geometria_fin"

export type CanalTramo = {
  id: string
  proyecto_id: string
  codigo: string
  canal: string
  longitud_m: number
  geometria: GeoJsonLineString
  origen_extremo?: OrigenExtremoTramo | null
  estado: EstadoTramo
  avance_pct: number
  metros_ejecutados: number
  fecha_inicio: string | null
  fecha_fin: string | null
  semana_programada: string | null
  maquinaria_asignada: string | null
  observaciones: string | null
  created_at?: string
  updated_at?: string
}

export type EstadoOperativoMapa = Extract<EstadoTramo, "pendiente" | "en_ejecucion" | "terminado">

/** Leyenda y filtro «Estado» en /mapa (3 estados operativos). */
export const ESTADOS_OPERATIVOS_MAPA: {
  id: EstadoOperativoMapa
  label: string
  color: string
}[] = [
  { id: "pendiente", label: "Pendiente", color: "#6366f1" },
  { id: "en_ejecucion", label: "En ejecución", color: "#ca8a04" },
  { id: "terminado", label: "Terminado", color: "#16a34a" },
]

export const ESTADOS_TRAMO: { id: EstadoTramo; label: string; color: string }[] = [
  { id: "pendiente", label: "Pendiente", color: "#6366f1" },
  { id: "programado", label: "Programado", color: "#ef4444" },
  { id: "en_ejecucion", label: "En ejecución", color: "#ca8a04" },
  { id: "terminado", label: "Terminado", color: "#16a34a" },
  { id: "suspendido", label: "Suspendido", color: "#94a3b8" },
]

/** Confirmación de puntos: estados operativos del segmento (sin duplicar «en ejecución» de la leyenda). */
export const ESTADOS_TRAMO_MAPA: { id: EstadoTramo; label: string; color: string }[] =
  ESTADOS_TRAMO.filter((e) => e.id !== "en_ejecucion")

/** @deprecated Usar colorEstadoTramo("en_ejecucion") */
export const COLOR_MINITRAMO = "#ca8a04"

export function colorEstadoTramo(estado: EstadoTramo): string {
  return ESTADOS_TRAMO.find((e) => e.id === estado)?.color ?? "#94a3b8"
}

export function etiquetaEstadoTramo(estado: EstadoTramo): string {
  return ESTADOS_TRAMO.find((e) => e.id === estado)?.label ?? estado
}
