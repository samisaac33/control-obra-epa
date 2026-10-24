export type ProyectoModulo =
  | "presupuesto"
  | "afectacion"
  | "maquinaria"
  | "fotos"
  | "libroObra"
  | "mapaTramos"
  | "auditoriaAntiglosa"
  | "desalojo"
  | "reporteDiario"
  | "salvaPlazos"
  | "planillaPago"

export type ProyectoModulos = Record<ProyectoModulo, boolean>

export type ProyectoConfig = {
  id: string
  nombreObra: string
  numeroContrato: string
  cliente: string
  objeto: string
  sistema: string
  modulos: ProyectoModulos
}

export const PROYECTO_EMERGENCIA_MANABI = "emergencia-manabi"
export const PROYECTO_DESASOLVE_CANALES = "desasolve-canales"
export const PROYECTO_DEFAULT = PROYECTO_EMERGENCIA_MANABI

const MODULOS_P1: ProyectoModulos = {
  presupuesto: true,
  afectacion: true,
  maquinaria: true,
  fotos: true,
  libroObra: true,
  mapaTramos: false,
  auditoriaAntiglosa: false,
  desalojo: false,
  reporteDiario: false,
  salvaPlazos: false,
  planillaPago: false,
}

const MODULOS_P2: ProyectoModulos = {
  presupuesto: false,
  afectacion: false,
  maquinaria: true,
  fotos: true,
  libroObra: false,
  mapaTramos: true,
  auditoriaAntiglosa: true,
  desalojo: true,
  reporteDiario: true,
  salvaPlazos: true,
  planillaPago: true,
}

export const PROYECTOS: Record<string, ProyectoConfig> = {
  [PROYECTO_EMERGENCIA_MANABI]: {
    id: PROYECTO_EMERGENCIA_MANABI,
    nombreObra: "Contrato de Emergencia EPA Manabí",
    numeroContrato: "CTO-2026-EP-0142",
    cliente: "Empresa Pública del Agua (EPA EP)",
    objeto:
      "Desazolve y rehabilitación — Canales Poza Honda y compuertas La Estancilla y La Ciénega",
    sistema: "Trasvase Manabí — Sistema de Riego Canales Poza Honda",
    modulos: MODULOS_P1,
  },
  [PROYECTO_DESASOLVE_CANALES]: {
    id: PROYECTO_DESASOLVE_CANALES,
    nombreObra: "Emergencia Severino y Trasvase Manabí — Desazolve",
    numeroContrato: "EPA-EPA-2026-00134-RES",
    cliente: "Empresa Pública del Agua (EPA EP)",
    objeto:
      "MANTENIMIENTO DE LA SUBESTACIÓN ELÉCTRICA SEVERINO Y CANALES DEL TRASVASE MANABÍ",
    sistema: "Trasvase Manabí — Canales Menores y Canal 2 San Antonio By Pass–Cativo (Chone)",
    modulos: MODULOS_P2,
  },
}

export const PROYECTOS_LISTA = Object.values(PROYECTOS)

export function getProyecto(id: string): ProyectoConfig {
  return PROYECTOS[id] ?? PROYECTOS[PROYECTO_DEFAULT]
}

export function proyectoTieneModulo(proyectoId: string, modulo: ProyectoModulo): boolean {
  return getProyecto(proyectoId).modulos[modulo]
}
