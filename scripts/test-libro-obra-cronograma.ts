/**
 * npx tsx scripts/test-libro-obra-cronograma.ts
 */
import assert from "node:assert/strict"

import { presupuestoDesasolveEmergencia } from "../src/data/planilla/presupuesto-desasolve-emergencia"
import { valoresPorDefectoPlanilla } from "../src/data/planilla/planilla-defaults-ejecucion"
import { TRAMOS_DESAZOLVE_VAE, VOLUMEN_TOTAL_TRASVASE_M3 } from "../src/data/planilla/canales-desazolve-tramos-vae"
import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import { periodoPorNumero } from "../src/lib/planilla-calculo"
import {
  cronogramaLibroObraFrente,
  excavadorasRequeridasParaM3Dia,
  viajesVolquetaPorDiaUnaUnidad,
  VOLQUETAS_POR_EXCAVADORA,
} from "../src/lib/libro-obra-cronograma-frente"
import { tramosPorFrente } from "../src/data/planilla/canales-desazolve-tramos-vae"
import { consolidarLibroObraPeriodoPlanillaConsolidado } from "../src/lib/libro-obra-sintetico"
import { hitosSeverinoPorFechaPlanilla } from "../src/lib/libro-obra-cronograma-severino"
import {
  climaProgramaticoDia,
  horasEquipoProgramaticas,
} from "../src/lib/libro-obra-epa-enriquecimiento-dia"

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

const entradas = consolidarLibroObraPeriodoPlanillaConsolidado(
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

const dia1 = cronograma[0]!
const m3Dia1 = dia1.actividades.reduce((s, a) => s + a.m3Desalojo, 0)
const excDia1 = dia1.actividades.length
const volqDia1 = excDia1 * VOLQUETAS_POR_EXCAVADORA
assert.ok(viajesVolquetaPorDiaUnaUnidad() > 8, "más viajes/día que escenario 5 km")
assert.equal(
  dia1.actividades.reduce((s, a) => s + a.volquetas, 0),
  volqDia1,
  "2 volquetas por excavadora"
)
assert.equal(excDia1, excavadorasRequeridasParaM3Dia(m3Dia1, "trasvase", tramosPorFrente("trasvase")))

const cronSan = cronogramaLibroObraFrente(
  "san_antonio",
  periodo.fecha_inicio,
  periodo.fecha_fin,
  presupuestoDesasolveEmergencia,
  config,
  periodo,
  1,
  6
)
const excSan1 = cronSan[0]?.actividades.length ?? 0
const volqConsolidadaDia1 = volqDia1 + excSan1 * VOLQUETAS_POR_EXCAVADORA

assert.ok(entradas.length > 0)
const dia1Entrada = entradas[0]!
assert.equal(
  dia1Entrada.formatoEpa!.equiposUtilizados.find((e) => e.etiqueta === "VOLQUETAS")?.cantidad,
  volqConsolidadaDia1
)
assert.equal(
  dia1Entrada.formatoEpa!.equiposUtilizados.find((e) => e.etiqueta === "EXCAVADORAS")?.cantidad,
  excDia1 + excSan1
)
assert.equal(
  dia1Entrada.formatoEpa!.personalUtilizado.find((e) => e.etiqueta === "OPERADORES")?.cantidad,
  excDia1 + excSan1
)

const bloques = dia1Entrada.formatoEpa!.bloquesFrente ?? []
assert.ok(bloques.length >= 2, "trasvase + san antonio el mismo día cuando ambos tienen cronograma")
const textoTrasvase = bloques.find((b) => b.id === "trasvase")?.trabajosRealizados ?? ""
assert.ok(!textoTrasvase.includes("Coordinación:"), "sin plan maestro genérico")
assert.ok(!textoTrasvase.includes("Acordar criterio"), "sin supuestos administrativos")
assert.ok(textoTrasvase.includes("Tramo «"), "trabajos por tramo")
assert.ok(!textoTrasvase.includes("Distribución desazolve"), "sin nota brazo largo/corto")
const textoSan = bloques.find((b) => b.id === "san_antonio")?.trabajosRealizados ?? ""
assert.ok(!textoSan.includes("Desazolve 100 % brazo largo"), "sin nota brazo san antonio")
assert.ok(bloques.some((b) => b.id === "san_antonio"))

const e27 = entradas.find((e) => e.fecha === "2026-10-27")
const e30 = entradas.find((e) => e.fecha === "2026-10-30")
assert.ok(e27 && e30, "entradas 27 y 30 oct")
const m3_27 =
  cronograma.find((d) => d.fecha === "2026-10-27")?.actividades.reduce((s, a) => s + a.m3Desazolve, 0) ?? 0
const m3_30 =
  cronograma.find((d) => d.fecha === "2026-10-30")?.actividades.reduce((s, a) => s + a.m3Desazolve, 0) ?? 0
assert.notEqual(Math.round(m3_27), Math.round(m3_30), "m³ trasvase distintos entre 27 y 30 oct")
const t27 = e27.formatoEpa!.bloquesFrente!.find((b) => b.id === "trasvase")!.trabajosRealizados
assert.ok(t27.includes("producción del día"), "texto programático")
assert.ok(t27.includes("PK "), "referencia PK")

const hitos = hitosSeverinoPorFechaPlanilla(periodo, 1)
assert.ok(hitos.size >= 7 && hitos.size <= 12, "Severino en hitos, no diario")
const diasConSeverino = entradas.filter((e) => e.formatoEpa?.bloqueSeverino)
assert.equal(diasConSeverino.length, hitos.size)
assert.ok(!entradas.every((e) => e.formatoEpa?.bloqueSeverino), "Severino no en todos los días")
assert.ok(
  diasConSeverino.some((e) => e.formatoEpa?.bloqueSeverino?.trabajosRealizados.includes("Rub. 9")),
  "hito con rub. 9"
)

const epa0 = dia1Entrada.formatoEpa!
assert.ok(epa0.clima.manana.length > 0 && epa0.clima.tarde.length > 0)
assert.ok(epa0.novedadesObservaciones.trim().length > 0)
const h0 = epa0.horasEquipos[0]
const h1 = epa0.horasEquipos[1]
assert.ok(h0 && h1)
assert.notEqual(h0.manana, h1.manana, "horas distintas por equipo")
assert.deepEqual(climaProgramaticoDia(periodo.fecha_inicio), climaProgramaticoDia(periodo.fecha_inicio))
assert.notEqual(
  horasEquipoProgramaticas(periodo.fecha_inicio, "A", 0).total,
  horasEquipoProgramaticas(periodo.fecha_inicio, "B", 1).total
)

console.log("test-libro-obra-cronograma: OK", {
  hojasConsolidadas: entradas.length,
  excTrasvaseDia1: excDia1,
  excSanDia1: excSan1,
  volquetasDia1: volqConsolidadaDia1,
  m3Dia1: Math.round(m3Dia1),
  viajesPorCamion: viajesVolquetaPorDiaUnaUnidad(),
  sumM3: Math.round(sumM3),
  objetivo: Math.round(objetivo),
  totalTramosVol: VOLUMEN_TOTAL_TRASVASE_M3,
})
