import {
  FRENTE_META,
  type Accionista,
  type FrenteObra,
  type RegistroDia,
  type RegistroEquipo,
} from "@/src/data/registro-maquinaria"
import { esRegistroMaquina, normalizarDuracion, resumenFrenteEtiqueta } from "@/src/lib/maquinaria-resumen"

const HORAS_POR_DIA = 8

const EQUIPOS_VIAJES = new Set(["Viajes de material para vía", "Viajes de arena"])

export const ETIQUETA_SIN_FRENTE = "Sin frente asignado"

const ORDEN_FRENTE: Record<string, number> = {
  "": 0,
  cienega: 1,
  poza_honda: 2,
  pechiche: 3,
  las_penas: 4,
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

export type InformeConsolidadoMaquinaria = {
  filas: FilaInformeConsolidadoMaquinaria[]
  totales: {
    horasMaquina: number
    viajesJimmy: number
    viajesMauricio: number
    viajesTotal: number
  }
}

function etiquetaDesdeClave(clave: ClaveFrente): string {
  if (clave === "") return ETIQUETA_SIN_FRENTE
  return FRENTE_META[clave].label
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

  function obtener(clave: ClaveFrente): AcumuladorFrente {
    const prev = mapa.get(clave) ?? vacioAcumulador()
    mapa.set(clave, prev)
    return prev
  }

  for (const dia of dias) {
    if (!dia.trabajado) continue

    for (const registro of dia.registros) {
      const clave = claveFrente(registro.frente)
      const acum = obtener(clave)

      if (esRegistroMaquina(registro)) {
        acum.horasMaquina += horasMaquinaDesdeRegistro(registro)
      }

      if (esRegistroViajesVolqueta(registro)) {
        sumarViajes(acum, registro.accionista, registro.cantidad ?? 0)
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

  return { filas, totales }
}

/** Etiqueta de frente para exportaciones (reutiliza resumen estándar salvo sin frente). */
export function etiquetaFrenteInformeConsolidado(frente: FrenteObra | null): string {
  if (frente === null) return ETIQUETA_SIN_FRENTE
  return resumenFrenteEtiqueta(frente)
}
