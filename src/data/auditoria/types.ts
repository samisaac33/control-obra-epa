import type { GeoJsonLineString } from "@/src/data/tramos/types"

export type EstadoAbscisaCanal =
  | "pendiente"
  | "en_proceso"
  | "ejecutado"
  | "conciliado_fiscalizacion"

export type EstadoTicketDesalojo = "en_transito" | "entregado" | "rechazado"

export type TipoEventoParalizacion =
  | "lluvia_intensa"
  | "crecida_caudal_canal"
  | "falla_suministro_electrico"
  | "bloqueo_acceso_terreno"

export type TipoMaquinaJornada =
  | "excavadora_brazo_corto"
  | "excavadora_brazo_largo"
  | "volqueta"
  | "tractor_oruga"
  | "motoniveladora"

export type CanalAbscisa = {
  id: string
  proyecto_id: string
  tramo_id: string | null
  sector_nombre: string
  abscisa_inicio: number
  abscisa_fin: number
  codigo_estacion: string
  geom_geojson: GeoJsonLineString | null
  area_inicial_m2: number | null
  area_final_m2: number | null
  longitud_m: number
  volumen_teorico_m3: number | null
  estado: EstadoAbscisaCanal
  fecha_ejecucion: string | null
  created_at: string
  updated_at: string
}

export type TicketDesalojo = {
  id: string
  proyecto_id: string
  numero_ticket: string
  placa_volqueta: string
  chofer: string | null
  capacidad_m3: number
  abscisa_id: string | null
  lat_origen: number | null
  lng_origen: number | null
  botadero_nombre: string
  lat_destino: number | null
  lng_destino: number | null
  distancia_km: number | null
  fecha_hora_despacho: string
  fecha_hora_recepcion: string | null
  estado: EstadoTicketDesalojo
  qr_hash: string
  observaciones: string | null
}

export type EventoParalizacion = {
  id: string
  proyecto_id: string
  tipo_evento: TipoEventoParalizacion
  fecha_inicio: string
  fecha_fin: string | null
  horas_perdidas: number | null
  descripcion: string | null
  texto_libro_obra: string | null
  foto_evidencia_url: string | null
  registrado_por: string | null
}

export type RegistroMaquinariaJornada = {
  id: string
  proyecto_id: string
  maquina_codigo: string
  tipo_maquina: TipoMaquinaJornada
  horometro_inicio: number
  horometro_fin: number
  horas_efectivas: number
  fecha: string
  combustible_galones: number | null
}

export type ProyectoBotadero = {
  id: string
  proyecto_id: string
  nombre: string
  lat: number
  lng: number
  activo: boolean
}

const ETIQUETAS_ESTADO_ABSCISA: Record<EstadoAbscisaCanal, string> = {
  pendiente: "Pendiente",
  en_proceso: "En excavación",
  ejecutado: "Desazolvado y cubicado",
  conciliado_fiscalizacion: "Conciliado fiscalización",
}

export function etiquetaEstadoAbscisa(estado: EstadoAbscisaCanal): string {
  return ETIQUETAS_ESTADO_ABSCISA[estado]
}

const ETIQUETAS_PARALIZACION: Record<TipoEventoParalizacion, string> = {
  lluvia_intensa: "Lluvia intensa",
  crecida_caudal_canal: "Crecida de caudal en canal",
  falla_suministro_electrico: "Falla de suministro eléctrico",
  bloqueo_acceso_terreno: "Bloqueo de acceso al terreno",
}

export function etiquetaTipoParalizacion(tipo: TipoEventoParalizacion): string {
  return ETIQUETAS_PARALIZACION[tipo]
}

export function formatearCodigoAbscisa(metros: number): string {
  const m = Math.max(0, Math.round(metros))
  const km = Math.floor(m / 1000)
  const resto = m % 1000
  return `${km}+${String(resto).padStart(3, "0")}`
}

export function codigoEstacionDesdeRango(inicioM: number, finM: number): string {
  return `${formatearCodigoAbscisa(inicioM)} a ${formatearCodigoAbscisa(finM)}`
}

export function volumenAreasMedias(
  areaInicial: number,
  areaFinal: number,
  longitudM: number
): number {
  return ((areaInicial + areaFinal) / 2) * longitudM
}

function num(val: unknown): number | null {
  if (val == null) return null
  const n = Number(val)
  return Number.isFinite(n) ? n : null
}

export function normalizarCanalAbscisa(row: Record<string, unknown>): CanalAbscisa {
  const geom = row.geom_geojson
  return {
    id: String(row.id),
    proyecto_id: String(row.proyecto_id),
    tramo_id: row.tramo_id != null ? String(row.tramo_id) : null,
    sector_nombre: String(row.sector_nombre),
    abscisa_inicio: Number(row.abscisa_inicio),
    abscisa_fin: Number(row.abscisa_fin),
    codigo_estacion: String(row.codigo_estacion),
    geom_geojson:
      geom && typeof geom === "object" && (geom as GeoJsonLineString).type === "LineString"
        ? (geom as GeoJsonLineString)
        : null,
    area_inicial_m2: num(row.area_inicial_m2),
    area_final_m2: num(row.area_final_m2),
    longitud_m: Number(row.longitud_m ?? Number(row.abscisa_fin) - Number(row.abscisa_inicio)),
    volumen_teorico_m3: num(row.volumen_teorico_m3),
    estado: row.estado as EstadoAbscisaCanal,
    fecha_ejecucion: row.fecha_ejecucion != null ? String(row.fecha_ejecucion) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

export function normalizarTicketDesalojo(row: Record<string, unknown>): TicketDesalojo {
  return {
    id: String(row.id),
    proyecto_id: String(row.proyecto_id),
    numero_ticket: String(row.numero_ticket),
    placa_volqueta: String(row.placa_volqueta),
    chofer: row.chofer != null ? String(row.chofer) : null,
    capacidad_m3: Number(row.capacidad_m3),
    abscisa_id: row.abscisa_id != null ? String(row.abscisa_id) : null,
    lat_origen: num(row.lat_origen),
    lng_origen: num(row.lng_origen),
    botadero_nombre: String(row.botadero_nombre),
    lat_destino: num(row.lat_destino),
    lng_destino: num(row.lng_destino),
    distancia_km: num(row.distancia_km),
    fecha_hora_despacho: String(row.fecha_hora_despacho),
    fecha_hora_recepcion:
      row.fecha_hora_recepcion != null ? String(row.fecha_hora_recepcion) : null,
    estado: row.estado as EstadoTicketDesalojo,
    qr_hash: String(row.qr_hash),
    observaciones: row.observaciones != null ? String(row.observaciones) : null,
  }
}

export function normalizarEventoParalizacion(row: Record<string, unknown>): EventoParalizacion {
  return {
    id: String(row.id),
    proyecto_id: String(row.proyecto_id),
    tipo_evento: row.tipo_evento as TipoEventoParalizacion,
    fecha_inicio: String(row.fecha_inicio),
    fecha_fin: row.fecha_fin != null ? String(row.fecha_fin) : null,
    horas_perdidas: num(row.horas_perdidas),
    descripcion: row.descripcion != null ? String(row.descripcion) : null,
    texto_libro_obra: row.texto_libro_obra != null ? String(row.texto_libro_obra) : null,
    foto_evidencia_url: row.foto_evidencia_url != null ? String(row.foto_evidencia_url) : null,
    registrado_por: row.registrado_por != null ? String(row.registrado_por) : null,
  }
}

export function normalizarRegistroMaquinariaJornada(
  row: Record<string, unknown>
): RegistroMaquinariaJornada {
  return {
    id: String(row.id),
    proyecto_id: String(row.proyecto_id),
    maquina_codigo: String(row.maquina_codigo),
    tipo_maquina: row.tipo_maquina as TipoMaquinaJornada,
    horometro_inicio: Number(row.horometro_inicio),
    horometro_fin: Number(row.horometro_fin),
    horas_efectivas: Number(row.horas_efectivas),
    fecha: String(row.fecha),
    combustible_galones: num(row.combustible_galones),
  }
}

export function normalizarProyectoBotadero(row: Record<string, unknown>): ProyectoBotadero {
  return {
    id: String(row.id),
    proyecto_id: String(row.proyecto_id),
    nombre: String(row.nombre),
    lat: Number(row.lat),
    lng: Number(row.lng),
    activo: Boolean(row.activo),
  }
}
