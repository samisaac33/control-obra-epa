import type { Rubro } from "@/data/presupuesto"
import { montoTotalContrato } from "@/data/presupuesto"
import { CONSORCIO_CONTRATISTA_RAZON } from "@/src/data/brand/logos-proyecto"
import { OBJETO_CONTRATO, RESOLUCION_EMERGENCIA } from "@/src/data/contrato-emergencia-severino-trasvase"
import { PRESUPUESTO_OFERTA_SIN_IVA_USD } from "@/src/data/planilla/presupuesto-desasolve-emergencia"
import type { PlanillaNumero, PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { calcularPeriodosPlanilla } from "@/src/lib/planilla-calculo"
import {
  calcularCronogramaValoradoVigente,
  type SeccionCronogramaValorado,
} from "@/src/lib/planilla-cronograma-valorado-vigente"
import {
  calcularRequerimientoPago,
  type MedicionRubroGuardada,
} from "@/src/lib/planilla-requerimiento-pago"

export type FilaTablaCronogramaEpa =
  | {
      tipo: "seccion"
      rubro: string
      titulo: string
      montoTotalSeccion: number
    }
  | {
      tipo: "rubro"
      rubro: string
      detalle: string
      unidad: string
      cantidad: number
      precioUnitario: number
      total: number
      /** Montos USD por columna de días (planilla 1 → col 0, planilla 2 → col 1). */
      montosPeriodo: [number, number]
    }

export type EncabezadoCronogramaEpa = {
  tituloVertical: string
  objeto: string
  contratista: string
  fiscalizador: string
  administrador: string
  planillaEtiqueta: string | null
  montoContratoUsd: number
  numeroContrato: string
  fechaInicioContrato: string
  fechaFinContrato: string
  etiquetasDias: [string, string]
}

export type ResumenCronogramaEpa = {
  encabezado: EncabezadoCronogramaEpa
  filas: FilaTablaCronogramaEpa[]
  montoTotalContrato: number
  inversionPeriodo: [number, number]
  avanceParcialPct: [number, number]
  inversionAcumulada: [number, number]
  avanceAcumuladoPct: [number, number]
  periodos: PlanillaPeriodo[]
}

function filasDesdeSeccionesValorado(
  secciones: SeccionCronogramaValorado[],
  modo: "programado" | "ejecutado",
  montosEjecutados?: Map<number, [number, number]>
): FilaTablaCronogramaEpa[] {
  const filas: FilaTablaCronogramaEpa[] = []
  let rubroSecuencial = 0

  for (const sec of secciones) {
    filas.push({
      tipo: "seccion",
      rubro: String(sec.numero),
      titulo: sec.titulo,
      montoTotalSeccion: sec.montoTotalSeccion,
    })

    for (const f of sec.filas) {
      rubroSecuencial += 1
      const montos: [number, number] =
        modo === "programado"
          ? [f.montoPeriodo1, f.montoPeriodo2]
          : (montosEjecutados?.get(f.rubroId) ?? [0, 0])

      filas.push({
        tipo: "rubro",
        rubro: String(rubroSecuencial),
        detalle: f.descripcion,
        unidad: f.unidad,
        cantidad: f.cantidadContrato,
        precioUnitario: f.precioUnitario,
        total: f.montoTotalRubro,
        montosPeriodo: montos,
      })
    }
  }

  return filas
}

function resumirFilas(
  filas: FilaTablaCronogramaEpa[],
  montoTotalContrato: number
): Pick<
  ResumenCronogramaEpa,
  "inversionPeriodo" | "avanceParcialPct" | "inversionAcumulada" | "avanceAcumuladoPct"
> {
  const rubros = filas.filter((f) => f.tipo === "rubro") as Extract<
    FilaTablaCronogramaEpa,
    { tipo: "rubro" }
  >[]

  const inv0 = rubros.reduce((s, f) => s + f.montosPeriodo[0], 0)
  const inv1 = rubros.reduce((s, f) => s + f.montosPeriodo[1], 0)
  const pct = (m: number) => (montoTotalContrato > 0 ? (m / montoTotalContrato) * 100 : 0)

  return {
    inversionPeriodo: [inv0, inv1],
    avanceParcialPct: [pct(inv0), pct(inv1)],
    inversionAcumulada: [inv0, inv0 + inv1],
    avanceAcumuladoPct: [pct(inv0), pct(inv0 + inv1)],
  }
}

export function encabezadoCronogramaEpa(
  config: ProyectoPlanillaConfig,
  numeroContrato: string,
  tituloVertical: string,
  planillaNumero: PlanillaNumero | null
): EncabezadoCronogramaEpa {
  const periodos = calcularPeriodosPlanilla(config)
  const finPlazo = periodos[periodos.length - 1]?.fecha_fin ?? config.fecha_inicio_plazo
  const dias = config.dias_por_planilla || 30

  return {
    tituloVertical: tituloVertical,
    objeto: OBJETO_CONTRATO,
    contratista: CONSORCIO_CONTRATISTA_RAZON,
    fiscalizador: "Fiscalizador de Obra (EPA EP)",
    administrador: "Administrador de Contrato (EPA EP)",
    planillaEtiqueta: planillaNumero
      ? `PLANILLA N° ${planillaNumero} DE AVANCE`
      : null,
    montoContratoUsd: PRESUPUESTO_OFERTA_SIN_IVA_USD,
    numeroContrato,
    fechaInicioContrato: config.fecha_inicio_plazo,
    fechaFinContrato: finPlazo,
    etiquetasDias: [String(dias), String(dias * 2)],
  }
}

export function calcularCronogramaValoradoProgramadoEpa(
  rubros: Rubro[],
  config: ProyectoPlanillaConfig,
  numeroContrato: string
): ResumenCronogramaEpa {
  const vigente = calcularCronogramaValoradoVigente(rubros, config)
  const montoTotal = montoTotalContrato(rubros)
  const filas = filasDesdeSeccionesValorado(vigente.secciones, "programado")
  const resumen = resumirFilas(filas, montoTotal)

  return {
    encabezado: encabezadoCronogramaEpa(
      config,
      numeroContrato,
      "CRONOGRAMA VALORADO PROGRAMADO",
      null
    ),
    filas,
    montoTotalContrato: montoTotal,
    ...resumen,
    periodos: vigente.periodos,
  }
}

function montosEjecutadosPorRubro(
  rubros: Rubro[],
  config: ProyectoPlanillaConfig,
  periodos: PlanillaPeriodo[],
  secciones: SeccionCronogramaValorado[],
  medicionesPlanilla1: MedicionRubroGuardada[] | undefined,
  medicionesPlanilla2: MedicionRubroGuardada[] | undefined,
  planillaHasta: PlanillaNumero
): Map<number, [number, number]> {
  const map = new Map<number, [number, number]>()

  const programadoPorRubro = new Map<number, [number, number]>()
  for (const sec of secciones) {
    for (const f of sec.filas) {
      programadoPorRubro.set(f.rubroId, [f.montoPeriodo1, f.montoPeriodo2])
    }
  }

  const calc = (num: PlanillaNumero, mediciones?: MedicionRubroGuardada[]) => {
    const periodo = periodos.find((p) => p.numero === num)
    if (!periodo) return new Map<number, number>()
    if (!mediciones?.length) {
      const idx = num === 1 ? 0 : 1
      return new Map(
        [...programadoPorRubro.entries()].map(([id, montos]) => [id, montos[idx]])
      )
    }
    const { lineas } = calcularRequerimientoPago(rubros, config, periodo, num, mediciones)
    return new Map(lineas.map((l) => [l.rubroId, l.montoPeriodo]))
  }

  const m1 = planillaHasta >= 1 ? calc(1, medicionesPlanilla1) : new Map<number, number>()
  const m2 = planillaHasta >= 2 ? calc(2, medicionesPlanilla2) : new Map<number, number>()

  for (const r of rubros) {
    map.set(r.id, [m1.get(r.id) ?? 0, m2.get(r.id) ?? 0])
  }

  return map
}

export function calcularCronogramaEjecutadoEpa(
  rubros: Rubro[],
  config: ProyectoPlanillaConfig,
  numeroContrato: string,
  planillaNumero: PlanillaNumero,
  medicionesPlanilla1?: MedicionRubroGuardada[],
  medicionesPlanilla2?: MedicionRubroGuardada[]
): ResumenCronogramaEpa {
  const vigente = calcularCronogramaValoradoVigente(rubros, config)
  const montoTotal = montoTotalContrato(rubros)
  const montosMap = montosEjecutadosPorRubro(
    rubros,
    config,
    vigente.periodos,
    vigente.secciones,
    medicionesPlanilla1,
    medicionesPlanilla2,
    planillaNumero
  )
  const filas = filasDesdeSeccionesValorado(vigente.secciones, "ejecutado", montosMap)
  const resumen = resumirFilas(filas, montoTotal)

  return {
    encabezado: encabezadoCronogramaEpa(
      config,
      numeroContrato,
      "CRONOGRAMA EJECUTADO",
      planillaNumero
    ),
    filas,
    montoTotalContrato: montoTotal,
    ...resumen,
    periodos: vigente.periodos,
  }
}

/** Resolución contractual para pie de página / metadatos. */
export const CRONOGRAMA_EPA_RESOLUCION = RESOLUCION_EMERGENCIA
