/**
 * npx tsx scripts/test-planilla-maquinaria-teorico.ts
 */
import assert from "node:assert/strict"

import { presupuestoDesasolveEmergencia } from "../src/data/planilla/presupuesto-desasolve-emergencia"
import { valoresPorDefectoPlanilla } from "../src/data/planilla/planilla-defaults-ejecucion"
import type { ProyectoPlanillaConfig } from "../src/data/planilla/types"
import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import { periodoPorNumero } from "../src/lib/planilla-calculo"
import {
  armarFilasConsolidadoMaquinariaPlanilla,
  jornadaCorrespondeEquipoMinimo,
} from "../src/lib/planilla-maquinaria-consolidado"
import {
  calcularHorasTeoricasAgregadasPlanilla,
  horasTeoricasPorEquipoMinimo,
  RENDIMIENTO_APU_M3_H,
} from "../src/lib/planilla-maquinaria-teorico"
import type { JornadaMaquinariaProyecto } from "../src/lib/maquinaria-desasolve-proyecto"

const defs = valoresPorDefectoPlanilla(PROYECTO_DESASOLVE_CANALES)
assert.ok(defs)
const config: ProyectoPlanillaConfig = {
  proyecto_id: PROYECTO_DESASOLVE_CANALES,
  fecha_inicio_plazo: defs.fecha_inicio_plazo,
  plazo_dias: defs.plazo_dias,
  dias_por_planilla: defs.dias_por_planilla,
  porcentaje_avance_planilla_1: defs.porcentaje_avance_planilla_1,
  observaciones: defs.observaciones,
  registrado_por: null,
  created_at: "",
  updated_at: "",
}

const periodo = periodoPorNumero(config, 1)
assert.ok(periodo)

const ag = calcularHorasTeoricasAgregadasPlanilla(
  presupuestoDesasolveEmergencia,
  config,
  periodo,
  1
)

assert.ok(ag.volumenDesazolveTrasvaseM3 > 0, "volumen trasvase periodo 1")
assert.ok(ag.desazolveTrasvase > 0)

const esperadoTrasvase =
  ag.volumenDesazolveTrasvaseM3 / RENDIMIENTO_APU_M3_H.desazolve_trasvase
assert.equal(ag.desazolveTrasvase, esperadoTrasvase)

const porEquipo = horasTeoricasPorEquipoMinimo(ag)
const exc1 = porEquipo.get("exc-doosan-225")
assert.ok(exc1 != null && exc1 > 0)
assert.equal(exc1, porEquipo.get("exc-volvo-ec210"))

const jornada: JornadaMaquinariaProyecto = {
  id: "j1",
  tramo_id: "t1",
  tramo_codigo: "1",
  tramo_canal: "Test",
  fecha: periodo.fecha_inicio,
  metros_desasolados: 100,
  equipo: "Excavadora DOOSAN SOLAR 225 LC (7.1-13-002238)",
  equipo_id: null,
  punto_avance_id: "p1",
  duracion_horas: 8,
  observaciones: null,
  es_incidencia: false,
  created_at: "",
  updated_at: "",
}

const equipoDoosan = armarFilasConsolidadoMaquinariaPlanilla(porEquipo, [jornada], []).find(
  (f) => f.equipo.id === "exc-doosan-225"
)
assert.ok(equipoDoosan)
assert.equal(equipoDoosan.horasReales, 8)

assert.equal(
  jornadaCorrespondeEquipoMinimo(jornada, equipoDoosan.equipo, new Map()),
  true
)

console.log("test-planilla-maquinaria-teorico: OK")
