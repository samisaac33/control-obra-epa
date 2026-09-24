import type { FrenteObra } from "@/src/data/registro-maquinaria"

export type EtapaMaquinariaId = "" | "3era_etapa"

export type TipoReporteEtapa = "operativo" | "horas_maquinas" | "por_sitio"

type EtapaMaquinariaConfig = {
  label: string
  desde: string
  hasta: string
  tipoReporte: TipoReporteEtapa | null
  frentes?: readonly FrenteObra[]
}

export const ETAPAS_MAQUINARIA: Record<EtapaMaquinariaId, EtapaMaquinariaConfig> = {
  "": {
    label: "Sin etapa (manual)",
    desde: "",
    hasta: "",
    tipoReporte: null,
  },
  "3era_etapa": {
    label: "3era etapa",
    desde: "2026-08-12",
    hasta: "2026-09-16",
    tipoReporte: "por_sitio",
    frentes: ["poza_honda", "pechiche", "las_penas"],
  },
}

export const ETAPAS_MAQUINARIA_OPCIONES = (
  Object.entries(ETAPAS_MAQUINARIA) as [EtapaMaquinariaId, EtapaMaquinariaConfig][]
).map(([id, config]) => ({ id, label: config.label }))
