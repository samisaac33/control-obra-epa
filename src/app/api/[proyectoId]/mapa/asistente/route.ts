import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai"

import { getProyecto } from "@/src/data/proyectos/catalog"
import { autorizarMapaAsistente } from "@/src/lib/mapa-asistente-auth"
import {
  coordsDesdeTextoUsuario,
  extraerCoordenadasDesdeImagen,
} from "@/src/lib/mapa-asistente-extraccion"
import { registrarSolicitudAsistente } from "@/src/lib/mapa-asistente-rate-limit"
import type { MapaAsistenteUIMessage } from "@/src/lib/mapa-asistente-types"
import type { CoordenadasMapaAplicables } from "@/src/lib/mapa-coordenadas-gps"
import { ipDesdeRequest } from "@/src/lib/visita-rate-limit"

export const maxDuration = 60

const MAPA_ASISTENTE_CHAT_MODEL =
  process.env.MAPA_ASISTENTE_CHAT_MODEL?.trim() || "google/gemini-2.5-flash"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

type RouteParams = { params: Promise<{ proyectoId: string }> }

type PostBody = {
  messages?: MapaAsistenteUIMessage[]
}

function textoUltimoMensajeUsuario(messages: MapaAsistenteUIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i]
    if (msg.role !== "user") continue
    return msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("\n")
      .trim()
  }
  return ""
}

function imagenUltimoMensajeUsuario(
  messages: MapaAsistenteUIMessage[]
): { base64: string; mediaType: string } | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i]
    if (msg.role !== "user") continue
    for (const part of msg.parts) {
      if (part.type !== "file") continue
      if (!part.mediaType?.startsWith("image/")) continue
      const url = part.url
      if (!url.startsWith("data:")) continue
      const match = /^data:([^;]+);base64,(.+)$/i.exec(url)
      if (!match) continue
      const mediaType = match[1]
      const base64 = match[2]
      const approxBytes = Math.ceil((base64.length * 3) / 4)
      if (approxBytes > MAX_IMAGE_BYTES) {
        throw new Error("La imagen supera el límite de 5 MB.")
      }
      return { base64, mediaType }
    }
    return null
  }
  return null
}

function contextoSistema(proyectoId: string, coords: CoordenadasMapaAplicables | null): string {
  const proyecto = getProyecto(proyectoId)
  const coordsBlock = coords
    ? `
Coordenadas detectadas en esta solicitud (ya convertidas a WGS84):
- Latitud: ${coords.lat}
- Longitud: ${coords.lng}
- Precisión estimada: ±${coords.precision_m} m
- Fuente: ${coords.fuente}
${coords.utm ? `- UTM leída: zona ${coords.utm.zona}${coords.utm.hemisferio}, E ${coords.utm.easting}, N ${coords.utm.northing}` : ""}

Explique en español claro qué significa colocar un punto de avance GPS en esas coordenadas. No invente tramos ni minitramos concretos (el mapa los calcula). Indique que debe pulsar «Registrar punto» en el mapa para confirmar el registro en base de datos.
`
    : ""

  return `Eres el asistente del mapa de avance GPS del proyecto "${proyecto.nombreObra}" (${proyectoId}).
Objeto: ${proyecto.objeto}
Sistema: ${proyecto.sistema}

Responde siempre en español, tono profesional de obra civil.
Puedes responder preguntas sobre desasolve por tramos, minitramos A/B/C, registro GPS en campo y uso del mapa.
Reglas:
- No registras puntos en la base de datos; solo orientas al residente.
- No inventes datos de tramos, avances ni fechas que no aparezcan en la conversación.
- Si el usuario sube una captura GPS, describe las coordenadas leídas y el siguiente paso en el mapa.
${coordsBlock}`
}

export async function POST(request: Request, { params }: RouteParams) {
  const { proyectoId } = await params
  const auth = await autorizarMapaAsistente(proyectoId)
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const ip = ipDesdeRequest(request)
  const rate = registrarSolicitudAsistente(`${auth.userEmail}:${ip}`)
  if (!rate.allowed) {
    return Response.json(
      { error: "Demasiadas solicitudes al asistente. Espere unos minutos." },
      {
        status: 429,
        headers: rate.retryAfterSec ? { "Retry-After": String(rate.retryAfterSec) } : undefined,
      }
    )
  }

  let body: PostBody
  try {
    body = (await request.json()) as PostBody
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 })
  }

  const messages = body.messages ?? []
  if (messages.length === 0) {
    return Response.json({ error: "Faltan mensajes." }, { status: 400 })
  }

  let coords: CoordenadasMapaAplicables | null = null
  let coordsError: string | null = null

  try {
    const imagen = imagenUltimoMensajeUsuario(messages)
    if (imagen) {
      const result = await extraerCoordenadasDesdeImagen(imagen.base64, imagen.mediaType)
      if (result.coords) {
        coords = result.coords
      } else {
        coordsError = result.error ?? "No se pudieron extraer coordenadas."
      }
    } else {
      const texto = textoUltimoMensajeUsuario(messages)
      coords = coordsDesdeTextoUsuario(texto)
    }
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error al procesar coordenadas." },
      { status: 400 }
    )
  }

  const system = contextoSistema(proyectoId, coords)
  if (coordsError) {
    const systemConError = `${system}\n\nNota: ${coordsError} Sugiera revisar la captura o ingresar coordenadas manualmente.`
    const modelMessages = await convertToModelMessages(messages as UIMessage[])
    const result = streamText({
      model: MAPA_ASISTENTE_CHAT_MODEL,
      system: systemConError,
      messages: modelMessages,
    })

    return createUIMessageStreamResponse({
      stream: createUIMessageStream<MapaAsistenteUIMessage>({
        originalMessages: messages,
        execute: ({ writer }) => {
          writer.merge(result.toUIMessageStream({ originalMessages: messages }))
        },
      }),
    })
  }

  const modelMessages = await convertToModelMessages(messages as UIMessage[])
  const result = streamText({
    model: MAPA_ASISTENTE_CHAT_MODEL,
    system,
    messages: modelMessages,
  })

  return createUIMessageStreamResponse({
    stream: createUIMessageStream<MapaAsistenteUIMessage>({
      originalMessages: messages,
      execute: ({ writer }) => {
        if (coords) {
          writer.write({
            type: "data-map-coords",
            data: coords,
            transient: true,
          })
        }
        writer.merge(result.toUIMessageStream({ originalMessages: messages }))
      },
    }),
  })
}
