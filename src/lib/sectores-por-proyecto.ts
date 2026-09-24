import { PROYECTO_DESASOLVE_CANALES, PROYECTO_EMERGENCIA_MANABI } from "@/src/data/proyectos/catalog"
import {
  getSectorLabel,
  isFiltroTodosLosSectores,
  SECTORES_FOTOGRAFICOS,
  TODOS_LOS_SECTORES,
  type GrupoSector,
  type SectorFotografico,
} from "@/src/data/sectores-fotos"
import {
  getSectorLabelDesasolve,
  isFiltroTodosLosSectoresDesasolve,
  SECTORES_FOTOGRAFICOS_DESASOLVE,
  TODOS_LOS_SECTORES_DESASOLVE,
} from "@/src/data/sectores-fotos-desasolve"

export function getSectoresFotograficosPorProyecto(proyectoId: string): GrupoSector[] {
  if (proyectoId === PROYECTO_DESASOLVE_CANALES) {
    return SECTORES_FOTOGRAFICOS_DESASOLVE
  }
  return SECTORES_FOTOGRAFICOS
}

export function getTodosLosSectoresPorProyecto(proyectoId: string): SectorFotografico[] {
  if (proyectoId === PROYECTO_DESASOLVE_CANALES) {
    return TODOS_LOS_SECTORES_DESASOLVE
  }
  return TODOS_LOS_SECTORES
}

export function getSectorLabelPorProyecto(proyectoId: string, sectorId: string): string | undefined {
  if (proyectoId === PROYECTO_DESASOLVE_CANALES) {
    return getSectorLabelDesasolve(sectorId)
  }
  return getSectorLabel(sectorId)
}

export function isFiltroTodosLosSectoresPorProyecto(proyectoId: string, sectorId: string): boolean {
  if (proyectoId === PROYECTO_DESASOLVE_CANALES) {
    return isFiltroTodosLosSectoresDesasolve(sectorId)
  }
  return isFiltroTodosLosSectores(sectorId)
}

export function getSectorIdByLabelPorProyecto(proyectoId: string, label: string): string | undefined {
  const sectores = getTodosLosSectoresPorProyecto(proyectoId)
  return sectores.find((s) => s.label === label)?.id
}
