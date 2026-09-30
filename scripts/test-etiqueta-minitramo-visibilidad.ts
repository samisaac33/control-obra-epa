import {
  etiquetaMinitramoCabeEnSegmento,
} from "../src/lib/mapa-etiqueta-longitud-visibilidad"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(etiquetaMinitramoCabeEnSegmento(44, 100), "44px cabe en 100px (50%)")
assert(!etiquetaMinitramoCabeEnSegmento(44, 80), "44px no cabe en 80px")
assert(etiquetaMinitramoCabeEnSegmento(58, 120), "58px cabe en 120px")
assert(!etiquetaMinitramoCabeEnSegmento(58, 100), "58px no cabe en 100px")

console.log("test-etiqueta-minitramo-visibilidad: OK")
