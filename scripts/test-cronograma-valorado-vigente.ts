/**
 * npx tsx scripts/test-cronograma-valorado-vigente.ts
 */
import assert from "node:assert/strict"

import { PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION } from "../src/data/contrato-emergencia-severino-trasvase"
import { valoresPorDefectoPlanilla } from "../src/data/planilla/planilla-defaults-ejecucion"
import { presupuestoDesasolveEmergencia } from "../src/data/planilla/presupuesto-desasolve-emergencia"
import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import { calcularCronogramaValoradoVigente } from "../src/lib/planilla-cronograma-valorado-vigente"
import { normalizarPlanillaConfig } from "../src/data/planilla/types"

const defaults = valoresPorDefectoPlanilla(PROYECTO_DESASOLVE_CANALES)!
const config = normalizarPlanillaConfig({
  proyecto_id: PROYECTO_DESASOLVE_CANALES,
  ...defaults,
  registrado_por: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

const c = calcularCronogramaValoradoVigente(presupuestoDesasolveEmergencia, config)

assert.ok(Math.abs(c.montoTotalContrato - 1_793_881.01) < 0.05, "total contrato")
assert.equal(c.pctAvancePlanilla1, PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION)
assert.equal(Math.round(c.avanceParcialPct1 * 100) / 100, 61.33, "avance P1 mostrado")
assert.equal(Math.round(c.avanceAcumuladoPct1 * 100) / 100, 61.33)
assert.ok(Math.abs(c.avanceParcialPct2 - (100 - PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION)) < 0.05, "avance P2")
assert.ok(
  Math.abs(c.inversionPeriodo1 + c.inversionPeriodo2 - c.montoTotalContrato) < 0.05,
  "suma periodos"
)

const trasvase = c.secciones.find((s) => s.numero === 1)!
assert.ok(Math.abs(trasvase.montoTotalSeccion - 1_536_079.38) < 0.05)

console.log("test-cronograma-valorado-vigente: OK", {
  total: c.montoTotalContrato,
  pctP1: c.avanceParcialPct1,
  p1: c.inversionPeriodo1,
  p2: c.inversionPeriodo2,
})
