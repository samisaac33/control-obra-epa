import type { Rubro } from "@/data/presupuesto"
import { montoTotalContrato } from "@/data/presupuesto"
import type {
  EntradaMetrado,
  LineaCertificacion,
  ObraSicc,
  PeriodoCertificacion,
  ResumenCertificacion,
} from "@/lib/sicc/types"
import { formatearCantidad, formatearUsd } from "@/lib/sicc/format"

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const

/** Estados demo por periodo (enero aprobada, febrero borrador). */
const ESTADOS_DEMO: Record<string, PeriodoCertificacion["estado"]> = {
  "2026-01": "aprobada",
  "2026-02": "borrador",
}

function inicioPeriodo(periodoId: string): string {
  return `${periodoId}-01`
}

function finPeriodo(periodoId: string): string {
  const [anio, mes] = periodoId.split("-").map(Number)
  const ultimoDia = new Date(anio, mes, 0).getDate()
  return `${periodoId}-${String(ultimoDia).padStart(2, "0")}`
}

function cantidadEnRango(
  rubroId: number,
  entradas: EntradaMetrado[],
  desde: string,
  hasta: string
): number {
  return entradas
    .filter((e) => e.rubroId === rubroId && e.fecha >= desde && e.fecha <= hasta)
    .reduce((sum, e) => sum + e.cantidad, 0)
}

export function etiquetaPeriodo(periodoId: string): string {
  const [anio, mes] = periodoId.split("-").map(Number)
  return `${MESES[mes - 1]} ${anio}`
}

export function obtenerPeriodosDesdeMetrados(
  entradas: EntradaMetrado[],
  fechaInicio: string
): PeriodoCertificacion[] {
  const meses = new Set<string>()
  const inicioMes = fechaInicio.slice(0, 7)
  meses.add(inicioMes)

  for (const entrada of entradas) {
    meses.add(entrada.fecha.slice(0, 7))
  }

  const ordenados = [...meses].sort()
  return ordenados.map((id, index) => ({
    id,
    etiqueta: etiquetaPeriodo(id),
    numero: index + 1,
    estado: ESTADOS_DEMO[id] ?? "borrador",
  }))
}

export function calcularLineasCertificacion(
  rubros: Rubro[],
  entradas: EntradaMetrado[],
  periodoId: string
): LineaCertificacion[] {
  const inicio = inicioPeriodo(periodoId)
  const fin = finPeriodo(periodoId)
  const diaAnterior = new Date(`${inicio}T12:00:00`)
  diaAnterior.setDate(diaAnterior.getDate() - 1)
  const hastaAnterior = diaAnterior.toISOString().slice(0, 10)

  return rubros
    .map((rubro) => {
      const cantidadAnterior = cantidadEnRango(
        rubro.id,
        entradas,
        "1970-01-01",
        hastaAnterior
      )
      const cantidadPeriodo = cantidadEnRango(rubro.id, entradas, inicio, fin)
      const cantidadAcumulada = cantidadAnterior + cantidadPeriodo

      return {
        rubroId: rubro.id,
        detalle: rubro.detalle,
        categoria: rubro.categoria,
        unidad: rubro.unidad,
        cantidadContratada: rubro.cantidad,
        cantidadAnterior,
        cantidadPeriodo,
        cantidadAcumulada,
        precioUnitario: rubro.precioUnitario,
        montoPeriodo: cantidadPeriodo * rubro.precioUnitario,
        montoAcumulado: cantidadAcumulada * rubro.precioUnitario,
        saldoCantidad: rubro.cantidad - cantidadAcumulada,
      }
    })
    .filter((l) => l.cantidadPeriodo > 0 || l.cantidadAcumulada > 0)
}

export function calcularResumenCertificacion(
  rubros: Rubro[],
  entradas: EntradaMetrado[],
  periodo: PeriodoCertificacion
): ResumenCertificacion {
  const lineas = calcularLineasCertificacion(rubros, entradas, periodo.id)
  const montoPeriodo = lineas.reduce((sum, l) => sum + l.montoPeriodo, 0)
  const montoAcumulado = lineas.reduce((sum, l) => sum + l.montoAcumulado, 0)
  const montoContrato = montoTotalContrato(rubros)

  return {
    periodo,
    lineas,
    montoPeriodo,
    montoAcumulado,
    montoContrato,
    porcentajeAcumulado: montoContrato > 0 ? (montoAcumulado / montoContrato) * 100 : 0,
    rubrosConAvancePeriodo: lineas.filter((l) => l.cantidadPeriodo > 0).length,
  }
}

export function generarTextoCertificacion(
  obra: ObraSicc,
  resumen: ResumenCertificacion
): string {
  const { periodo, lineas } = resumen
  const encabezado = [
    "PLANILLA DE AVANCE DE OBRA — CERTIFICACIÓN MENSUAL",
    "═".repeat(64),
    `Obra: ${obra.nombre}`,
    `Contrato: ${obra.numeroContrato}`,
    `Cliente: ${obra.cliente}`,
    `Periodo: ${periodo.etiqueta}  ·  Certificación Nº ${periodo.numero}`,
    `Estado: ${periodo.estado.toUpperCase()}`,
    `Residente: ${obra.residente}`,
    "",
    `Monto del periodo: ${formatearUsd(resumen.montoPeriodo)}`,
    `Monto acumulado: ${formatearUsd(resumen.montoAcumulado)}`,
    `Avance acumulado: ${resumen.porcentajeAcumulado.toFixed(2)} % del contrato`,
    "",
    "─".repeat(64),
    "RUBROS CERTIFICADOS",
    "─".repeat(64),
  ].join("\n")

  const filas = lineas
    .map((l) => {
      return [
        `Rubro ${l.rubroId}: ${l.detalle}`,
        `  Unidad: ${l.unidad}  ·  Contratado: ${formatearCantidad(l.cantidadContratada)}`,
        `  Anterior: ${formatearCantidad(l.cantidadAnterior)}  ·  Este periodo: ${formatearCantidad(l.cantidadPeriodo)}  ·  Acumulado: ${formatearCantidad(l.cantidadAcumulada)}`,
        `  P. unit.: ${formatearUsd(l.precioUnitario)}  ·  Monto periodo: ${formatearUsd(l.montoPeriodo)}  ·  Monto acum.: ${formatearUsd(l.montoAcumulado)}`,
        "",
      ].join("\n")
    })
    .join("")

  const pie = [
    "─".repeat(64),
    `TOTAL CERTIFICACIÓN ${periodo.etiqueta.toUpperCase()}: ${formatearUsd(resumen.montoPeriodo)}`,
    `TOTAL ACUMULADO: ${formatearUsd(resumen.montoAcumulado)}`,
    "",
    "Firma residente de obra: _________________________",
    "Firma fiscalizador:      _________________________",
    "Firma administración:    _________________________",
  ].join("\n")

  return `${encabezado}\n${filas}${pie}`
}
