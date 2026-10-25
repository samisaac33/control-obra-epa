/**
 * npx tsx scripts/test-libro-obra-sintetico.ts
 */
import assert from "node:assert/strict"

import { diasPlanMaestroEjecucion } from "../src/data/planilla/plan-maestro-ejecucion-desasolve"
import { valoresPorDefectoPlanilla } from "../src/data/planilla/planilla-defaults-ejecucion"
import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import { consolidarLibroObraPeriodoPlanilla } from "../src/lib/libro-obra-sintetico"

const defs = valoresPorDefectoPlanilla(PROYECTO_DESASOLVE_CANALES)!
const now = new Date().toISOString()
const config = {
  proyecto_id: PROYECTO_DESASOLVE_CANALES,
  ...defs,
  registrado_por: null,
  created_at: now,
  updated_at: now,
}
const planPorFecha = new Map(diasPlanMaestroEjecucion(config).map((d) => [d.fecha, d]))

const entradas = consolidarLibroObraPeriodoPlanilla(
  "2026-10-26",
  "2026-10-28",
  [],
  [],
  [],
  [],
  [],
  planPorFecha
)

assert.equal(entradas.length, 3)
assert.ok(entradas[0].lineasRegistro.length >= 2)
assert.equal(entradas[0].evidencias.length, 0)
assert.ok(
  entradas[0].lineasRegistro.some((l) => l.texto.includes("pendiente de anexo manual")),
  "aviso fotos"
)
assert.ok(entradas[0].formatoEpa, "formato EPA por día")
assert.ok(entradas[0].formatoEpa!.trabajosRealizados.includes("Se inició con los trabajos de:"))
assert.ok(
  entradas[0].formatoEpa!.trabajosRealizados.includes("Movilización"),
  "plan maestro día 1"
)
assert.ok(entradas[0].formatoEpa!.equiposUtilizados.length >= 5, "filas equipos EPA")
assert.ok(
  (entradas[0].formatoEpa!.equiposUtilizados.find((e) => e.etiqueta === "EXCAVADORAS")?.cantidad ?? 0) >=
    1,
  "excavadora inferida plan"
)
assert.ok(entradas[0].formatoEpa!.horasEquipos.length >= 1, "tabla mañana/tarde/total")
assert.ok(entradas[0].formatoEpa!.horasEquipos[0]!.manana.includes("8:00"))

console.log("test-libro-obra-sintetico: OK")
