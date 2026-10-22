/**
 * Verificación: totales maquinaria por tramo no superan avance GPS del mapa.
 * npx tsx scripts/test-maquinaria-alineacion-mapa.ts
 */
import assert from "node:assert/strict"

import type { CanalTramo, GeoJsonLineString } from "../src/data/tramos/types"
import {
  filtrarJornadasMaquinariaParaConsolidado,
  type JornadaMaquinariaProyecto,
} from "../src/lib/maquinaria-desasolve-proyecto"
import { resumenPorTramoDesasolveAlineadoMapa } from "../src/lib/maquinaria-desasolve-resumen"
import {
  metrosMinitramosTerminadosTramo,
  minitramosDesdePuntos,
  type TramoPuntoAvance,
} from "../src/lib/tramo-geometria"

const geometria: GeoJsonLineString = {
  type: "LineString",
  coordinates: [
    [-80.5, -0.9],
    [-80.49, -0.895],
    [-80.48, -0.88],
  ],
}

const tramo: CanalTramo = {
  id: "t19",
  proyecto_id: "p1",
  codigo: "19",
  canal: "Puntos levantados",
  longitud_m: 4410,
  metros_ejecutados: 4410,
  avance_pct: 100,
  estado: "terminado",
  geometria,
  origen_extremo: "geometria_inicio",
}

function punto(
  partial: Partial<TramoPuntoAvance> & Pick<TramoPuntoAvance, "id" | "rol" | "abscisa_m" | "lat" | "lng">
): TramoPuntoAvance {
  return {
    tramo_id: tramo.id,
    registro_foto_id: null,
    confirmado: true,
    created_at: "2026-01-01T00:00:00Z",
    estado_minitramo: "terminado",
    ...partial,
  }
}

/** Cadena A→B→D→C: dos tramos solapados + tramo C; suma cruda > longitud tramo. */
const a = punto({ id: "a", rol: "a", abscisa_m: 0, lat: -0.9, lng: -80.5 })
const b = punto({
  id: "b",
  rol: "b",
  abscisa_m: 1030,
  lat: -0.895,
  lng: -80.49,
  created_at: "2026-01-02T00:00:00Z",
  punto_enlace_id: "a",
})
const c = punto({
  id: "c",
  rol: "c",
  abscisa_m: 3130,
  lat: -0.88,
  lng: -80.48,
  created_at: "2026-01-03T00:00:00Z",
  punto_enlace_id: "b",
})
const d = punto({
  id: "d",
  rol: "d",
  abscisa_m: 2220,
  lat: -0.895,
  lng: -80.49,
  created_at: "2026-01-04T00:00:00Z",
  punto_enlace_id: "c",
})

const puntos = [a, b, c, d]
const minitramos = minitramosDesdePuntos(puntos, tramo.id, tramo)
const avanceMapa = metrosMinitramosTerminadosTramo(tramo, puntos)
const sumaCrudaMinitramos = minitramos.reduce((s, m) => s + m.longitud_m, 0)

assert.ok(sumaCrudaMinitramos > tramo.longitud_m, "fixture: solape debe inflar suma cruda")
assert.equal(avanceMapa, tramo.longitud_m, "mapa capa al largo del tramo")

function jornada(
  partial: Pick<JornadaMaquinariaProyecto, "id" | "metros_desasolados"> &
    Partial<JornadaMaquinariaProyecto> & { punto_avance_id: string }
): JornadaMaquinariaProyecto {
  return {
    tramo_id: tramo.id,
    tramo_codigo: tramo.codigo,
    tramo_canal: tramo.canal,
    fecha: "2026-01-05",
    equipo: "Excavadora",
    equipo_id: null,
    duracion_horas: 8,
    observaciones: null,
    es_incidencia: false,
    created_at: "2026-01-05T12:00:00Z",
    updated_at: "2026-01-05T12:00:00Z",
    ...partial,
  }
}

const jornadasSinFiltrar: JornadaMaquinariaProyecto[] = minitramos.map((mt, i) =>
  jornada({
    id: `j-${i}`,
    punto_avance_id: mt.puntoFin.id,
    metros_desasolados: mt.longitud_m,
  })
)

// Jornada manual duplicada (sin GPS) en tramo con puntos — debe excluirse del consolidado.
jornadasSinFiltrar.push({
  ...jornada({
    id: "j-manual-base",
    punto_avance_id: minitramos[0]!.puntoFin.id,
    metros_desasolados: minitramos[0]!.longitud_m,
  }),
  id: "j-manual-duplicada",
  punto_avance_id: null,
  metros_desasolados: 500,
  equipo: "Manual",
})

const jornadas = filtrarJornadasMaquinariaParaConsolidado([tramo], puntos, jornadasSinFiltrar)
assert.equal(
  jornadas.some((j) => j.id === "j-manual-duplicada"),
  false,
  "excluye jornada manual en tramo con GPS"
)

const resumen = resumenPorTramoDesasolveAlineadoMapa(jornadas, [tramo], puntos)
assert.equal(resumen.length, 1)
assert.equal(resumen[0]!.metros, avanceMapa, "maquinaria alineada con mapa (4.41 km)")

console.log("OK maquinaria-alineacion-mapa")
