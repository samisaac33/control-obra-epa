import type { ConexionPropuestaDef } from "@/src/lib/mapa-tramos-topologia"

/**
 * Enlaces priorizados según revisión de campo / KMZ (Rocafuerte, California, San Eloy).
 * Distancias validadas sobre desasolve-canales.kmz (sep 2025).
 */
export const CONEXIONES_PROPUESTAS_DESASOLVE: ConexionPropuestaDef[] = [
  {
    tramoNumeroA: "3",
    tramoNumeroB: "5",
    prioridad: "alta",
    nota: "Rocafuerte norte: continuidad 3→5 (~631 m). Referencia imagen taller EPA.",
  },
  {
    tramoNumeroA: "3",
    tramoNumeroB: "4",
    prioridad: "alta",
    nota: "Ramal Sosote Adentro (4) desconectado del eje 1-2-3 (~463 m).",
  },
  {
    tramoNumeroA: "4",
    tramoNumeroB: "5",
    prioridad: "media",
    nota: "Alternativa de cierre entre Tabacales / Puerto Loor y eje 5 (~444 m).",
  },
  {
    tramoNumeroA: "13",
    tramoNumeroB: "21",
    prioridad: "alta",
    nota: "La California ↔ red San Eloy: continuidad hidráulica propuesta (~1,9 km).",
  },
  {
    tramoNumeroA: "14",
    tramoNumeroB: "9",
    prioridad: "alta",
    nota: "El Guabital / Río Bachillero: cierre entre 14 y 9 (~335 m).",
  },
  {
    tramoNumeroA: "8",
    tramoNumeroB: "9",
    prioridad: "media",
    nota: "Ramal noreste hacia Bachillero (~288 m).",
  },
  {
    tramoNumeroA: "21",
    tramoNumeroB: "9",
    prioridad: "media",
    nota: "San Eloy ↔ sector Bachillero (~1,3 km) — validar con recorrido EPA.",
  },
]
