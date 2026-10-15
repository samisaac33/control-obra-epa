import assert from "node:assert/strict"

import { parseUtmDesdeTexto, utmToWgs84 } from "../src/lib/mapa-coordenadas-gps"

const texto =
  "Zona 17 M · 552,453E · 9,907,113N · precisión ±8 m"
const utm = parseUtmDesdeTexto(texto)
assert.ok(utm, "debe parsear UTM desde texto de ejemplo")
assert.equal(utm!.zona, 17)
assert.equal(utm!.easting, 552453)
assert.equal(utm!.northing, 9907113)

const { lat, lng } = utmToWgs84(utm!)
assert.ok(lat > -2 && lat < 0, `latitud esperada cerca de Manabí, obtuvo ${lat}`)
assert.ok(lng < -79 && lng > -81, `longitud esperada cerca de Manabí, obtuvo ${lng}`)

console.log("OK UTM ejemplo:", { lat, lng })
