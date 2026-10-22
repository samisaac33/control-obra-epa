/**
 * npx tsx scripts/test-maquinaria-horas-consolidado.ts
 */
import assert from "node:assert/strict"

import type { CanalTramo } from "../src/data/tramos/types"
import {
  auditarHorasMaquinaria,
  totalHorasOperativasConsolidadas,
  totalHorasRegistrosCanonicosMapa,
} from "../src/lib/maquinaria-horas-consolidado"
import {
  filtrarJornadasMaquinariaParaConsolidado,
  type JornadaMaquinariaProyecto,
} from "../src/lib/maquinaria-desasolve-proyecto"
import { kpisMaquinariaDesasolve } from "../src/lib/maquinaria-desasolve-resumen"
import { minitramosDesdePuntos, type TramoPuntoAvance } from "../src/lib/tramo-geometria"

const tramo: CanalTramo = {
  id: "t1",
  proyecto_id: "p1",
  codigo: "19",
  canal: "Puntos levantados",
  longitud_m: 4410,
  metros_ejecutados: 4410,
  avance_pct: 100,
  estado: "terminado",
  geometria: {
    type: "LineString",
    coordinates: [
      [-80.5, -0.9],
      [-80.49, -0.895],
      [-80.48, -0.88],
    ],
  },
  origen_extremo: "geometria_inicio",
}

function punto(
  partial: Partial<TramoPuntoAvance> & Pick<TramoPuntoAvance, "id" | "rol" | "abscisa_m" | "lat" | "lng">
): TramoPuntoAvance {
  return {
    tramo_id: tramo.id,
    registro_foto_id: null,
    confirmado: true,
    created_at: "2026-01-02T00:00:00Z",
    estado_minitramo: "terminado",
    ...partial,
  }
}

const a = punto({ id: "a", rol: "a", abscisa_m: 0, lat: -0.9, lng: -80.5, created_at: "2026-01-01T00:00:00Z" })
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

const puntos = [a, b, c]
const minitramos = minitramosDesdePuntos(puntos, tramo.id, tramo)

function jornada(
  id: string,
  puntoFinId: string,
  horas: number,
  extra?: Partial<JornadaMaquinariaProyecto>
): JornadaMaquinariaProyecto {
  const mt = minitramos.find((m) => m.puntoFin.id === puntoFinId)
  return {
    id,
    tramo_id: tramo.id,
    tramo_codigo: tramo.codigo,
    tramo_canal: tramo.canal,
    fecha: "2026-01-05",
    metros_desasolados: mt?.longitud_m ?? 100,
    equipo: "Excavadora 1",
    equipo_id: "eq1",
    punto_avance_id: puntoFinId,
    duracion_horas: horas,
    observaciones: null,
    es_incidencia: false,
    created_at: "2026-01-05T12:00:00Z",
    updated_at: "2026-01-05T12:00:00Z",
    ...extra,
  }
}

const crudas: JornadaMaquinariaProyecto[] = [
  jornada("j-b", "b", 8),
  jornada("j-c", "c", 6),
  jornada("j-manual", "b", 10, {
    punto_avance_id: null,
    equipo: "Manual duplicado",
  }),
]

const consolidadas = filtrarJornadasMaquinariaParaConsolidado([tramo], puntos, crudas)

assert.equal(consolidadas.length, 2, "excluye jornada manual duplicada en tramo GPS")
assert.equal(totalHorasOperativasConsolidadas(consolidadas), 14)
assert.equal(
  totalHorasRegistrosCanonicosMapa([tramo], puntos, crudas),
  14,
  "horas mapa canónico = 8+6"
)

const audit = auditarHorasMaquinaria({
  tramos: [tramo],
  puntos,
  registrosCrudos: crudas,
  jornadasConsolidadas: consolidadas,
})

assert.equal(audit.coherente, true)
assert.equal(audit.horasExcluidasEnTramosConGps, 10)
assert.equal(audit.horasConsolidado, kpisMaquinariaDesasolve(consolidadas).totalHoras)

console.log("OK maquinaria-horas-consolidado")
