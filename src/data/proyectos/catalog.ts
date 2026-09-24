export type ProyectoModulo =
  | "presupuesto"
  | "afectacion"
  | "maquinaria"
  | "fotos"
  | "libroObra"
  | "mapaTramos"

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
}

const MODULOS_P2: ProyectoModulos = {
  presupuesto: false,
  afectacion: false,
  maquinaria: true,
  fotos: true,
  libroObra: false,
  mapaTramos: true,
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
    nombreObra: "Desasolve de canales de riego",
    numeroContrato: "Pendiente",
    cliente: "Empresa Pública del Agua (EPA EP)",
    objeto: "Desasolve de canales de riego con excavadoras — Sistema Trasvase Manabí",
    sistema: "Trasvase Manabí — Canales de riego",
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

export const STORAGE_KEY_PROYECTO_ACTIVO = "control-obra:proyecto-activo"
