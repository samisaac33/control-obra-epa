import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"

export type RolPersonalContratista =
  | "superintendente_obra"
  | "residente_obra_civil"
  | "residente_obra_electrica"
  | "topografo"
  | "ingeniero_electrico"
  | "otro"

export type PersonalTecnicoContratista = {
  id: string
  rol: RolPersonalContratista
  nombres: string
  apellidos: string
  /** Sin guiones; omitir si aún no consta en documentos entregados. */
  cedula?: string
  titulo: string
  universidad?: string
  anioGraduacion?: number
  email?: string
  telefono?: string
  /** Registro Senescyt del título principal (habitualmente tercer nivel). */
  registroSenescyt?: string
  registroSenescytPosgrado?: string
  /** Frente o sector asignado (opcional). */
  sectorAsignado?: string
  observaciones?: string
}

export function nombreCompletoPersonal(p: PersonalTecnicoContratista): string {
  return `${p.nombres} ${p.apellidos}`.replace(/\s+/g, " ").trim()
}

export function lineaFirmaPersonal(p: PersonalTecnicoContratista, rolEtiqueta: string): string {
  const ci = p.cedula ? ` · C.I. ${p.cedula}` : ""
  return `${nombreCompletoPersonal(p)} · ${rolEtiqueta}${ci}`
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
    registroSenescyt: "1009-04-533040",
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
    registroSenescyt: "1009-14-1267882",
    anioGraduacion: 2013,
    email: "wesaltos@gmail.com",
    telefono: "0985370189",
    sectorAsignado: "Trasvase Manabí (canales menores) — residente de frente, obra en campo",
  },
  {
    id: "amen-hugo-enrique",
    rol: "residente_obra_civil",
    nombres: "Hugo Enrique",
    apellidos: "Amen Loor",
    cedula: "1310297393",
    titulo: "Ingeniero Civil",
    universidad: "Escuela Superior Politécnica del Litoral (ESPOL)",
    anioGraduacion: 2010,
    telefono: "0988386444",
    sectorAsignado:
      "Canal de encauzamiento San Antonio (canales mayores) — residente de frente + coordinación inter-frentes",
    registroSenescyt: "1021-10-971825",
    registroSenescytPosgrado: "1021-13-86032960",
    observaciones: "Maestría en Gestión de Proyectos (ESPAE).",
  },
  {
    id: "velez-ericka",
    rol: "residente_obra_civil",
    nombres: "Ericka Mercedes",
    apellidos: "Vélez Carreño",
    cedula: "1350292049",
    titulo: "Ingeniera Civil",
    universidad: "Universidad Técnica de Manabí",
    registroSenescyt: "1009-2021-2403029",
    anioGraduacion: 2021,
    email: "erickamercedesvelez@gmail.com",
    telefono: "0998993217",
    sectorAsignado:
      "Trasvase Manabí (canales menores) — medición, libro de obra, cuadros de planilla y respaldo documental",
  },
  {
    id: "carvajal-daniel",
    rol: "residente_obra_electrica",
    nombres: "Daniel Alberto",
    apellidos: "Carvajal Cedeño",
    cedula: "1308882503",
    titulo: "Ingeniero Eléctrico",
    universidad: "Universidad Técnica de Manabí",
    registroSenescyt: "1009-10-978009",
    anioGraduacion: 2009,
    email: "albertodacc@gmail.com",
    telefono: "0991257777",
    sectorAsignado: "Subestación Eléctrica Severino",
    observaciones: "Registro EEQ EEQ-2021-I-2058.",
  },
  {
    id: "chancay-yandry-patricio",
    rol: "topografo",
    nombres: "Yandry Patricio",
    apellidos: "Chancay García",
    cedula: "1309566824",
    titulo: "Ingeniero Civil",
    universidad: "Universidad Técnica de Manabí",
    registroSenescyt: "1009-14-1267549",
    sectorAsignado: "Replanteo, control topográfico y cubicación (canales)",
    observaciones: "Funciones de topografía en obra.",
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

export function residenteObraElectrica(proyectoId: string): PersonalTecnicoContratista | null {
  return personalPorRol(proyectoId, "residente_obra_electrica")[0] ?? null
}

export function topografoObra(proyectoId: string): PersonalTecnicoContratista | null {
  return personalPorRol(proyectoId, "topografo")[0] ?? null
}
