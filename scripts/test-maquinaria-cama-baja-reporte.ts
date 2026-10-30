import assert from "node:assert/strict"

import type { MovimientoCamaBaja } from "@/src/lib/maquinaria-cama-baja-movimientos"
import {
  combinarResumenPorEquipoDesasolve,
  esClaveResumenCamaBaja,
  kpisMaquinariaDesasolveConCamaBaja,
  resumenCamaBajaPorUnidad,
} from "@/src/lib/maquinaria-desasolve-cama-baja-reporte"
import { kpisMaquinariaDesasolve } from "@/src/lib/maquinaria-desasolve-resumen"

const movimientoBase = (partial: Partial<MovimientoCamaBaja>): MovimientoCamaBaja => ({
  id: partial.id ?? "1",
  proyecto_id: "desasolve-canales",
  fecha: partial.fecha ?? "2026-06-01",
  cama_baja: partial.cama_baja ?? "Plataforma X",
  maquina_transportada: partial.maquina_transportada ?? "Excavadora",
  maquina_equipo_id: null,
  origen: null,
  destino: null,
  duracion_horas: partial.duracion_horas ?? 4,
  observaciones: null,
  created_at: "2026-06-01T12:00:00Z",
  updated_at: "2026-06-01T12:00:00Z",
})

const movs = [
  movimientoBase({ id: "a", cama_baja: "ABC-111", duracion_horas: 3 }),
  movimientoBase({ id: "b", cama_baja: "ABC-111", duracion_horas: 2 }),
  movimientoBase({ id: "c", cama_baja: "DEF-222", duracion_horas: 5 }),
]

const resumen = resumenCamaBajaPorUnidad(movs)
assert.equal(resumen.length, 2)
assert.ok(esClaveResumenCamaBaja(resumen[0]!.clave))
assert.equal(resumen.find((r) => r.nombreEquipo.includes("ABC-111"))?.horas, 5)

const baseKpis = kpisMaquinariaDesasolve([])
const merged = kpisMaquinariaDesasolveConCamaBaja(baseKpis, movs, [])
assert.equal(merged.totalHoras, 10)
assert.equal(merged.diasConActividad, 1)

const combinado = combinarResumenPorEquipoDesasolve([], movs)
assert.equal(combinado.length, 2)

console.log("test-maquinaria-cama-baja-reporte: OK")
