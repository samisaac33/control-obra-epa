import assert from "node:assert/strict"

import {
  detectarIntencionFechaConsulta,
  fechaCalendarioEcuador,
} from "../src/lib/mapa-asistente-fechas"
import {
  detalleJornadasDia,
  formatearDetalleJornadasDia,
} from "../src/lib/maquinaria-desasolve-resumen"
import type { JornadaMaquinariaProyecto } from "../src/lib/maquinaria-desasolve-proyecto"

const ahora = new Date("2026-10-19T15:00:00.000Z")

assert.equal(fechaCalendarioEcuador(ahora, -1), "2026-10-18")
assert.equal(fechaCalendarioEcuador(ahora, 0), "2026-10-19")

const intAyer = detectarIntencionFechaConsulta(
  "¿cuántas máquinas y cuántas horas trabajaron ayer?",
  ahora
)
assert.deepEqual(intAyer, { tipo: "dia", fechas: ["2026-10-18"] })

const intHoy = detectarIntencionFechaConsulta("registro de hoy", ahora)
assert.deepEqual(intHoy, { tipo: "dia", fechas: ["2026-10-19"] })

const intIso = detectarIntencionFechaConsulta("datos del 2026-10-10", ahora)
assert.deepEqual(intIso, { tipo: "dia", fechas: ["2026-10-10"] })

const jornadas: JornadaMaquinariaProyecto[] = [
  {
    id: "j1",
    tramo_id: "t1",
    fecha: "2026-10-18",
    metros_desasolados: 120,
    equipo: "Excavador A",
    equipo_id: "e1",
    punto_avance_id: null,
    duracion_horas: 6,
    observaciones: null,
    es_incidencia: false,
    created_at: "2026-10-18T20:00:00.000Z",
    updated_at: "2026-10-18T20:00:00.000Z",
    tramo_codigo: "5",
    tramo_canal: "Canal prueba",
  },
  {
    id: "j2",
    tramo_id: "t2",
    fecha: "2026-10-18",
    metros_desasolados: 80,
    equipo: "Excavador B",
    equipo_id: "e2",
    punto_avance_id: null,
    duracion_horas: 4.5,
    observaciones: "Material húmedo",
    es_incidencia: false,
    created_at: "2026-10-18T21:00:00.000Z",
    updated_at: "2026-10-18T21:00:00.000Z",
    tramo_codigo: "8",
    tramo_canal: "Canal secundario",
  },
]

const detalle = detalleJornadasDia("2026-10-18", jornadas, [
  { id: "e1", proyecto_id: "desasolve-canales", nombre: "Excavador A", activo: true, created_at: "" },
  { id: "e2", proyecto_id: "desasolve-canales", nombre: "Excavador B", activo: true, created_at: "" },
])

assert.equal(detalle.equiposDistintos, 2)
assert.equal(detalle.totalHoras, 10.5)
assert.equal(detalle.porTramo.length, 2)

const texto = formatearDetalleJornadasDia(detalle)
assert.match(texto, /Equipos distintos \(jornadas operativas\): 2/)
assert.match(texto, /Total horas registradas: 10,5 h/)
assert.match(texto, /tramo 5/)
assert.match(texto, /tramo 8/)

console.log("OK mapa-asistente-contexto")
