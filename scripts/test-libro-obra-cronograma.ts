/**
 * npx tsx scripts/test-libro-obra-cronograma.ts
 */
import assert from "node:assert/strict"

import { PORCENTAJE_AVANCE_LIBRO_OBRA_PLANILLA_1 } from "../src/data/contrato-emergencia-severino-trasvase"
import { presupuestoDesasolveEmergencia } from "../src/data/planilla/presupuesto-desasolve-emergencia"
import { valoresPorDefectoPlanilla } from "../src/data/planilla/planilla-defaults-ejecucion"
import { TRAMOS_DESAZOLVE_VAE, VOLUMEN_TOTAL_TRASVASE_M3 } from "../src/data/planilla/canales-desazolve-tramos-vae"
import {
  DESALOJO_M3_PLANILLA_1_TRASVASE,
  INTERVENCIONES_TRASVASE_PLANILLA_1,
  INTERVENCION_SAN_ANTONIO_PLANILLA_1,
  VOLUMEN_DESAZOLVE_SAN_ANTONIO_PLANILLA_1,
  VOLUMEN_DESAZOLVE_TRASVASE_PLANILLA_1,
} from "../src/data/planilla/libro-obra-resumen-canal-planilla-1"
import {
  JORNADA_OBRA_MAX_H,
  m3MaximoUnaExcavadoraJornada,
  m3MaximoUnaVolquetaJornada,
} from "../src/lib/libro-obra-capacidad-maquinaria"
import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import { periodoPorNumero } from "../src/lib/planilla-calculo"
import {
  cronogramaLibroObraFrente,
  volquetasFlotaDesalojoTrasvaseDia,
  volquetasFlotaParaM3Desalojo,
  viajesVolquetaPorDiaUnaUnidad,
} from "../src/lib/libro-obra-cronograma-frente"
import { consolidarLibroObraPeriodoPlanillaConsolidado } from "../src/lib/libro-obra-sintetico"
import {
  FECHAS_SAN_ANTONIO_UNA_EXCAVADORA,
  TRAMOS_TRASVASE_PARALELOS_POR_DIA,
} from "../src/lib/libro-obra-cronograma-resumen-canal-p1"
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
  porcentaje_avance_planilla_1: PORCENTAJE_AVANCE_LIBRO_OBRA_PLANILLA_1,
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
const objetivo = VOLUMEN_DESAZOLVE_TRASVASE_PLANILLA_1
assert.ok(Math.abs(sumM3 - objetivo) < 0.1, "suma m³ trasvase = resumen canal (2) P1")

const sumDesalojo = cronograma.reduce(
  (s, d) => s + d.actividades.reduce((t, a) => t + a.m3Desalojo, 0),
  0
)
assert.ok(Math.abs(sumDesalojo - DESALOJO_M3_PLANILLA_1_TRASVASE) < 0.1, "desalojo trasvase P1 = 40.000 m³")

const intervencionPorId = new Map(
  [...INTERVENCIONES_TRASVASE_PLANILLA_1, INTERVENCION_SAN_ANTONIO_PLANILLA_1].map((i) => [
    `resumen-canal-map-${i.mapa}`,
    i,
  ])
)

const capM3Volqueta = m3MaximoUnaVolquetaJornada()
assert.ok(capM3Volqueta >= 80 && capM3Volqueta <= 200, "capacidad volqueta jornada creíble (botadero 5 km)")

for (const d of cronograma) {
  const desDia = d.actividades.reduce((s, a) => s + a.m3Desalojo, 0)
  const volqDia = d.actividades.reduce((s, a) => s + a.volquetas, 0)
  const excDia = d.actividades.reduce((s, a) => s + (a.excavadorasEnFrente ?? 1), 0)
  if (desDia > 0) {
    assert.ok(volqDia >= excDia, `≥1 volqueta por excavadora ${d.fecha}`)
    assert.ok(
      volqDia >= volquetasFlotaParaM3Desalojo(desDia),
      `volquetas día ${d.fecha} ≥ flota desalojo por m³`
    )
    assert.ok(
      volqDia >= volquetasFlotaDesalojoTrasvaseDia(desDia, excDia),
      `flota día ${d.fecha} ≥ max(m³, excavadoras)`
    )
  }
  for (const a of d.actividades) {
    const inter = intervencionPorId.get(a.tramoId)
    assert.ok(inter, `intervención ${a.tramoId}`)
    const capUnaExc = m3MaximoUnaExcavadoraJornada(inter!, JORNADA_OBRA_MAX_H)
    const exc = a.excavadorasEnFrente ?? 1
    assert.ok(
      a.m3Desazolve <= exc * capUnaExc + 0.2,
      `m³ credibles ${d.fecha} (${a.m3Desazolve} ≤ ${exc}×${capUnaExc})`
    )
    if (a.m3Desazolve > capUnaExc + 50) {
      assert.ok(exc > 1, `más de 1 excavadora si m³ alto en ${d.fecha}`)
    }
    if (a.m3Desalojo > 0) {
      assert.ok(a.volquetas >= exc, `volquetas ≥ excavadoras en línea ${d.fecha} ${a.tramoId}`)
      assert.ok(
        a.m3Desalojo <= a.volquetas * capM3Volqueta + 1,
        `m³ desalojo ≤ capacidad volquetas línea ${d.fecha}`
      )
    }
  }
}

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
const excTrasvaseDia1 = dia1.actividades.reduce((s, a) => s + (a.excavadorasEnFrente ?? 1), 0)
const volqTrasvaseDia1 = dia1.actividades.reduce((s, a) => s + a.volquetas, 0)
const viajesVol = viajesVolquetaPorDiaUnaUnidad()
assert.ok(viajesVol >= 10 && viajesVol <= 25, "viajes/volqueta coherentes con ida–vuelta 10 km")
assert.ok(excTrasvaseDia1 >= 1, "al menos una excavadora trasvase día 1")
assert.ok(
  volqTrasvaseDia1 >= volquetasFlotaDesalojoTrasvaseDia(m3Dia1, excTrasvaseDia1),
  "volquetas día 1 ≥ max(m³ agregado, excavadoras)"
)
assert.ok(
  (dia1.actividades[0]?.tramoNombre ?? "").includes("EL MANGO"),
  "día 1 = primera intervención resumen canal"
)

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
const sumSan = cronSan.reduce(
  (s, d) => s + d.actividades.reduce((t, a) => t + a.m3Desazolve, 0),
  0
)
assert.ok(Math.abs(sumSan - VOLUMEN_DESAZOLVE_SAN_ANTONIO_PLANILLA_1) < 0.1, "desazolve SA = resumen canal")
assert.equal(
  cronSan.reduce((s, d) => s + d.actividades.reduce((t, a) => t + a.m3Desalojo, 0), 0),
  0,
  "SA sin desalojo P1"
)

const diasSanConActividad = cronSan.filter((d) => d.actividades.length > 0)
let sanDiasDosExc = 0
let sanDiasUnaExc = 0
for (const d of diasSanConActividad) {
  const exc = d.actividades[0]?.excavadorasEnFrente ?? 1
  if (exc === 2) sanDiasDosExc++
  else if (exc === 1) sanDiasUnaExc++
  assert.ok(
    exc === (FECHAS_SAN_ANTONIO_UNA_EXCAVADORA.has(d.fecha) ? 1 : 2),
    `excavadoras SA ${d.fecha}`
  )
}
assert.equal(sanDiasUnaExc, FECHAS_SAN_ANTONIO_UNA_EXCAVADORA.size, "solo 3 días SA con 1 excavadora")
assert.equal(sanDiasDosExc, diasSanConActividad.length - sanDiasUnaExc, "resto días SA con 2 excavadoras")

const trasvaseActsPorDia = diasConActividad.map((d) => d.actividades.length)
assert.ok(Math.min(...trasvaseActsPorDia) >= TRAMOS_TRASVASE_PARALELOS_POR_DIA - 1)
assert.ok(Math.max(...trasvaseActsPorDia) <= TRAMOS_TRASVASE_PARALELOS_POR_DIA)

const excSanDia1 =
  cronSan[0]?.actividades.reduce((s, a) => s + (a.excavadorasEnFrente ?? 1), 0) ?? 0
const volqSanDia1 = cronSan[0]?.actividades.reduce((s, a) => s + a.volquetas, 0) ?? 0
const volqConsolidadaDia1 = volqTrasvaseDia1 + volqSanDia1

assert.ok(entradas.length > 0)
const dia1Entrada = entradas[0]!
assert.equal(
  dia1Entrada.formatoEpa!.equiposUtilizados.find((e) => e.etiqueta === "VOLQUETAS")?.cantidad,
  volqConsolidadaDia1
)
assert.equal(
  dia1Entrada.formatoEpa!.equiposUtilizados.find((e) => e.etiqueta === "EXCAVADORAS")?.cantidad,
  excTrasvaseDia1 + excSanDia1
)
assert.equal(
  dia1Entrada.formatoEpa!.personalUtilizado.find((e) => e.etiqueta === "OPERADORES")?.cantidad,
  excTrasvaseDia1 + excSanDia1
)

const bloques = dia1Entrada.formatoEpa!.bloquesFrente ?? []
assert.ok(bloques.length >= 2, "trasvase + san antonio el mismo día cuando ambos tienen cronograma")
const textoTrasvase = bloques.find((b) => b.id === "trasvase")?.trabajosRealizados ?? ""
assert.ok(!textoTrasvase.includes("Coordinación:"), "sin plan maestro genérico")
assert.ok(!textoTrasvase.includes("Acordar criterio"), "sin supuestos administrativos")
assert.ok(textoTrasvase.includes("Tramo «"), "trabajos por tramo")
assert.ok(!/\(1 excavadora\):.*\d{4,}/.test(textoTrasvase), "sin 1 excavadora con miles m³")
assert.ok(!textoTrasvase.includes("Distribución desazolve"), "sin nota brazo largo/corto")
assert.ok(!textoTrasvase.includes("Mediciones VAE"), "sin pie de rubros VAE")
const textoSan = bloques.find((b) => b.id === "san_antonio")?.trabajosRealizados ?? ""
assert.ok(!textoSan.includes("Desazolve 100 % brazo largo"), "sin nota brazo san antonio")
assert.ok(!textoSan.includes("Mediciones VAE"), "sin pie de rubros VAE san antonio")
assert.ok(bloques.some((b) => b.id === "san_antonio"))

function contarLineasTramoConsolidada(entrada: (typeof entradas)[0]): number {
  return (entrada.formatoEpa?.bloquesFrente ?? []).reduce(
    (n, b) => n + (b.trabajosRealizados.match(/- Tramo «/g)?.length ?? 0),
    0
  )
}
for (const entrada of entradas) {
  const nTramos = contarLineasTramoConsolidada(entrada)
  assert.ok(nTramos >= 4 && nTramos <= 6, `4–6 tramos/día consolidado (${entrada.fecha}: ${nTramos})`)
}

const e27 = entradas.find((e) => e.fecha === "2026-10-27")
const e30 = entradas.find((e) => e.fecha === "2026-10-30")
assert.ok(e27 && e30, "entradas 27 y 30 oct")
const volumenesDia = cronograma.map((d) =>
  Math.round(d.actividades.reduce((s, a) => s + a.m3Desazolve, 0))
)
assert.ok(new Set(volumenesDia.filter((v) => v > 0)).size >= 1, "producción trasvase por día")
const excDistintas = new Set(
  cronograma.flatMap((d) => d.actividades.map((a) => a.excavadorasEnFrente ?? 1))
)
assert.ok(excDistintas.size >= 2, "variedad de flota excavadoras en el período")
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
  excTrasvaseDia1: excTrasvaseDia1,
  excSanDia1: excSanDia1,
  volquetasDia1: volqConsolidadaDia1,
  m3Dia1: Math.round(m3Dia1),
  viajesPorCamion: viajesVolquetaPorDiaUnaUnidad(),
  sumM3: Math.round(sumM3),
  objetivo: Math.round(objetivo),
  totalTramosVol: VOLUMEN_TOTAL_TRASVASE_M3,
})
