import type { SupabaseClient } from "@supabase/supabase-js"

import { RENDIMIENTO_NOMINAL_M3_POR_H } from "@/src/data/contrato-emergencia-severino-trasvase"
import type {
  CanalAbscisa,
  RegistroMaquinariaJornada,
  TicketDesalojo,
  TipoMaquinaJornada,
} from "@/src/data/auditoria/types"
import { cargarCanalAbscisasProyecto } from "@/src/lib/cargar-canal-abscisas"
import { cargarTicketsDesalojoProyecto } from "@/src/lib/cargar-tickets-desalojo"
import { cargarRegistrosMaquinariaJornadaProyecto } from "@/src/lib/cargar-maquinaria-jornada"

const EPS = 1e-6

export type SemaforoRiesgoCge = "verde" | "amarillo" | "rojo"

export type ResultadoTriangulacionVolumetrica = {
  v1TopograficoM3: number
  v2DesalojadoM3: number
  v3HorometroM3: number
  ratioV1V2: number | null
  ratioV2V3: number | null
  semaforoV1V2: SemaforoRiesgoCge
  semaforoV2V3: SemaforoRiesgoCge
  mensajeV1V2: string
  mensajeV2V3: string
  medidasCorrectivas: string[]
}

export type RangoAuditoria = { desde: string; hasta: string }

function ratioDiscrepancia(a: number, b: number): number | null {
  const base = Math.max(Math.abs(a), EPS)
  return Math.abs(a - b) / base
}

export function semaforoDesdeRatio(ratio: number | null): SemaforoRiesgoCge {
  if (ratio == null) return "amarillo"
  if (ratio < 0.1) return "verde"
  if (ratio <= 0.2) return "amarillo"
  return "rojo"
}

export function mensajeSemaforoV1V2(semaforo: SemaforoRiesgoCge): string {
  switch (semaforo) {
    case "verde":
      return "Consistencia Volumétrica Conforme para Planillaje"
    case "amarillo":
      return "Observación: Desfase entre volumen topográfico y reporte de viajes"
    case "rojo":
      return "ALERTA CRÍTICA: Alto riesgo de observación por la Contraloría por presunto volumen no justificado"
  }
}

export function mensajeSemaforoV2V3(semaforo: SemaforoRiesgoCge): string {
  switch (semaforo) {
    case "verde":
      return "Consistencia entre desalojo reportado y rendimiento horómetro conforme"
    case "amarillo":
      return "Observación: Desfase entre viajes de volqueta y productividad por horómetro"
    case "rojo":
      return "ALERTA CRÍTICA: Volumen desalojado no sustentado por horas efectivas de excavación"
  }
}

function esExcavadora(tipo: TipoMaquinaJornada): boolean {
  return tipo === "excavadora_brazo_corto" || tipo === "excavadora_brazo_largo"
}

export function calcularV1DesdeAbscisas(abscisas: CanalAbscisa[], rango: RangoAuditoria): number {
  return abscisas
    .filter(
      (a) =>
        (a.estado === "ejecutado" || a.estado === "conciliado_fiscalizacion") &&
        a.fecha_ejecucion != null &&
        a.fecha_ejecucion >= rango.desde &&
        a.fecha_ejecucion <= rango.hasta &&
        a.volumen_teorico_m3 != null
    )
    .reduce((sum, a) => sum + (a.volumen_teorico_m3 ?? 0), 0)
}

export function calcularV2DesdeTickets(tickets: TicketDesalojo[], rango: RangoAuditoria): number {
  return tickets
    .filter((t) => {
      const dia = t.fecha_hora_despacho.slice(0, 10)
      return (
        t.estado === "entregado" &&
        dia >= rango.desde &&
        dia <= rango.hasta
      )
    })
    .reduce((sum, t) => sum + t.capacidad_m3, 0)
}

export function calcularV3DesdeJornadas(
  jornadas: RegistroMaquinariaJornada[],
  rango: RangoAuditoria
): number {
  return jornadas
    .filter((j) => j.fecha >= rango.desde && j.fecha <= rango.hasta && esExcavadora(j.tipo_maquina))
    .reduce((sum, j) => {
      const rend = RENDIMIENTO_NOMINAL_M3_POR_H[j.tipo_maquina] ?? 0
      return sum + j.horas_efectivas * rend
    }, 0)
}

export function triangulacionVolumetrica(
  abscisas: CanalAbscisa[],
  tickets: TicketDesalojo[],
  jornadas: RegistroMaquinariaJornada[],
  rango: RangoAuditoria
): ResultadoTriangulacionVolumetrica {
  const v1TopograficoM3 = calcularV1DesdeAbscisas(abscisas, rango)
  const v2DesalojadoM3 = calcularV2DesdeTickets(tickets, rango)
  const v3HorometroM3 = calcularV3DesdeJornadas(jornadas, rango)

  const ratioV1V2 = ratioDiscrepancia(v1TopograficoM3, v2DesalojadoM3)
  const ratioV2V3 = ratioDiscrepancia(v2DesalojadoM3, v3HorometroM3)

  const semaforoV1V2 = semaforoDesdeRatio(ratioV1V2)
  const semaforoV2V3 = semaforoDesdeRatio(ratioV2V3)

  const medidasCorrectivas: string[] = []
  if (semaforoV1V2 !== "verde") {
    medidasCorrectivas.push(
      "Cruzar tickets TK con abscisas ejecutadas del día; verificar capacidad 8 m³ y estado «entregado»."
    )
    medidasCorrectivas.push("Revisar áreas A₁/A₂ y recalcular volumen por método de áreas medias.")
  }
  if (semaforoV2V3 !== "verde") {
    medidasCorrectivas.push(
      "Validar horómetros de excavadora y rendimiento nominal contractual (m³/h)."
    )
    medidasCorrectivas.push("Conciliar número de viajes vs horas efectivas en el mismo frente.")
  }
  if (medidasCorrectivas.length === 0) {
    medidasCorrectivas.push("Mantener registro diario y adjuntar reporte CGE-Ready al planillaje.")
  }

  return {
    v1TopograficoM3,
    v2DesalojadoM3,
    v3HorometroM3,
    ratioV1V2,
    ratioV2V3,
    semaforoV1V2,
    semaforoV2V3,
    mensajeV1V2: mensajeSemaforoV1V2(semaforoV1V2),
    mensajeV2V3: mensajeSemaforoV2V3(semaforoV2V3),
    medidasCorrectivas,
  }
}

export async function cargarTriangulacionVolumetrica(
  supabase: SupabaseClient,
  proyectoId: string,
  rango: RangoAuditoria
): Promise<ResultadoTriangulacionVolumetrica> {
  const [abscisas, tickets, jornadas] = await Promise.all([
    cargarCanalAbscisasProyecto(supabase, proyectoId),
    cargarTicketsDesalojoProyecto(supabase, proyectoId, rango),
    cargarRegistrosMaquinariaJornadaProyecto(supabase, proyectoId, rango),
  ])
  return triangulacionVolumetrica(abscisas, tickets, jornadas, rango)
}
