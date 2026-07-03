export type SectorFotografico = {
  id: string
  label: string
}

export type GrupoSector = {
  label: string
  sectores: SectorFotografico[]
}

export const ID_TODOS_LOS_SECTORES = "todos-los-sectores"

export const SECTOR_TODOS_LOS_SECTORES: SectorFotografico = {
  id: ID_TODOS_LOS_SECTORES,
  label: "Todos los sectores",
}

/** Nueve rubros de obra según pliego de emergencia (EMERGENCIA 2.pdf). */
export const SECTORES_FOTOGRAFICOS: GrupoSector[] = [
  {
    label: "Rubros de obra del contrato",
    sectores: [
      {
        id: "reparacion-severino",
        label: "Reparación de Bombas y Motores de la EB Severino",
      },
      {
        id: "suministro-tablas-porticos-compuertas",
        label: "Suministro de Tablas y Pórticos de Madera para Compuertas",
      },
      { id: "extraccion-lechuguines-poza-honda", label: "Extracción de Lechuguines Poza Honda" },
      {
        id: "extraccion-lechuguines-la-esperanza",
        label: "Extracción de Lechuguines La Esperanza",
      },
      {
        id: "proteccion-taludes-peniche",
        label: "Protección de Taludes de Compuerta Peniche",
      },
      {
        id: "proteccion-taludes-cienega",
        label: "Protección de Taludes de Compuerta Ciénega",
      },
      {
        id: "reconformacion-terrazamiento",
        label: "Reconformación de Terrazamiento en Sitio",
      },
      {
        id: "desazolve-canal-hormigon-inabronco",
        label: "Desazolve del Canal de Hormigón Inabronco",
      },
      { id: "reconstruccion-canal-inabronco", label: "Reconstrucción de Canal Inabronco" },
    ],
  },
]

export const RUBROS_SECTORES: SectorFotografico[] = SECTORES_FOTOGRAFICOS.flatMap(
  (grupo) => grupo.sectores
)

/** Opción «Todos los sectores» + los 9 rubros del contrato (para selectores). */
export const TODOS_LOS_SECTORES: SectorFotografico[] = [
  SECTOR_TODOS_LOS_SECTORES,
  ...RUBROS_SECTORES,
]

export function isFiltroTodosLosSectores(sectorId: string): boolean {
  return !sectorId || sectorId === ID_TODOS_LOS_SECTORES
}

const SECTOR_LABELS_BY_ID = new Map(RUBROS_SECTORES.map((sector) => [sector.id, sector.label]))
SECTOR_LABELS_BY_ID.set(SECTOR_TODOS_LOS_SECTORES.id, SECTOR_TODOS_LOS_SECTORES.label)

const SECTOR_IDS_BY_LABEL = new Map(RUBROS_SECTORES.map((sector) => [sector.label, sector.id]))
SECTOR_IDS_BY_LABEL.set(SECTOR_TODOS_LOS_SECTORES.label, SECTOR_TODOS_LOS_SECTORES.id)

/** Etiquetas históricas o del pliego en mayúsculas → id del catálogo actual. */
const SECTOR_LABEL_ALIASES: Record<string, string> = {
  "Reparación de Bombas y Motores (Severino)": "reparacion-severino",
  "Suministro de Madera para Compuertas": "suministro-tablas-porticos-compuertas",
  "Desazolve de Canales (Inabronco y otros)": "desazolve-canal-hormigon-inabronco",
  "Reconstrucción Canal Inabronco": "reconstruccion-canal-inabronco",
  "REPARACION DE BOMBAS Y MOTORES DE LA EB SEVERINO": "reparacion-severino",
  "SUMINISTRO DE TABLAS Y PORTICOS DE MADERA PARA COMPUERTAS": "suministro-tablas-porticos-compuertas",
  "SUMINISTRO DE TABLAS Y PORTICOS DE MADERA": "suministro-tablas-porticos-compuertas",
  "EXTRACCIÓN DE LECHUGUINES POZA HONDA": "extraccion-lechuguines-poza-honda",
  "EXTRACCIÓN DE LECHUGUINES LA PESPERANZA": "extraccion-lechuguines-la-esperanza",
  "EXTRACCIÓN DE LECHUGUINES LA ESPERANZA": "extraccion-lechuguines-la-esperanza",
  "PROTECCIÓN DE TALUDES DE COMPUERTA PENICHE": "proteccion-taludes-peniche",
  "PROTECCIÓN DE TALUDES COMPUERTA PENICHE": "proteccion-taludes-peniche",
  "PROTECCIÓN DE TALUDES DE COMPUERTA CIÉNEGA": "proteccion-taludes-cienega",
  "PROTECCIÓN DE TALUDES COMPUERTA CIÉNEGA": "proteccion-taludes-cienega",
  "RECONFORMACION DE TERRAZAMIENTO EN SITIO": "reconformacion-terrazamiento",
  "DESAZOLVE DEL CANAL DE HORMIGON INABRONCO": "desazolve-canal-hormigon-inabronco",
  "RECONSTRUCCIÓN DE CANAL INABRONCO": "reconstruccion-canal-inabronco",
}

export function getSectorLabel(id: string): string | undefined {
  return SECTOR_LABELS_BY_ID.get(id)
}

export function getSectorIdByLabel(label: string): string | undefined {
  return SECTOR_IDS_BY_LABEL.get(label) ?? SECTOR_LABEL_ALIASES[label]
}

export function isSectorCatalogado(label: string): boolean {
  return SECTOR_IDS_BY_LABEL.has(label) || label in SECTOR_LABEL_ALIASES
}
