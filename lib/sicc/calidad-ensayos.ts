import {
  ENSAYOS_TOLERANCIAS_SEVERINO,
  SOLICITUD_CONTRATANTE,
  idsRequisitosEnsayos,
  totalRequisitosEnsayos,
  type EstadoCumplimientoEnsayo,
  type EspecificacionEnsayosRubro,
} from "@/data/ensayos-tolerancias-severino"
import type { ObraSicc } from "@/lib/sicc/types"

export type EstadoCumplimientoMap = Record<string, EstadoCumplimientoEnsayo>

export type ResumenCumplimientoEnsayos = {
  total: number
  cumplidos: number
  enProceso: number
  pendientes: number
  noAplica: number
  porcentajeCumplimiento: number
}

const ESTADOS_VALIDOS: EstadoCumplimientoEnsayo[] = [
  "pendiente",
  "en_proceso",
  "cumplido",
  "no_aplica",
]

export function estadoInicialEnsayos(): EstadoCumplimientoMap {
  const mapa: EstadoCumplimientoMap = {}
  for (const id of idsRequisitosEnsayos()) {
    mapa[id] = "pendiente"
  }
  return mapa
}

export function normalizarEstadosEnsayos(
  parcial?: Partial<EstadoCumplimientoMap> | null
): EstadoCumplimientoMap {
  const base = estadoInicialEnsayos()
  if (!parcial) return base
  for (const id of Object.keys(base)) {
    const valor = parcial[id]
    if (valor && ESTADOS_VALIDOS.includes(valor)) {
      base[id] = valor
    }
  }
  return base
}

export function calcularResumenCumplimiento(
  estados: EstadoCumplimientoMap,
  especificaciones: EspecificacionEnsayosRubro[] = ENSAYOS_TOLERANCIAS_SEVERINO
): ResumenCumplimientoEnsayos {
  const total = totalRequisitosEnsayos(especificaciones)
  let cumplidos = 0
  let enProceso = 0
  let pendientes = 0
  let noAplica = 0

  for (const esp of especificaciones) {
    for (const req of esp.requisitos) {
      const estado = estados[req.id] ?? "pendiente"
      if (estado === "cumplido") cumplidos += 1
      else if (estado === "en_proceso") enProceso += 1
      else if (estado === "no_aplica") noAplica += 1
      else pendientes += 1
    }
  }

  const denominador = Math.max(total - noAplica, 1)
  const porcentajeCumplimiento = Math.round((cumplidos / denominador) * 1000) / 10

  return {
    total,
    cumplidos,
    enProceso,
    pendientes,
    noAplica,
    porcentajeCumplimiento,
  }
}

const ETIQUETA_ESTADO: Record<EstadoCumplimientoEnsayo, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  cumplido: "Cumplido",
  no_aplica: "No aplica",
}

export function generarTextoAnexoEnsayos(
  obra: ObraSicc,
  estados: EstadoCumplimientoMap,
  especificaciones: EspecificacionEnsayosRubro[] = ENSAYOS_TOLERANCIAS_SEVERINO
): string {
  const resumen = calcularResumenCumplimiento(estados, especificaciones)
  const lineas: string[] = [
    "ANEXO TÉCNICO — ENSAYOS Y TOLERANCIAS",
    `Respuesta a observaciones de la entidad contratante — Planilla ${SOLICITUD_CONTRATANTE.planillaReferencia}`,
    "",
    `Obra: ${obra.nombre}`,
    `Contrato: ${obra.numeroContrato}`,
    `Cliente: ${obra.cliente}`,
    `Categoría: ${SOLICITUD_CONTRATANTE.categoria}`,
    "",
    SOLICITUD_CONTRATANTE.resumen,
    "",
    `Cumplimiento: ${resumen.cumplidos}/${resumen.total - resumen.noAplica} requisitos aplicables (${resumen.porcentajeCumplimiento}%)`,
    `Pendientes: ${resumen.pendientes} | En proceso: ${resumen.enProceso} | No aplica: ${resumen.noAplica}`,
    "",
    "═".repeat(72),
  ]

  for (const esp of especificaciones) {
    lineas.push("")
    lineas.push(
      `Rubro ${esp.rubroId} — ${esp.rubroDetalle} | Sección ${esp.seccion}. ${esp.titulo}`
    )
    lineas.push("-".repeat(72))
    for (const req of esp.requisitos) {
      const estado = estados[req.id] ?? "pendiente"
      lineas.push(`• ${req.texto}`)
      if (req.criterio) {
        lineas.push(`  Criterio: ${req.criterio}`)
      }
      lineas.push(`  Estado: ${ETIQUETA_ESTADO[estado]}`)
      lineas.push("")
    }
  }

  lineas.push("═".repeat(72))
  lineas.push("")
  lineas.push(`Residente: ${obra.residente}`)
  lineas.push(`Fecha de emisión: ${new Date().toISOString().slice(0, 10)}`)

  return lineas.join("\n")
}
