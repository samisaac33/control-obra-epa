import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"

export type RolPersonalContratista =
  | "superintendente_obra"
  | "residente_obra_civil"
  | "topografo"
  | "ingeniero_electrico"
  | "otro"

export type PersonalTecnicoContratista = {
  id: string
  rol: RolPersonalContratista
  nombres: string
  apellidos: string
  cedula: string
  titulo: string
  universidad?: string
  anioGraduacion?: number
  email?: string
  telefono?: string
  /** Frente o sector asignado (opcional). */
  sectorAsignado?: string
  observaciones?: string
}

export function nombreCompletoPersonal(p: PersonalTecnicoContratista): string {
  return `${p.nombres} ${p.apellidos}`.replace(/\s+/g, " ").trim()
}

export function lineaFirmaPersonal(p: PersonalTecnicoContratista, rolEtiqueta: string): string {
  return `${nombreCompletoPersonal(p)} · ${rolEtiqueta} · C.I. ${p.cedula}`
}

/** Personal del consorcio — Emergencia Severino y Trasvase Manabí. */
export const PERSONAL_TECNICO_DESASOLVE: PersonalTecnicoContratista[] = [
  {
    id: "macias-alberto-orley",
    rol: "superintendente_obra",
    nombres: "Alberto Orley",
    apellidos: "Macías Loor",
    cedula: "1308931110",
    titulo: "Ingeniero Civil",
    universidad: "Universidad Técnica de Manabí",
    email: "orleymacias@hotmail.com",
    telefono: "0997366728",
  },
  {
    id: "saltos-willian-eduardo",
    rol: "residente_obra_civil",
    nombres: "Willian Eduardo",
    apellidos: "Saltos Arteaga",
    cedula: "1310129182",
    titulo: "Ingeniero Civil",
    universidad: "Universidad Técnica de Manabí",
    anioGraduacion: 2013,
    email: "wesaltos@gmail.com",
    telefono: "0985370189",
  },
  {
    id: "amen-hugo-enrique",
    rol: "residente_obra_civil",
    nombres: "Hugo Enrique",
    apellidos: "Amen Loor",
    cedula: "1310297393",
    titulo: "Ingeniero Civil",
    universidad: "Escuela Superior Politécnica del Litoral (ESPOL)",
    email: undefined,
    telefono: "0988386444",
    observaciones: "Maestría en Gestión de Proyectos (ESPAE).",
  },
]

export function personalContratistaProyecto(proyectoId: string): PersonalTecnicoContratista[] {
  if (proyectoId === PROYECTO_DESASOLVE_CANALES) {
    return PERSONAL_TECNICO_DESASOLVE
  }
  return []
}

export function personalPorRol(
  proyectoId: string,
  rol: RolPersonalContratista
): PersonalTecnicoContratista[] {
  return personalContratistaProyecto(proyectoId).filter((p) => p.rol === rol)
}

export function superintendenteObra(proyectoId: string): PersonalTecnicoContratista | null {
  return personalPorRol(proyectoId, "superintendente_obra")[0] ?? null
}

export function residentesObraCivil(proyectoId: string): PersonalTecnicoContratista[] {
  return personalPorRol(proyectoId, "residente_obra_civil")
}
