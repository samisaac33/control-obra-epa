import type { SupabaseClient } from "@supabase/supabase-js"

import { RENDIMIENTO_NOMINAL_M3_POR_H } from "@/src/data/contrato-emergencia-severino-trasvase"
import { FRACCION_DESALOJO_SOBRE_V1_REFERENCIA } from "@/src/data/planilla/flujo-material-desasolve"
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
      return "Consistencia volumétrica conforme (incluye criterio reconformación in situ)"
    case "amarillo":
      return "Observación: revisar balance material o proporción de excedente a botadero"
    case "rojo":
      return "ALERTA CRÍTICA: desalojo reportado incompatible con cubicación o sin respaldo"
  }
}

/**
 * V₁ = desazolve cubicado; V₂ = viajes a botadero. En esta obra la mayor parte se reconforma
 * in situ, por lo que V₂ << V₁ es normal. Alerta si V₂ > V₁ o excedente desproporcionado.
 */
export function evaluarSemaforoV1V2Desasolve(
  v1TopograficoM3: number,
  v2DesalojadoM3: number
): { semaforo: SemaforoRiesgoCge; ratioHaul: number | null } {
  if (v1TopograficoM3 <= EPS && v2DesalojadoM3 <= EPS) {
    return { semaforo: "verde", ratioHaul: null }
  }
  if (v1TopograficoM3 <= EPS && v2DesalojadoM3 > EPS) {
    return { semaforo: "rojo", ratioHaul: null }
  }
  const ratioHaul = v2DesalojadoM3 / Math.max(v1TopograficoM3, EPS)
  if (ratioHaul > 1.02) return { semaforo: "rojo", ratioHaul }
  if (ratioHaul <= FRACCION_DESALOJO_SOBRE_V1_REFERENCIA) return { semaforo: "verde", ratioHaul }
  if (ratioHaul <= 0.55) return { semaforo: "amarillo", ratioHaul }
  return { semaforo: "amarillo", ratioHaul }
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

  const { semaforo: semaforoV1V2, ratioHaul } = evaluarSemaforoV1V2Desasolve(
    v1TopograficoM3,
    v2DesalojadoM3
  )
  const ratioV1V2 = ratioHaul
  const ratioV2V3 = ratioDiscrepancia(v2DesalojadoM3, v3HorometroM3)

  const semaforoV2V3 = semaforoDesdeRatio(ratioV2V3)

  const medidasCorrectivas: string[] = []
  if (semaforoV1V2 !== "verde") {
    medidasCorrectivas.push(
      "Documentar balance por tramo: excavado = reconformado in situ + excedente (tickets TK)."
    )
    medidasCorrectivas.push(
      "Cruzar tickets con abscisas; verificar capacidad 8 m³ y estado entregado."
    )
  }
  if (semaforoV1V2 === "verde" && v1TopograficoM3 > EPS) {
    medidasCorrectivas.push(
      "V₂ menor que V₁: coherente con reconformación de muros; rub. 3/7 solo por excedente transportado."
    )
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
