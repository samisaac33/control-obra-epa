export type ProyectoPlanillaConfig = {
  proyecto_id: string
  fecha_inicio_plazo: string
  plazo_dias: number
  dias_por_planilla: number
  porcentaje_avance_planilla_1: number
  observaciones: string | null
  registrado_por: string | null
  created_at: string
  updated_at: string
}

export type PlanillaNumero = 1 | 2

export type PlanillaPeriodo = {
  numero: PlanillaNumero
  etiqueta: string
  fecha_inicio: string
  fecha_fin: string
  porcentaje_avance_objetivo: number
  dias_calendario: number
}

export type PlanillaAnalisisIntegral = {
  fecha_inicio_plazo: string
  fecha_fin_plazo: string
  plazo_dias: number
  cantidad_planillas: number
  periodos: PlanillaPeriodo[]
  resumen_contractual: string
}

export type TipoDocumentoPlanilla =
  | "libro_obra"
  | "informe_avance"
  | "memorando_presentacion"
  | "reporte_diario_cge"
  | "auditoria_volumetrica"
  | "maquinaria_consolidado"
  | "anexo_fotografico"
  | "requerimiento_pago"

export type EstadoGeneradorDocumento = "disponible" | "proximamente"

export type DocumentoPlanillaCatalogo = {
  id: TipoDocumentoPlanilla
  titulo: string
  descripcion: string
  estado: EstadoGeneradorDocumento
  /** Ruta relativa bajo [proyectoId] o query template */
  rutaGenerador?: string
}

export function normalizarPlanillaConfig(row: Record<string, unknown>): ProyectoPlanillaConfig {
  return {
    proyecto_id: String(row.proyecto_id),
    fecha_inicio_plazo: String(row.fecha_inicio_plazo),
    plazo_dias: Number(row.plazo_dias),
    dias_por_planilla: Number(row.dias_por_planilla),
    porcentaje_avance_planilla_1: Number(row.porcentaje_avance_planilla_1),
    observaciones: row.observaciones != null ? String(row.observaciones) : null,
    registrado_por: row.registrado_por != null ? String(row.registrado_por) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}
