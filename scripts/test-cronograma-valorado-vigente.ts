/**
 * npx tsx scripts/test-cronograma-valorado-vigente.ts
 */
import assert from "node:assert/strict"

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
assert.ok(Math.abs(c.inversionPeriodo1 - 911_377.94) < 1, "inversión P1 firmada")
assert.ok(Math.abs(c.inversionPeriodo2 - 882_503.08) < 1, "inversión P2 firmada")
assert.ok(Math.abs(c.avanceParcialPct1 - 50.8) < 0.05, "avance parcial P1")
assert.ok(Math.abs(c.avanceParcialPct2 - 49.2) < 0.05, "avance parcial P2")

const trasvase = c.secciones.find((s) => s.numero === 1)!
assert.ok(Math.abs(trasvase.montoTotalSeccion - 1_536_079.38) < 0.05)

console.log("test-cronograma-valorado-vigente: OK", {
  total: c.montoTotalContrato,
  p1: c.inversionPeriodo1,
  p2: c.inversionPeriodo2,
})
