/**
 * npx tsx scripts/test-nombre-canal-desasolve-por-tramo.ts
 */
import assert from "node:assert/strict"

import { nombreCanalDesasolvePorCodigoTramo } from "../src/lib/maquinaria/nombre-canal-desasolve-por-tramo"

assert.equal(nombreCanalDesasolvePorCodigoTramo("tramo 1"), "Tramo #1")
assert.equal(nombreCanalDesasolvePorCodigoTramo("25"), "Tramo #25")
assert.equal(nombreCanalDesasolvePorCodigoTramo("tramo 30"), "Tramo #30")
assert.equal(nombreCanalDesasolvePorCodigoTramo("tramo 40"), "San Antonio - Chone")

console.log("test-nombre-canal-desasolve-por-tramo: ok")