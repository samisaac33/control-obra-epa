/**
 * npx tsx scripts/test-libro-obra-sintetico.ts
 */
import assert from "node:assert/strict"

import { consolidarLibroObraPeriodoPlanilla } from "../src/lib/libro-obra-sintetico"

const entradas = consolidarLibroObraPeriodoPlanilla(
  "2026-10-26",
  "2026-10-28",
  [],
  [],
  [],
  [],
  []
)

assert.equal(entradas.length, 3)
assert.ok(entradas[0].lineasRegistro.length >= 2)
assert.equal(entradas[0].evidencias.length, 0)
assert.ok(
  entradas[0].lineasRegistro.some((l) => l.texto.includes("pendiente de anexo manual")),
  "aviso fotos"
)

console.log("test-libro-obra-sintetico: OK")
