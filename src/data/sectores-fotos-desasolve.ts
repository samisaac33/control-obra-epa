import type { GrupoSector, SectorFotografico } from "@/src/data/sectores-fotos"
import { ID_TODOS_LOS_SECTORES, SECTOR_TODOS_LOS_SECTORES } from "@/src/data/sectores-fotos"

export const SECTORES_FOTOGRAFICOS_DESASOLVE: GrupoSector[] = [
  {
    label: "Canales de riego",
    sectores: [
      { id: "canal-poza-honda", label: "Canal Poza Honda" },
      { id: "canal-inabronco", label: "Canal Inabronco" },
      { id: "canal-la-esperanza", label: "Canal La Esperanza" },
      { id: "canal-derivacion", label: "Canales de derivación" },
      { id: "canal-otros", label: "Otros tramos / frentes" },
    ],
  },
]

export const RUBROS_SECTORES_DESASOLVE: SectorFotografico[] =
  SECTORES_FOTOGRAFICOS_DESASOLVE.flatMap((grupo) => grupo.sectores)

export const TODOS_LOS_SECTORES_DESASOLVE: SectorFotografico[] = [
  SECTOR_TODOS_LOS_SECTORES,
  ...RUBROS_SECTORES_DESASOLVE,
]

const LABELS_BY_ID = new Map(RUBROS_SECTORES_DESASOLVE.map((s) => [s.id, s.label]))
LABELS_BY_ID.set(SECTOR_TODOS_LOS_SECTORES.id, SECTOR_TODOS_LOS_SECTORES.label)

export function getSectorLabelDesasolve(id: string): string | undefined {
  return LABELS_BY_ID.get(id)
}

export function isFiltroTodosLosSectoresDesasolve(sectorId: string): boolean {
  return !sectorId || sectorId === ID_TODOS_LOS_SECTORES
}
