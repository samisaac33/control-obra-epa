import { generateText, Output } from "ai"
import { z } from "zod"

import {
  type CoordenadasMapaAplicables,
  type CoordenadasUtm,
  normalizarEntradaCoordenadas,
  utmToWgs84,
} from "@/src/lib/mapa-coordenadas-gps"

const MAPA_ASISTENTE_VISION_MODEL =
  process.env.MAPA_ASISTENTE_VISION_MODEL?.trim() || "google/gemini-2.5-flash"

const extraccionSchema = z.object({
  formato: z.enum(["utm", "latlng", "ninguno"]),
  zona_utm: z.number().int().min(1).max(60).nullable(),
  hemisferio_utm: z.enum(["N", "S"]).nullable(),
  easting: z.number().nullable(),
  northing: z.number().nullable(),
  latitud: z.number().nullable(),
  longitud: z.number().nullable(),
  precision_m: z.number().positive().nullable(),
  notas: z.string().nullable(),
})

export type ExtraccionCoordenadasImagen = z.infer<typeof extraccionSchema>

export async function extraerCoordenadasDesdeImagen(
  imageBase64: string,
  mediaType: string
): Promise<{
  extraccion: ExtraccionCoordenadasImagen
  coords: CoordenadasMapaAplicables | null
  error?: string
}> {
  const { output } = await generateText({
    model: MAPA_ASISTENTE_VISION_MODEL,
    output: Output.object({ schema: extraccionSchema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analiza esta captura de una app GPS/brújula en campo (Ecuador, proyecto de desasolve de canales).
Extrae coordenadas UTM (zona, hemisferio N/S, easting, northing) o latitud/longitud decimal si aparecen.
Extrae la precisión en metros si se muestra (±N m).
Si no hay coordenadas legibles, usa formato "ninguno".`,
          },
          {
            type: "image",
            image: imageBase64,
            mediaType,
          },
        ],
      },
    ],
  })

  const extraccion = output
  if (extraccion.formato === "ninguno") {
    return {
      extraccion,
      coords: null,
      error: "No se detectaron coordenadas legibles en la imagen.",
    }
  }

  if (extraccion.formato === "latlng") {
    if (extraccion.latitud == null || extraccion.longitud == null) {
      return {
        extraccion,
        coords: null,
        error: "La imagen sugiere lat/lng pero faltan valores numéricos.",
      }
    }
    return {
      extraccion,
      coords: {
        lat: extraccion.latitud,
        lng: extraccion.longitud,
        precision_m: extraccion.precision_m ?? 10,
        fuente: "imagen",
      },
    }
  }

  if (
    extraccion.zona_utm == null ||
    extraccion.easting == null ||
    extraccion.northing == null
  ) {
    return {
      extraccion,
      coords: null,
      error: "UTM incompleta en la imagen (zona, easting o northing).",
    }
  }

  const utm: CoordenadasUtm = {
    zona: extraccion.zona_utm,
    hemisferio: extraccion.hemisferio_utm ?? "S",
    easting: extraccion.easting,
    northing: extraccion.northing,
  }

  try {
    const { lat, lng } = utmToWgs84(utm)
    return {
      extraccion,
      coords: {
        lat,
        lng,
        precision_m: extraccion.precision_m ?? 10,
        fuente: "imagen",
        utm,
      },
    }
  } catch (err) {
    return {
      extraccion,
      coords: null,
      error: err instanceof Error ? err.message : "Conversión UTM fallida.",
    }
  }
}

export function coordsDesdeTextoUsuario(texto: string): CoordenadasMapaAplicables | null {
  const result = normalizarEntradaCoordenadas(texto, { fuente: "texto" })
  return result.ok ? result.coords : null
}
