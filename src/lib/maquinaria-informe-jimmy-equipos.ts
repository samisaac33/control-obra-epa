import {
  ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1,
  FRENTE_META,
  type FrenteObra,
  type RegistroDia,
  type RegistroEquipo,
} from "@/src/data/registro-maquinaria"
import { esRegistroMaquina } from "@/src/lib/maquinaria-resumen"
import { horasMaquinaDesdeRegistro } from "@/src/lib/maquinaria-informe-consolidado"

const ACCIONISTA_JIMMY = "consorcio" as const
const EQUIPO_VOLQUETA = "Volqueta"

const ORDEN_EQUIPOS = [
  "Excavadora brazo largo",
  "Excavadora brazo corto",
  "Tractor",
  "Payloader",
  "Gallineta",
  "Motoniveladora",
  "Rodillo",
  "Descarga de tubos de hormigón",
  "Descarga de segundo lote de tubos de hormigón",
  "Instalación de tubos",
] as const

const ORDEN_FRENTE: Record<string, number> = {
  cienega: 1,
  poza_honda: 2,
  pechiche: 3,
  "": 4,
  las_penas: 5,
}

type ClaveFrente = FrenteObra | ""

function claveFrente(frente?: FrenteObra): ClaveFrente {
  return frente ?? ""
}

function etiquetaFrente(clave: ClaveFrente): string {
  if (clave === "") return ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1
  return FRENTE_META[clave].label
}

function esEquipoMatrizJimmy(registro: RegistroEquipo): boolean {
  return (
    registro.accionista === ACCIONISTA_JIMMY &&
    esRegistroMaquina(registro) &&
    registro.equipo !== EQUIPO_VOLQUETA
  )
}

function ordenEquipo(a: string, b: string): number {
  const idxA = ORDEN_EQUIPOS.indexOf(a as (typeof ORDEN_EQUIPOS)[number])
  const idxB = ORDEN_EQUIPOS.indexOf(b as (typeof ORDEN_EQUIPOS)[number])
  const posA = idxA === -1 ? 999 : idxA
  const posB = idxB === -1 ? 999 : idxB
  if (posA !== posB) return posA - posB
  return a.localeCompare(b, "es")
}

export type FilaMatrizJimmyEquipos = {
  frente: FrenteObra | null
  label: string
  horasPorEquipo: Record<string, number>
  totalHoras: number
}

export type MatrizJimmyEquiposPorFrente = {
  equipos: string[]
  filas: FilaMatrizJimmyEquipos[]
  totalesPorEquipo: Record<string, number>
  totalGeneral: number
}

export function construirMatrizJimmyEquiposPorFrente(dias: RegistroDia[]): MatrizJimmyEquiposPorFrente {
  const mapa = new Map<ClaveFrente, Map<string, number>>()
  const equiposActivos = new Set<string>()

  for (const dia of dias) {
    if (!dia.trabajado) continue

    for (const registro of dia.registros) {
      if (!esEquipoMatrizJimmy(registro)) continue

      const clave = claveFrente(registro.frente)
      const horas = horasMaquinaDesdeRegistro(registro)
      if (horas <= 0) continue

      equiposActivos.add(registro.equipo)

      let porEquipo = mapa.get(clave)
      if (!porEquipo) {
        porEquipo = new Map()
        mapa.set(clave, porEquipo)
      }
      porEquipo.set(registro.equipo, (porEquipo.get(registro.equipo) ?? 0) + horas)
    }
  }

  const equipos = [...equiposActivos].sort(ordenEquipo)
  const clavesOrdenadas = [...mapa.keys()].sort(
    (a, b) => (ORDEN_FRENTE[a] ?? 99) - (ORDEN_FRENTE[b] ?? 99)
  )

  const totalesPorEquipo: Record<string, number> = {}
  for (const eq of equipos) {
    totalesPorEquipo[eq] = 0
  }

  const filas: FilaMatrizJimmyEquipos[] = clavesOrdenadas.map((clave) => {
    const porEquipo = mapa.get(clave)!
    const horasPorEquipo: Record<string, number> = {}
    let totalHoras = 0

    for (const eq of equipos) {
      const h = porEquipo.get(eq) ?? 0
      horasPorEquipo[eq] = h
      totalHoras += h
      totalesPorEquipo[eq] += h
    }

    return {
      frente: clave === "" ? null : clave,
      label: etiquetaFrente(clave),
      horasPorEquipo,
      totalHoras,
    }
  })

  const totalGeneral = filas.reduce((s, f) => s + f.totalHoras, 0)

  return { equipos, filas, totalesPorEquipo, totalGeneral }
}

export function matrizJimmyEquiposTieneDatos(matriz: MatrizJimmyEquiposPorFrente): boolean {
  return matriz.filas.length > 0 && matriz.equipos.length > 0 && matriz.totalGeneral > 0
}
