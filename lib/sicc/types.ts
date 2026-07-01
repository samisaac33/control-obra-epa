export type ModuloEstado = "activo" | "en_desarrollo" | "proximamente"

export type ModuloFase = 1 | 2 | 3 | 4 | 5

export type ModuloId =
  | "presupuesto"
  | "metrados"
  | "libro-obra"
  | "certificaciones"
  | "planificacion"
  | "compras"
  | "calidad"
  | "equipos"
  | "rrhh"
  | "contratos"
  | "finanzas"
  | "reportes"

export interface ModuloSicc {
  id: ModuloId
  titulo: string
  descripcion: string
  href: string
  fase: ModuloFase
  estado: ModuloEstado
  funcionalidades: string[]
}

export interface ObraSicc {
  id: string
  nombre: string
  numeroContrato: string
  cliente: string
  ubicacion: string
  residente: string
  fechaInicio: string
  plazoDias: number
  montoContrato: number
  avanceFisico: number
  avanceFinanciero: number
}

export interface EntradaLibroObra {
  id: string
  fecha: string
  clima: string
  temperatura?: string
  personal: number
  actividades: string
  materiales?: string
  equipos?: string
  incidencias?: string
  observaciones?: string
  residente: string
}

export interface KpiObra {
  etiqueta: string
  valor: string
  detalle?: string
  tendencia?: "positiva" | "negativa" | "neutral"
}
