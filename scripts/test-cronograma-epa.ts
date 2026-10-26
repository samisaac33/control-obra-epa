/**
 * npx tsx scripts/test-cronograma-epa.ts
 */
import assert from "node:assert/strict"

import { PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION } from "../src/data/contrato-emergencia-severino-trasvase"
import { valoresPorDefectoPlanilla } from "../src/data/planilla/planilla-defaults-ejecucion"
import { presupuestoDesasolveEmergencia } from "../src/data/planilla/presupuesto-desasolve-emergencia"
import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import { getProyecto } from "../src/data/proyectos/catalog"
import {
  calcularCronogramaEjecutadoEpa,
  calcularCronogramaValoradoProgramadoEpa,
} from "../src/lib/planilla-cronograma-epa"
import { normalizarPlanillaConfig } from "../src/data/planilla/types"

const defaults = valoresPorDefectoPlanilla(PROYECTO_DESASOLVE_CANALES)!
const config = normalizarPlanillaConfig({
  proyecto_id: PROYECTO_DESASOLVE_CANALES,
  ...defaults,
  registrado_por: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

const contrato = getProyecto(PROYECTO_DESASOLVE_CANALES).numeroContrato
const programado = calcularCronogramaValoradoProgramadoEpa(
  presupuestoDesasolveEmergencia,
  config,
  contrato
)
const ejecutado = calcularCronogramaEjecutadoEpa(
  presupuestoDesasolveEmergencia,
  config,
  contrato,
  1
)

assert.equal(programado.encabezado.tituloVertical, "CRONOGRAMA VALORADO PROGRAMADO")
assert.equal(ejecutado.encabezado.tituloVertical, "CRONOGRAMA EJECUTADO")
assert.equal(programado.encabezado.etiquetasDias.join(","), "30,60")
assert.ok(Math.abs(programado.avanceParcialPct[0] - PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION) < 0.05)
assert.ok(
  Math.abs(
    programado.inversionPeriodo[0] + programado.inversionPeriodo[1] - programado.montoTotalContrato
  ) < 0.1
)

const rubrosProg = programado.filas.filter((f) => f.tipo === "rubro")
assert.ok(rubrosProg.length >= 18)
assert.ok(rubrosProg.every((f) => f.tipo === "rubro" && f.montosPeriodo[0] >= 0))

assert.ok(Math.abs(ejecutado.inversionPeriodo[0] - programado.inversionPeriodo[0]) < 1, "P1 sugerida = programada")

const avanceMostrado2Dec = Math.round(ejecutado.avanceParcialPct[0] * 100) / 100
assert.equal(avanceMostrado2Dec, 61.33, "avance parcial P1 mostrado (2 dec.) = 61,33 %")
assert.equal(Math.round(ejecutado.avanceAcumuladoPct[0] * 100) / 100, 61.33)

console.log("test-cronograma-epa: OK", {
  pctP1: programado.avanceParcialPct[0],
  pctEjecutado: ejecutado.avanceParcialPct[0],
  invP1: programado.inversionPeriodo[0],
})
