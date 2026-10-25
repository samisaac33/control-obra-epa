/**
 * npx tsx scripts/test-libro-obra-cronograma.ts
 */
import assert from "node:assert/strict"

import { presupuestoDesasolveEmergencia } from "../src/data/planilla/presupuesto-desasolve-emergencia"
import { valoresPorDefectoPlanilla } from "../src/data/planilla/planilla-defaults-ejecucion"
import { TRAMOS_DESAZOLVE_VAE, VOLUMEN_TOTAL_TRASVASE_M3 } from "../src/data/planilla/canales-desazolve-tramos-vae"
import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import { periodoPorNumero } from "../src/lib/planilla-calculo"
import { cronogramaLibroObraFrente } from "../src/lib/libro-obra-cronograma-frente"
import { consolidarLibroObraPeriodoPlanillaPorFrentes } from "../src/lib/libro-obra-sintetico"

assert.equal(TRAMOS_DESAZOLVE_VAE.length, 25)
assert.ok(!TRAMOS_DESAZOLVE_VAE.some((t) => t.nombre.toLowerCase() === "san antonio" && t.volumenM3 === 0))

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
assert.ok(periodo)

const cronograma = cronogramaLibroObraFrente(
  "trasvase",
  periodo.fecha_inicio,
  periodo.fecha_fin,
  presupuestoDesasolveEmergencia,
  config,
  periodo,
  1,
  2
)

const diasConActividad = cronograma.filter((d) => d.actividades.length > 0)
assert.ok(diasConActividad.length >= 28, "producción casi todos los días del periodo")

const sumM3 = cronograma.reduce(
  (s, d) => s + d.actividades.reduce((t, a) => t + a.m3Desazolve, 0),
  0
)
const objetivo = presupuestoDesasolveEmergencia.find((r) => r.id === 2)!.cantidad * (defs.porcentaje_avance_planilla_1 / 100)
assert.ok(Math.abs(sumM3 - objetivo) < objetivo * 0.02, "suma m³ periodo ≈ objetivo planilla 1")

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

const trasvase = porFrente.trasvase ?? []
assert.ok(trasvase.length > 0)
const texto = trasvase[0]!.formatoEpa!.trabajosRealizados
assert.ok(!texto.includes("Coordinación:"), "sin plan maestro genérico")
assert.ok(!texto.includes("Acordar criterio"), "sin supuestos administrativos")
assert.ok(texto.includes("Tramo «"), "trabajos por tramo")
assert.ok((porFrente.san_antonio?.length ?? 0) > 0)

console.log("test-libro-obra-cronograma: OK", {
  diasTrasvase: trasvase.length,
  sumM3: Math.round(sumM3),
  objetivo: Math.round(objetivo),
  totalTramosVol: VOLUMEN_TOTAL_TRASVASE_M3,
})
