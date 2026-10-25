/**
 * npx tsx scripts/test-libro-obra-sintetico.ts
 */
import assert from "node:assert/strict"

import { presupuestoDesasolveEmergencia } from "../src/data/planilla/presupuesto-desasolve-emergencia"
import { valoresPorDefectoPlanilla } from "../src/data/planilla/planilla-defaults-ejecucion"
import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import { periodoPorNumero } from "../src/lib/planilla-calculo"
import { consolidarLibroObraPeriodoPlanillaPorFrentes } from "../src/lib/libro-obra-sintetico"

const defs = valoresPorDefectoPlanilla(PROYECTO_DESASOLVE_CANALES)!
const now = new Date().toISOString()
const config = {
  proyecto_id: PROYECTO_DESASOLVE_CANALES,
  ...defs,
  registrado_por: null,
  created_at: now,
  updated_at: now,
}
const periodo = periodoPorNumero(config, 1)!

const porFrente = consolidarLibroObraPeriodoPlanillaPorFrentes(
  PROYECTO_DESASOLVE_CANALES,
  periodo.fecha_inicio,
  periodo.fecha_fin,
  [],
  [],
  [],
  [],
  [],
  presupuestoDesasolveEmergencia,
  config,
  periodo,
  1
)

const entradas = porFrente.trasvase ?? []
assert.ok(entradas.length >= 1)
assert.ok(entradas[0].formatoEpa)
assert.ok(entradas[0].formatoEpa!.horasEquipos.length >= 3, "exc + volqueta + tendido")

console.log("test-libro-obra-sintetico: OK")
