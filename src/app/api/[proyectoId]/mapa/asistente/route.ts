import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai"

import { getProyecto } from "@/src/data/proyectos/catalog"
import { autorizarMapaAsistente } from "@/src/lib/mapa-asistente-auth"
import { construirContextoAsistenteDesasolve } from "@/src/lib/mapa-asistente-contexto"
import { createClient } from "@/src/lib/supabase/server"
import {
  coordsDesdeTextoUsuario,
  extraerCoordenadasDesdeImagen,
} from "@/src/lib/mapa-asistente-extraccion"
import { registrarSolicitudAsistente } from "@/src/lib/mapa-asistente-rate-limit"
import type { MapaAsistenteUIMessage } from "@/src/lib/mapa-asistente-types"
import type { CoordenadasMapaAplicables } from "@/src/lib/mapa-coordenadas-gps"
import {
  crearModeloGoogle,
  errorModeloGoogleReintentarConFallback,
  esperarMs,
  modelosGoogleChatEnOrden,
  verificarCredencialesGoogle,
} from "@/src/lib/mapa-asistente-google"
import { mensajeErrorAsistenteLegible } from "@/src/lib/mapa-asistente-modelos"
import { ipDesdeRequest } from "@/src/lib/visita-rate-limit"

export const maxDuration = 60

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

function contextoSistemaCompleto(
  proyectoId: string,
  coords: CoordenadasMapaAplicables | null,
  contextoObra: string
): string {
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

  return `Eres el asistente de obra del proyecto "${proyecto.nombreObra}" (${proyectoId}): mapa GPS, maquinaria y contexto contractual de desasolve.
Objeto: ${proyecto.objeto}
Sistema: ${proyecto.sistema}

Responde siempre en español, tono profesional de obra civil.
Puedes responder sobre términos de referencia, cronograma, presupuesto (según contexto documental), avance por tramos, minitramos A/B/C, jornadas de maquinaria (horas, equipos, tramos intervenidos) y registro GPS en campo.
Reglas:
- No registras puntos ni jornadas en la base de datos; solo orientas al residente.
- Para cifras operativas (máquinas, horas, metros, tramos, fechas), usa únicamente el bloque «Datos operativos» y «Contexto contractual» siguientes; no inventes ni extrapoles.
- Si el dato no está en el snapshot, indícalo y sugiera revisar /maquinaria o /mapa en la app.
- Si el usuario sube una captura GPS, describe las coordenadas leídas y el siguiente paso en el mapa.
${coordsBlock}

---
${contextoObra}`
}

type ModelMessages = Awaited<ReturnType<typeof convertToModelMessages>>

async function streamTextChatConFallback(options: {
  system: string
  messages: ModelMessages
  originalMessages: MapaAsistenteUIMessage[]
  writer: { merge: (stream: ReadableStream) => void }
}): Promise<void> {
  const modelos = modelosGoogleChatEnOrden()
  let ultimoError: unknown

  for (let i = 0; i < modelos.length; i += 1) {
    const result = streamText({
      model: crearModeloGoogle(modelos[i]),
      maxRetries: 0,
      system: options.system,
      messages: options.messages,
    })

    try {
      options.writer.merge(
        result.toUIMessageStream({ originalMessages: options.originalMessages })
      )
      await result.response
      return
    } catch (err) {
      ultimoError = err
      const puedeReintentar =
        i < modelos.length - 1 && errorModeloGoogleReintentarConFallback(err)
      if (!puedeReintentar) throw err
      await esperarMs(800 * (i + 1))
    }
  }

  throw ultimoError ?? new Error("No hay modelos Gemini configurados.")
}

export async function POST(request: Request, { params }: RouteParams) {
  const googleAuth = verificarCredencialesGoogle()
  if (!googleAuth.ok) {
    return Response.json({ error: googleAuth.mensaje }, { status: 503 })
  }

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

  const textoUsuario = textoUltimoMensajeUsuario(messages)
  let contextoObra = ""
  try {
    const supabase = await createClient()
    contextoObra = await construirContextoAsistenteDesasolve(
      supabase,
      proyectoId,
      textoUsuario
    )
  } catch (err) {
    console.error("[mapa-asistente] contexto operativo:", err)
    contextoObra =
      "### Datos operativos\nNo se pudo cargar el snapshot desde Supabase en este momento. Responda solo con lo que el usuario indique en la conversación y sugiera reintentar."
  }

  const system = contextoSistemaCompleto(proyectoId, coords, contextoObra)
  if (coordsError) {
    const systemConError = `${system}\n\nNota: ${coordsError} Sugiera revisar la captura o ingresar coordenadas manualmente.`
    const modelMessages = await convertToModelMessages(messages as UIMessage[])
    return createUIMessageStreamResponse({
      stream: createUIMessageStream<MapaAsistenteUIMessage>({
        originalMessages: messages,
        onError: (error) => mensajeErrorAsistenteLegible(String(error)),
        execute: async ({ writer }) => {
          await streamTextChatConFallback({
            system: systemConError,
            messages: modelMessages,
            originalMessages: messages,
            writer,
          })
        },
      }),
    })
  }

  const modelMessages = await convertToModelMessages(messages as UIMessage[])
  return createUIMessageStreamResponse({
    stream: createUIMessageStream<MapaAsistenteUIMessage>({
      originalMessages: messages,
      onError: (error) => mensajeErrorAsistenteLegible(String(error)),
      execute: async ({ writer }) => {
        if (coords) {
          writer.write({
            type: "data-map-coords",
            data: coords,
            transient: true,
          })
        }
        await streamTextChatConFallback({
          system,
          messages: modelMessages,
          originalMessages: messages,
          writer,
        })
      },
    }),
  })
}
