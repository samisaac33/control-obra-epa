import assert from "node:assert/strict"

import type { RegistroMaquinariaComplementaria } from "@/src/lib/maquinaria-complementaria"
import {
  combinarResumenPorEquipoConComplementaria,
  esClaveResumenComplementaria,
  kpisMaquinariaDesasolveConComplementaria,
  registrosComplementariosEnFecha,
  resumenComplementariaPorEquipo,
} from "@/src/lib/maquinaria-desasolve-complementaria-reporte"
import { kpisMaquinariaDesasolveConCamaBaja } from "@/src/lib/maquinaria-desasolve-cama-baja-reporte"
import { kpisMaquinariaDesasolve } from "@/src/lib/maquinaria-desasolve-resumen"

const registroBase = (
  partial: Partial<RegistroMaquinariaComplementaria>
): RegistroMaquinariaComplementaria => ({
  id: partial.id ?? "1",
  proyecto_id: "desasolve-canales",
  fecha: partial.fecha ?? "2026-09-29",
  equipo: partial.equipo ?? "Motoniveladora",
  equipo_id: null,
  duracion_horas: partial.duracion_horas ?? 7,
  descripcion_trabajo: partial.descripcion_trabajo ?? "Trabajo complementario",
  ubicacion_referencia: partial.ubicacion_referencia ?? "Portoviejo",
  observaciones: null,
  created_at: "2026-09-29T12:00:00Z",
  updated_at: "2026-09-29T12:00:00Z",
})

const registros = [
  registroBase({ id: "a", equipo: "Excavadora brazo corto", duracion_horas: 6, fecha: "2026-09-24" }),
  registroBase({ id: "b", equipo: "Excavadora brazo corto", duracion_horas: 6, fecha: "2026-09-25" }),
  registroBase({ id: "c", equipo: "Motoniveladora", duracion_horas: 7, fecha: "2026-09-29" }),
]

const resumen = resumenComplementariaPorEquipo(registros)
assert.equal(resumen.length, 2)
assert.ok(esClaveResumenComplementaria(resumen[0]!.clave))

const delDia = registrosComplementariosEnFecha(registros, "2026-09-24")
assert.equal(delDia.length, 1)

const baseKpis = kpisMaquinariaDesasolveConCamaBaja(kpisMaquinariaDesasolve([]), [], [])
const merged = kpisMaquinariaDesasolveConComplementaria(baseKpis, registros, [])
assert.equal(merged.totalHoras, 19)
assert.equal(merged.diasConActividad, 3)

const porEquipo = combinarResumenPorEquipoConComplementaria([], registros)
assert.equal(porEquipo.length, 2)

console.log("test-maquinaria-complementaria-reporte: ok")
