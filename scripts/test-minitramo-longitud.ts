/**
 * Verificación manual: npx tsx scripts/test-minitramo-longitud.ts
 */
import type { CanalTramo, GeoJsonLineString } from "../src/data/tramos/types"
import {
  longitudMinitramoMetros,
  metrosMinitramosTerminadosTramo,
  minitramosDesdePuntos,
  type TramoPuntoAvance,
} from "../src/lib/tramo-geometria"

function punto(partial: Partial<TramoPuntoAvance> & Pick<TramoPuntoAvance, "id" | "rol" | "abscisa_m" | "lat" | "lng">): TramoPuntoAvance {
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
    [-80.49, -0.89],
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

const a = punto({ id: "a", rol: "a", abscisa_m: 0, lat: -0.9, lng: -80.5 })
const b = punto({
  id: "b",
  rol: "b",
  abscisa_m: 1030,
  lat: -0.895,
  lng: -80.495,
  punto_enlace_id: "a",
})
const c = punto({
  id: "c",
  rol: "c",
  abscisa_m: 3130,
  lat: -0.89,
  lng: -0.49,
  punto_enlace_id: "b",
})
const d = punto({
  id: "d",
  rol: "d",
  abscisa_m: 2220,
  lat: -0.889,
  lng: -80.489,
  punto_enlace_id: "c",
})

const puntos = [a, b, c, d]
const minitramos = minitramosDesdePuntos(puntos, tramo.id, tramo)
const bc = minitramos.find((m) => m.letraFin === "c")
const cd = minitramos.find((m) => m.letraFin === "d")

if (!bc || !cd) {
  console.error("FAIL: faltan minitramos B-C o C-D")
  process.exit(1)
}

const longitudGpsCd = longitudMinitramoMetros(tramo, cd.puntoInicio, cd.puntoFin)
const totalTerminado = metrosMinitramosTerminadosTramo(tramo, puntos)

const cdOk = longitudGpsCd < 500 && cd.longitud_m < 500
const totalOk = totalTerminado < 3500 && totalTerminado > 1500

console.log("B-C longitud_m:", bc.longitud_m.toFixed(1))
console.log("C-D longitud_m:", cd.longitud_m.toFixed(1), "(esperado ~120 m GPS, no ~2220)")
console.log("Total terminado m:", totalTerminado.toFixed(1), "(esperado ~2220, no ~4320)")

if (!cdOk || !totalOk) {
  console.error("FAIL")
  process.exit(1)
}
console.log("OK")
