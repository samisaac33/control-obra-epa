import assert from "node:assert/strict"

import type { GeoJsonPolygon } from "../src/data/tramos/types"
import { areaPoligonoM2, centroidePoligono } from "../src/lib/geojson-poligono"

const cuadrado: GeoJsonPolygon = {
  type: "Polygon",
  coordinates: [
    [
      [-80.45, -1.05],
      [-80.449, -1.05],
      [-80.449, -1.049],
      [-80.45, -1.049],
      [-80.45, -1.05],
    ],
  ],
}

const centro = centroidePoligono(cuadrado)
assert.ok(Math.abs(centro.lat - -1.0495) < 0.001)
assert.ok(Math.abs(centro.lng - -80.4495) < 0.001)

const area = areaPoligonoM2(cuadrado)
assert.ok(area > 8_000 && area < 15_000, `área ~100m x 100m, obtuvo ${area}`)

console.log("test-geojson-poligono: ok")
