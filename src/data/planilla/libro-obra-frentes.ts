import {
  nombreCompletoPersonal,
  type PersonalTecnicoContratista,
  residentesObraCivil,
} from "@/src/data/planilla/personal-tecnico-contratista"
import type { FrenteDesazolveVae } from "@/src/data/planilla/canales-desazolve-tramos-vae"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"

export type LibroObraFrenteId = FrenteDesazolveVae

export type LibroObraFrenteConfig = {
  id: LibroObraFrenteId
  titulo: string
  rubDesazolve: number
  rubDesalojo: number
  rubTendido: number
  residenteId: string
}

export const LIBRO_OBRA_FRENTES: LibroObraFrenteConfig[] = [
  {
    id: "trasvase",
    titulo: "Canales del Sistema Trasvase Manabí (menores)",
    rubDesazolve: 2,
    rubDesalojo: 3,
    rubTendido: 4,
    residenteId: "saltos-willian-eduardo",
  },
  {
    id: "san_antonio",
    titulo: "Canal de encauzamiento San Antonio (mayores)",
    rubDesazolve: 6,
    rubDesalojo: 7,
    rubTendido: 8,
    residenteId: "amen-hugo-enrique",
  },
]

export function frenteLibroObra(id: LibroObraFrenteId): LibroObraFrenteConfig {
  const f = LIBRO_OBRA_FRENTES.find((x) => x.id === id)
  if (!f) throw new Error(`Frente libro de obra desconocido: ${id}`)
  return f
}

export function residenteLibroObraFrente(
  proyectoId: string,
  frenteId: LibroObraFrenteId
): PersonalTecnicoContratista | null {
  const cfg = frenteLibroObra(frenteId)
  return (
    residentesObraCivil(proyectoId).find((p) => p.id === cfg.residenteId) ?? null
  )
}

export function etiquetaResidenteFrente(proyectoId: string, frenteId: LibroObraFrenteId): string {
  const r = residenteLibroObraFrente(proyectoId, frenteId)
  return r ? nombreCompletoPersonal(r) : "Residente de obra"
}

export function frentesLibroObraProyecto(proyectoId: string): LibroObraFrenteConfig[] {
  if (proyectoId !== PROYECTO_DESASOLVE_CANALES) return []
  return LIBRO_OBRA_FRENTES
}
