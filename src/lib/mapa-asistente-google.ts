import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { LanguageModel } from "ai"

import {
  MAPA_ASISTENTE_CHAT_MODEL_DEFAULT,
  MAPA_ASISTENTE_VISION_MODEL_DEFAULT,
  modeloAsistenteChat,
  modeloAsistenteVision,
} from "@/src/lib/mapa-asistente-modelos"

/** Google retiró gemini-2.0-flash-lite; usar generación 3.5+ como respaldo. */
const FALLBACKS_VISION = ["gemini-3.5-flash-lite", "gemini-2.5-flash-lite"] as const
const FALLBACKS_CHAT = ["gemini-3.5-flash-lite", "gemini-2.5-flash-lite"] as const

export function googleGenerativeApiKey(): string | null {
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    null
  return key || null
}

export function verificarCredencialesGoogle():
  | { ok: true }
  | { ok: false; mensaje: string } {
  if (!googleGenerativeApiKey()) {
    return {
      ok: false,
      mensaje:
        "Falta GOOGLE_GENERATIVE_AI_API_KEY en Vercel (Google AI Studio → API Keys). El asistente usa Google directo, no AI Gateway.",
    }
  }
  return { ok: true }
}

/** Acepta `gemini-2.5-flash-lite` o el formato antiguo `google/gemini-2.5-flash-lite`. */
export function normalizarIdModeloGoogle(id: string): string {
  return id.replace(/^google\//i, "").trim()
}

const MODELOS_RETIRADOS = new Set(["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-001"])

function filtrarModelosDisponibles(ids: string[]): string[] {
  return ids.filter((id) => id && !MODELOS_RETIRADOS.has(id))
}

function idsDesdeEnv(listaEnv: string | undefined, fallbacks: readonly string[]): string[] {
  const extra = listaEnv
    ?.split(",")
    .map((s) => normalizarIdModeloGoogle(s))
    .filter(Boolean)
  return filtrarModelosDisponibles([...new Set([...(extra ?? []), ...fallbacks])])
}

export function modelosGoogleVisionEnOrden(): string[] {
  const primary = normalizarIdModeloGoogle(modeloAsistenteVision()) || MAPA_ASISTENTE_VISION_MODEL_DEFAULT
  const fallbacks = idsDesdeEnv(process.env.MAPA_ASISTENTE_VISION_MODEL_FALLBACKS, FALLBACKS_VISION)
  return filtrarModelosDisponibles([...new Set([primary, ...fallbacks])])
}

export function modelosGoogleChatEnOrden(): string[] {
  const primary = normalizarIdModeloGoogle(modeloAsistenteChat()) || MAPA_ASISTENTE_CHAT_MODEL_DEFAULT
  const fallbacks = idsDesdeEnv(process.env.MAPA_ASISTENTE_CHAT_MODEL_FALLBACKS, FALLBACKS_CHAT)
  return filtrarModelosDisponibles([...new Set([primary, ...fallbacks])])
}

function instanciaGoogle() {
  const apiKey = googleGenerativeApiKey()
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY no configurada.")
  }
  return createGoogleGenerativeAI({ apiKey })
}

export function crearModeloGoogle(id: string): LanguageModel {
  return instanciaGoogle()(id)
}

export function modeloGoogleVision(): LanguageModel {
  return crearModeloGoogle(modelosGoogleVisionEnOrden()[0])
}

export function modeloGoogleChat(): LanguageModel {
  return crearModeloGoogle(modelosGoogleChatEnOrden()[0])
}

export function errorModeloGoogleReintentarConFallback(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  const lower = msg.toLowerCase()
  return (
    lower.includes("high demand") ||
    lower.includes("resource exhausted") ||
    lower.includes("overloaded") ||
    lower.includes("no longer available") ||
    lower.includes("not found") ||
    lower.includes("503") ||
    lower.includes("429") ||
    lower.includes("403") ||
    lower.includes("permission denied") ||
    lower.includes("permission_denied") ||
    lower.includes("forbidden") ||
    lower.includes("unavailable")
  )
}

/** @deprecated alias */
export const errorModeloGoogleSaturadoOTransitorio = errorModeloGoogleReintentarConFallback

export async function esperarMs(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}
