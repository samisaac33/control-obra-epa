/**
 * npx tsx scripts/test-colores-equipo-informe-pdf.ts
 */
import assert from "node:assert/strict"

import { fondoFilaPorEquipoInformePdf } from "../src/lib/maquinaria/colores-equipo-informe-pdf"

assert.equal(
  fondoFilaPorEquipoInformePdf("Excavadora brazo largo"),
  "#DBEAFE"
)
assert.equal(
  fondoFilaPorEquipoInformePdf("Excavadora brazo corto"),
  "#FFEDD5"
)
assert.notEqual(
  fondoFilaPorEquipoInformePdf("Excavadora brazo largo"),
  fondoFilaPorEquipoInformePdf("Excavadora brazo corto")
)
assert.equal(fondoFilaPorEquipoInformePdf("—"), "#f5f5f5")
assert.equal(
  fondoFilaPorEquipoInformePdf("Volqueta 01"),
  fondoFilaPorEquipoInformePdf("Otra volqueta")
)

console.log("test-colores-equipo-informe-pdf: ok")