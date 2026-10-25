import {
  FECHA_INICIO_PLAZO_EJECUCION,
  FECHA_PAGO_ANTICIPO,
  PLAZO_CALENDARIO_DIAS,
  PORCENTAJE_ANTICIPO_CONTRATO,
  PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION,
  RADIO_DESALOJO_MAX_KM,
  RESOLUCION_EMERGENCIA,
} from "@/src/data/contrato-emergencia-severino-trasvase"
import { FLUJO_MATERIAL_DESASOLVE } from "@/src/data/planilla/flujo-material-desasolve"
import { PRESUPUESTO_OFERTA_SIN_IVA_USD } from "@/src/data/planilla/presupuesto-desasolve-emergencia"
import type { PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { calcularPeriodosPlanilla } from "@/src/lib/planilla-calculo"

export type DiaPlanMaestro = {
  fecha: string
  diaObra: number
  planilla: 1 | 2
  foco: string
  trasvase: string[]
  sanAntonio: string[]
  severino: string[]
  transversal: string[]
}

export type PlanMaestroMetadatos = {
  resolucion: string
  fechaInicioPlazo: string
  fechaFinPlazo: string
  plazoDias: number
  anticipoPct: number
  fechaAnticipo: string
  montoOfertaSinIva: number
  periodos: PlanillaPeriodo[]
}

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function diaSemanaPlan(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-EC", { weekday: "short" })
}

function tareasPorFase(diaObra: number): Omit<DiaPlanMaestro, "fecha" | "diaObra" | "planilla"> {
  if (diaObra <= 3) {
    return {
      foco: "Movilización y arranque formal",
      trasvase: [
        "Confirmar frentes prioritarios en mapa (tramos semana 1).",
        "Replanteo/nivelación km 0 en tramos de arranque (rub. 1).",
        "Excavadora DOOSAN + VOLVO: prueba de jornada, horómetro base.",
        "Volqueta MACK: ruta botadero ≤ 5 km, ticket piloto solo si hay excedente real.",
      ],
      sanAntonio: [
        "Recorrido canal San Antonio con Amén; definir accesos y seguridad.",
        "Replanteo tramo inicial (rub. 5).",
      ],
      severino: [
        "Carvajal: inspección visual, permisos de ingreso EPA, plan de pruebas.",
        "Verificar arribo TTR/Megger (arrendamiento Portotrans/Electric-Transformer).",
      ],
      transversal: [
        "Acta de inicio / comunicación EPA (Macías).",
        "Cargar botaderos en sistema (tabla proyecto_botaderos).",
        "Capacitación: GPS, jornadas, tickets solo para excedente, reporte CGE.",
        "Acordar criterio de reconformación in situ vs excedente a botadero (topógrafo + residente).",
      ],
    }
  }
  if (diaObra <= 10) {
    return {
      foco: "Producción: excavación + reconformación de muros; desalojo solo excedente",
      trasvase: [
        "Desazolve y reconformación de taludes in situ (rub. 2); cerrar minitramos GPS.",
        "Registrar en libro de obra fotos de muro reconformado antes de considerar excedente.",
        "Volqueta: ticket V₂ únicamente por m³ que salen del frente a botadero.",
        "Tractor/motoniveladora según tramo (rub. 4) cuando corresponda al presupuesto.",
        "Vélez: cuadro avance vs 60,13 % y balance material por tramo.",
      ],
      sanAntonio: [
        "Desazolve mayores + reconformación (rub. 6); desalojo rub. 7 solo excedente.",
      ],
      severino: [
        "Pruebas eléctricas iniciales (rub. 9) si condiciones lo permiten.",
        "Muestreo aceite (rub. 10–11) según ventanas del laboratorio.",
      ],
      transversal: [
        "Reporte diario CGE: V₁ vs V₂ con nota de reconformación (V₂ << V₁ OK).",
        "Consolidado maquinaria planilla vs horómetros.",
      ],
    }
  }
  if (diaObra <= 20) {
    return {
      foco: "Pico Planilla 1 — sostener balance material",
      trasvase: [
        "Secuenciar 2 excavadoras; priorizar reconformación antes de sacar material.",
        "Refuerzo volqueta solo si cola de excedente supera 1 unidad (turnos o 2.ª placa).",
        "Topografía Chancay: cubicación V₁ y estimado % excedente por tramo.",
      ],
      sanAntonio: ["Avance mayores; mismo criterio excedente vs muro."],
      severino: [
        "Termovacío/filtrado aceite (rub. 12) según cronograma Severino.",
        "Apertura tapa (rub. 13) con prerequisitos cumplidos.",
      ],
      transversal: [
        "Salva-plazos si paralización/lluvia.",
        "Preparar medición: rub. 2/6 por avance; rub. 3/7 por tickets acumulados.",
      ],
    }
  }
  if (diaObra <= 30) {
    return {
      foco: "Cierre Planilla 1 (meta 60,13 % acumulado)",
      trasvase: [
        "Cerrar minitramos; evidencia de reconformación + tickets de excedente.",
        "Conciliación V₁/V₂/V₃ con acta de balance material del periodo.",
      ],
      sanAntonio: ["Cierre parcial al % objetivo."],
      severino: ["Avance rubros 9–15."],
      transversal: [
        "Memorando planilla 1 + paquete documental.",
        "Informe consolidado maquinaria.",
      ],
    }
  }
  if (diaObra <= 45) {
    return {
      foco: "Planilla 2 — remate civil",
      trasvase: [
        "Remate desazolve/reconformación y excedente a botadero (rub. 2–4).",
        "Auditoría volumétrica con criterio reconformación.",
      ],
      sanAntonio: ["Cierre rubros 6–8."],
      severino: ["Inspección interna, pruebas finales (rub. 14–17)."],
      transversal: ["Cronograma mapa; control plazo vs saldo."],
    }
  }
  return {
    foco: "Planilla 2 — cierre contractual (100 %)",
    trasvase: ["Últimos tramos; replanteo final rub. 1."],
    sanAntonio: ["Remate encauzamiento; replanteo rub. 5."],
    severino: ["Cierre Severino rub. 17–18."],
    transversal: ["Planilla 2, acta entrega-recepción."],
  }
}

export function metadatosPlanMaestro(config: ProyectoPlanillaConfig): PlanMaestroMetadatos {
  const periodos = calcularPeriodosPlanilla(config)
  const finPlazo = addDays(config.fecha_inicio_plazo, config.plazo_dias - 1)
  return {
    resolucion: RESOLUCION_EMERGENCIA,
    fechaInicioPlazo: config.fecha_inicio_plazo,
    fechaFinPlazo: finPlazo,
    plazoDias: config.plazo_dias || PLAZO_CALENDARIO_DIAS,
    anticipoPct: PORCENTAJE_ANTICIPO_CONTRATO,
    fechaAnticipo: FECHA_PAGO_ANTICIPO,
    montoOfertaSinIva: PRESUPUESTO_OFERTA_SIN_IVA_USD,
    periodos,
  }
}

export function diasPlanMaestroEjecucion(config: ProyectoPlanillaConfig): DiaPlanMaestro[] {
  const plazo = config.plazo_dias || PLAZO_CALENDARIO_DIAS
  const inicio = config.fecha_inicio_plazo || FECHA_INICIO_PLAZO_EJECUCION
  const [p1] = calcularPeriodosPlanilla(config)
  const finP1 = p1?.fecha_fin ?? addDays(inicio, 29)

  const dias: DiaPlanMaestro[] = []
  for (let i = 0; i < plazo; i++) {
    const fecha = addDays(inicio, i)
    const diaObra = i + 1
    const planilla: 1 | 2 = fecha <= finP1 ? 1 : 2
    dias.push({ fecha, diaObra, planilla, ...tareasPorFase(diaObra) })
  }
  return dias
}

export function seccionesFijasPlanMaestro(): {
  id: string
  titulo: string
  parrafos: string[]
  viñetas?: string[]
}[] {
  return [
    {
      id: "material",
      titulo: FLUJO_MATERIAL_DESASOLVE.titulo,
      parrafos: [
        FLUJO_MATERIAL_DESASOLVE.balancePorTramo,
        FLUJO_MATERIAL_DESASOLVE.volqueta,
        FLUJO_MATERIAL_DESASOLVE.medicion,
        FLUJO_MATERIAL_DESASOLVE.antiglosa,
      ],
      viñetas: [...FLUJO_MATERIAL_DESASOLVE.pasos],
    },
    {
      id: "desalojo",
      titulo: "Desalojo y subcontrato",
      parrafos: [
        `Radio contractual botadero: ≤ ${RADIO_DESALOJO_MAX_KM} km. Equipo mínimo: 1 volqueta (compromiso Rosa Moreira).`,
        "Subcontratar transporte adicional solo si el excedente diario supera la capacidad de esa flota (viajes × 8 m³) o si EPA exige formalizar un tercero; todas las placas en tickets.",
        "No subcontratar por defecto: con reconformación mayoritaria la volqueta mínima atiende picos; el riesgo es excavar más excedente del que se puede evacuar, no el rubro teórico 1:1 del presupuesto.",
      ],
    },
    {
      id: "organizacion",
      titulo: "Organización (sin cabos sueltos)",
      parrafos: [
        "Cadena diaria canales: replanteo → desazolve + reconformación muro → (si hay) ticket excedente → tendido si rubro aplica → reporte CGE → libro de obra.",
        "Cadena Severino (Carvajal): pruebas → aceite → termovacío → inspección → cierre eléctrico (paralelo al civil).",
      ],
      viñetas: [
        "Superintendencia — Macías Loor",
        "Trasvase campo — Saltos",
        "Trasvase medición/planilla — Vélez",
        "San Antonio + coordinación — Amén",
        "Severino — Carvajal Cedeño",
        "Topografía — Chancay García",
      ],
    },
  ]
}

/** Referencia avance planilla 1 para textos. */
export const PCT_AVANCE_PLANILLA_1_REF = PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION
