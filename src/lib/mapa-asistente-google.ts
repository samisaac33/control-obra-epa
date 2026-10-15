import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { LanguageModel } from "ai"

import {
  MAPA_ASISTENTE_CHAT_MODEL_DEFAULT,
  MAPA_ASISTENTE_VISION_MODEL_DEFAULT,
  modeloAsistenteChat,
  modeloAsistenteVision,
} from "@/src/lib/mapa-asistente-modelos"

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

function instanciaGoogle() {
  const apiKey = googleGenerativeApiKey()
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY no configurada.")
  }
  return createGoogleGenerativeAI({ apiKey })
}

export function modeloGoogleVision(): LanguageModel {
  const id = normalizarIdModeloGoogle(modeloAsistenteVision())
  return instanciaGoogle()(id || MAPA_ASISTENTE_VISION_MODEL_DEFAULT)
}

export function modeloGoogleChat(): LanguageModel {
  const id = normalizarIdModeloGoogle(modeloAsistenteChat())
  return instanciaGoogle()(id || MAPA_ASISTENTE_CHAT_MODEL_DEFAULT)
}
