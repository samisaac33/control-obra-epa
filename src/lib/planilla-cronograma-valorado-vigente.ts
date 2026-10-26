import type { Rubro } from "@/data/presupuesto"
import { montoTotalContrato, subtotalRubro } from "@/data/presupuesto"
import { CONSORCIO_CONTRATISTA_RAZON } from "@/src/data/brand/logos-proyecto"
import { OBJETO_CONTRATO } from "@/src/data/contrato-emergencia-severino-trasvase"
import { PRESUPUESTO_OFERTA_SIN_IVA_USD } from "@/src/data/planilla/presupuesto-desasolve-emergencia"
import type { PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { calcularPeriodosPlanilla } from "@/src/lib/planilla-calculo"

export const CRONOGRAMA_VALORADO_FIRMADO_PUBLIC_PATH =
  "/documentos/planillas/cronograma-valorado-sth-firmado.pdf"

export type FilaCronogramaValorado = {
  tipo: "rubro"
  seccion: number
  codigoItem: string
  rubroId: number
  descripcion: string
  unidad: string
  cantidadContrato: number
  precioUnitario: number
  montoTotalRubro: number
  cantidadPeriodo1: number
  cantidadPeriodo2: number
  montoPeriodo1: number
  montoPeriodo2: number
}

export type SeccionCronogramaValorado = {
  numero: number
  titulo: string
  montoTotalSeccion: number
  filas: FilaCronogramaValorado[]
}

export type ResumenCronogramaValoradoVigente = {
  titulo: string
  objeto: string
  oferente: string
  periodos: PlanillaPeriodo[]
  secciones: SeccionCronogramaValorado[]
  montoTotalContrato: number
  inversionPeriodo1: number
  inversionPeriodo2: number
  avanceParcialPct1: number
  avanceParcialPct2: number
  inversionAcumulada1: number
  inversionAcumulada2: number
  avanceAcumuladoPct1: number
  avanceAcumuladoPct2: number
  /** Referencia oferta adjudicada (Formulario 1 VAE). */
  montoDeclaradoOferta: number
}

const ORDEN_SECCION = [
  "CANALES DEL SISTEMA TRASVASE MANABÍ",
  "CANAL DE ENCAUZAMIENTO SAN ANTONIO",
  "SUBESTACIÓN ELÉCTRICA SEVERINO",
] as const

function esRubroSeverino(categoria: string): boolean {
  return categoria.toUpperCase().includes("SEVERINO")
}

/**
 * Reparto vigente según cronograma valorado firmado (Consorcio STH, oferta VAE):
 * civil 50/50 en cantidades; rubros Severino íntegros en planilla 1.
 */
export function cantidadesPorPeriodoCronogramaVigente(rubro: Rubro): [number, number] {
  if (esRubroSeverino(rubro.categoria)) {
    return [rubro.cantidad, 0]
  }
  const mitad = rubro.cantidad / 2
  const p1 = Math.round(mitad * 100) / 100
  const p2 = Math.round((rubro.cantidad - p1) * 100) / 100
  return [p1, p2]
}

function indiceSeccion(categoria: string): number {
  const i = ORDEN_SECCION.findIndex((s) => s === categoria)
  return i >= 0 ? i + 1 : 99
}

export function calcularCronogramaValoradoVigente(
  rubros: Rubro[],
  config: ProyectoPlanillaConfig
): ResumenCronogramaValoradoVigente {
  const periodos = calcularPeriodosPlanilla(config)
  const porSeccion = new Map<string, FilaCronogramaValorado[]>()

  const rubrosOrdenados = [...rubros].sort((a, b) => {
    const sa = indiceSeccion(a.categoria)
    const sb = indiceSeccion(b.categoria)
    if (sa !== sb) return sa - sb
    return a.id - b.id
  })

  const contadorSub = new Map<number, number>()

  for (const r of rubrosOrdenados) {
    const sec = indiceSeccion(r.categoria)
    const sub = (contadorSub.get(sec) ?? 0) + 1
    contadorSub.set(sec, sub)

    const [c1, c2] = cantidadesPorPeriodoCronogramaVigente(r)
    const m1 = c1 * r.precioUnitario
    const m2 = c2 * r.precioUnitario

    const fila: FilaCronogramaValorado = {
      tipo: "rubro",
      seccion: sec,
      codigoItem: `${sec}.${sub}`,
      rubroId: r.id,
      descripcion: r.detalle,
      unidad: r.unidad,
      cantidadContrato: r.cantidad,
      precioUnitario: r.precioUnitario,
      montoTotalRubro: subtotalRubro(r),
      cantidadPeriodo1: c1,
      cantidadPeriodo2: c2,
      montoPeriodo1: m1,
      montoPeriodo2: m2,
    }

    const lista = porSeccion.get(r.categoria) ?? []
    lista.push(fila)
    porSeccion.set(r.categoria, lista)
  }

  const secciones: SeccionCronogramaValorado[] = ORDEN_SECCION.map((titulo, idx) => {
    const filas = porSeccion.get(titulo) ?? []
    const montoTotalSeccion = filas.reduce((s, f) => s + f.montoTotalRubro, 0)
    return {
      numero: idx + 1,
      titulo,
      montoTotalSeccion,
      filas,
    }
  }).filter((s) => s.filas.length > 0)

  const inversionPeriodo1 = secciones.reduce(
    (s, sec) => s + sec.filas.reduce((a, f) => a + f.montoPeriodo1, 0),
    0
  )
  const inversionPeriodo2 = secciones.reduce(
    (s, sec) => s + sec.filas.reduce((a, f) => a + f.montoPeriodo2, 0),
    0
  )

  const totalContrato = montoTotalContrato(rubros)
  const pct = (m: number) => (totalContrato > 0 ? (m / totalContrato) * 100 : 0)

  return {
    titulo: "CRONOGRAMA VALORADO",
    objeto: OBJETO_CONTRATO,
    oferente: CONSORCIO_CONTRATISTA_RAZON,
    periodos,
    secciones,
    montoTotalContrato: totalContrato,
    inversionPeriodo1,
    inversionPeriodo2,
    avanceParcialPct1: pct(inversionPeriodo1),
    avanceParcialPct2: pct(inversionPeriodo2),
    inversionAcumulada1: inversionPeriodo1,
    inversionAcumulada2: totalContrato,
    avanceAcumuladoPct1: pct(inversionPeriodo1),
    avanceAcumuladoPct2: 100,
    montoDeclaradoOferta: PRESUPUESTO_OFERTA_SIN_IVA_USD,
  }
}
