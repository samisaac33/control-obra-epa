/**
 * Verificación manual: npx tsx scripts/test-minitramo-longitud.ts
 */
import type { CanalTramo, GeoJsonLineString } from "../src/data/tramos/types"
import {
  geometriaMinitramoEntrePuntos,
  longitudMinitramoMetros,
  metrosMinitramosTerminadosTramo,
  minitramosDesdePuntos,
  puntosOrdenadosPorAbscisaLogica,
  type TramoPuntoAvance,
} from "../src/lib/tramo-geometria"

function punto(
  partial: Partial<TramoPuntoAvance> & Pick<TramoPuntoAvance, "id" | "rol" | "abscisa_m" | "lat" | "lng">
): TramoPuntoAvance {
  return {
    tramo_id: "t1",
    registro_foto_id: null,
    confirmado: true,
    created_at: "2026-01-01T00:00:00Z",
    estado_minitramo: "terminado",
    ...partial,
  }
}

const geometria: GeoJsonLineString = {
  type: "LineString",
  coordinates: [
    [-80.5, -0.9],
    [-80.49, -0.895],
    [-80.48, -0.88],
  ],
}

const tramo: CanalTramo = {
  id: "t1",
  proyecto_id: "p1",
  codigo: "24",
  canal: "test",
  longitud_m: 9810,
  metros_ejecutados: 0,
  avance_pct: 0,
  estado: "en_ejecucion",
  geometria,
  origen_extremo: "geometria_inicio",
}

/** Cronológico A,B,C,D pero D cerca de B (rama antigua con enlace C). */
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
const cadena = puntosOrdenadosPorAbscisaLogica(tramo, puntos, tramo.id)
const minitramos = minitramosDesdePuntos(puntos, tramo.id, tramo)

if (cadena.map((p) => p.id).join(",") !== "a,b,d,c") {
  console.error("FAIL: cadena esperada a,b,d,c obtuvo", cadena.map((p) => p.id).join(","))
  process.exit(1)
}

if (minitramos.length !== 3) {
  console.error("FAIL: se esperaban 3 minitramos consecutivos, hay", minitramos.length)
  process.exit(1)
}

const cd = minitramos.find((m) => m.puntoFin.id === "c")
if (!cd || cd.puntoInicio.id !== "d") {
  console.error("FAIL: minitramo hacia C debe ser d→c en cadena por abscisa")
  process.exit(1)
}

const geomDc = geometriaMinitramoEntrePuntos(tramo, cd.puntoInicio, cd.puntoFin)
if (!geomDc || geomDc.coordinates.length < 2) {
  console.error("FAIL: geometría d-c vacía")
  process.exit(1)
}

const totalTerminado = metrosMinitramosTerminadosTramo(tramo, puntos)
const sumSegmentos = minitramos.reduce((s, m) => s + m.longitud_m, 0)

console.log(
  "Minitramos:",
  minitramos.map((m) => `${m.letraInicio}-${m.letraFin}:${m.longitud_m.toFixed(0)}m`).join(", ")
)
console.log("Total terminado m:", totalTerminado.toFixed(1), "suma segmentos:", sumSegmentos.toFixed(1))

if (Math.abs(totalTerminado - sumSegmentos) > 1) {
  console.error("FAIL: total terminado != suma segmentos")
  process.exit(1)
}

if (totalTerminado > 4500) {
  console.error("FAIL: avance inflado (>4500m)")
  process.exit(1)
}

console.log("OK")
