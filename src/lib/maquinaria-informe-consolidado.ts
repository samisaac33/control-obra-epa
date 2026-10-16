import {
  ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1,
  FRENTE_META,
  type Accionista,
  type FrenteObra,
  type RegistroDia,
  type RegistroEquipo,
} from "@/src/data/registro-maquinaria"
import { esRegistroMaquina, normalizarDuracion, resumenFrenteEtiqueta } from "@/src/lib/maquinaria-resumen"

const HORAS_POR_DIA = 8

const EQUIPOS_VIAJES = new Set(["Viajes de material para vía", "Viajes de arena"])

/** @deprecated Use ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1 */
export const ETIQUETA_SIN_FRENTE = ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1

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

function ordenFrenteClave(clave: ClaveFrente): number {
  return ORDEN_FRENTE[clave] ?? 99
}

function esRegistroViajesVolqueta(registro: RegistroEquipo): boolean {
  return registro.duracion === "viajes" && EQUIPOS_VIAJES.has(registro.equipo)
}

export function horasMaquinaDesdeRegistro(registro: RegistroEquipo): number {
  if (!esRegistroMaquina(registro)) return 0
  return normalizarDuracion(registro) * HORAS_POR_DIA
}

type AcumuladorFrente = {
  horasMaquina: number
  viajesJimmy: number
  viajesMauricio: number
}

function vacioAcumulador(): AcumuladorFrente {
  return { horasMaquina: 0, viajesJimmy: 0, viajesMauricio: 0 }
}

function sumarViajes(acum: AcumuladorFrente, accionista: Accionista, cantidad: number): void {
  if (accionista === "consorcio") {
    acum.viajesJimmy += cantidad
  } else {
    acum.viajesMauricio += cantidad
  }
}

export type FilaInformeConsolidadoMaquinaria = {
  frente: FrenteObra | null
  label: string
  horasMaquina: number
  viajesJimmy: number
  viajesMauricio: number
  viajesTotal: number
}

export type FilaDetalleEquipoPorFrente = {
  equipo: string
  accionista: Accionista
  horasMaquina: number
  viajesVolqueta: number
}

export type SeccionDetalleMaquinasPorFrente = {
  frente: FrenteObra | null
  label: string
  filas: FilaDetalleEquipoPorFrente[]
  subtotalHoras: number
  subtotalViajes: number
}

export type InformeConsolidadoMaquinaria = {
  filas: FilaInformeConsolidadoMaquinaria[]
  detallePorFrente: SeccionDetalleMaquinasPorFrente[]
  totales: {
    horasMaquina: number
    viajesJimmy: number
    viajesMauricio: number
    viajesTotal: number
  }
}

function etiquetaDesdeClave(clave: ClaveFrente): string {
  if (clave === "") return ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1
  return FRENTE_META[clave].label
}

function claveEquipoAccionista(equipo: string, accionista: Accionista): string {
  return `${equipo}::${accionista}`
}

type AcumuladorEquipo = {
  equipo: string
  accionista: Accionista
  horasMaquina: number
  viajesVolqueta: number
}

function ordenarFilasDetalle(a: FilaDetalleEquipoPorFrente, b: FilaDetalleEquipoPorFrente): number {
  if (a.accionista !== b.accionista) {
    return a.accionista === "consorcio" ? -1 : 1
  }
  return a.equipo.localeCompare(b.equipo, "es")
}

function construirDetallePorFrente(
  mapaEquipos: Map<ClaveFrente, Map<string, AcumuladorEquipo>>,
  filasResumen: FilaInformeConsolidadoMaquinaria[]
): SeccionDetalleMaquinasPorFrente[] {
  return filasResumen.map((filaResumen) => {
    const clave = filaResumen.frente ?? ""
    const equipos = mapaEquipos.get(clave)
    const filas = equipos
      ? [...equipos.values()]
          .map((item) => ({
            equipo: item.equipo,
            accionista: item.accionista,
            horasMaquina: item.horasMaquina,
            viajesVolqueta: item.viajesVolqueta,
          }))
          .filter((f) => f.horasMaquina > 0 || f.viajesVolqueta > 0)
          .sort(ordenarFilasDetalle)
      : []

    const subtotalHoras = filas.reduce((s, f) => s + f.horasMaquina, 0)
    const subtotalViajes = filas.reduce((s, f) => s + f.viajesVolqueta, 0)

    return {
      frente: filaResumen.frente,
      label: filaResumen.label,
      filas,
      subtotalHoras,
      subtotalViajes,
    }
  })
}

function filaDesdeAcumulador(clave: ClaveFrente, acum: AcumuladorFrente): FilaInformeConsolidadoMaquinaria {
  return {
    frente: clave === "" ? null : clave,
    label: etiquetaDesdeClave(clave),
    horasMaquina: acum.horasMaquina,
    viajesJimmy: acum.viajesJimmy,
    viajesMauricio: acum.viajesMauricio,
    viajesTotal: acum.viajesJimmy + acum.viajesMauricio,
  }
}

export function construirInformeConsolidadoMaquinaria(dias: RegistroDia[]): InformeConsolidadoMaquinaria {
  const mapa = new Map<ClaveFrente, AcumuladorFrente>()
  const mapaEquipos = new Map<ClaveFrente, Map<string, AcumuladorEquipo>>()

  function obtener(clave: ClaveFrente): AcumuladorFrente {
    const prev = mapa.get(clave) ?? vacioAcumulador()
    mapa.set(clave, prev)
    return prev
  }

  function obtenerEquipo(clave: ClaveFrente, registro: RegistroEquipo): AcumuladorEquipo {
    let porFrente = mapaEquipos.get(clave)
    if (!porFrente) {
      porFrente = new Map()
      mapaEquipos.set(clave, porFrente)
    }
    const id = claveEquipoAccionista(registro.equipo, registro.accionista)
    const prev =
      porFrente.get(id) ??
      ({
        equipo: registro.equipo,
        accionista: registro.accionista,
        horasMaquina: 0,
        viajesVolqueta: 0,
      } satisfies AcumuladorEquipo)
    porFrente.set(id, prev)
    return prev
  }

  for (const dia of dias) {
    if (!dia.trabajado) continue

    for (const registro of dia.registros) {
      const clave = claveFrente(registro.frente)
      const acum = obtener(clave)
      const detalle = obtenerEquipo(clave, registro)

      if (esRegistroMaquina(registro)) {
        const horas = horasMaquinaDesdeRegistro(registro)
        acum.horasMaquina += horas
        detalle.horasMaquina += horas
      }

      if (esRegistroViajesVolqueta(registro)) {
        const cantidad = registro.cantidad ?? 0
        sumarViajes(acum, registro.accionista, cantidad)
        detalle.viajesVolqueta += cantidad
      }
    }
  }

  const clavesOrdenadas = [...mapa.keys()].sort((a, b) => ordenFrenteClave(a) - ordenFrenteClave(b))

  const filas = clavesOrdenadas
    .map((clave) => filaDesdeAcumulador(clave, mapa.get(clave)!))
    .filter(
      (fila) =>
        fila.horasMaquina > 0 || fila.viajesJimmy > 0 || fila.viajesMauricio > 0
    )

  const detallePorFrente = construirDetallePorFrente(mapaEquipos, filas)

  const totales = filas.reduce(
    (acc, fila) => {
      acc.horasMaquina += fila.horasMaquina
      acc.viajesJimmy += fila.viajesJimmy
      acc.viajesMauricio += fila.viajesMauricio
      acc.viajesTotal += fila.viajesTotal
      return acc
    },
    { horasMaquina: 0, viajesJimmy: 0, viajesMauricio: 0, viajesTotal: 0 }
  )

  return { filas, detallePorFrente, totales }
}

/** Etiqueta de frente para exportaciones (reutiliza resumen estándar salvo sin frente). */
export function etiquetaFrenteInformeConsolidado(frente: FrenteObra | null): string {
  if (frente === null) return ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1
  return resumenFrenteEtiqueta(frente)
}
