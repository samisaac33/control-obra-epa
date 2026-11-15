/**
 * npx tsx scripts/test-nombre-canal-desasolve-por-tramo.ts
 */
import assert from "node:assert/strict"

import { nombreCanalDesasolvePorCodigoTramo } from "../src/lib/maquinaria/nombre-canal-desasolve-por-tramo"

assert.equal(nombreCanalDesasolvePorCodigoTramo("tramo 1", "Puntos levantados"), "Canal pasaje las maravillas")
assert.equal(
  nombreCanalDesasolvePorCodigoTramo("25", "Puntos levantados"),
  "SAN ANTONIO"
)
assert.equal(nombreCanalDesasolvePorCodigoTramo("tramo 30", "Puntos levantados"), "Tramo 30")
assert.equal(
  nombreCanalDesasolvePorCodigoTramo("tramo 40", "Puntos levantados"),
  "San Antonio - Chone"
)
assert.equal(
  nombreCanalDesasolvePorCodigoTramo("tramo 99", "Canal guayaba"),
  "Canal guayaba"
)

console.log("test-nombre-canal-desasolve-por-tramo: ok")