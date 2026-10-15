/** IDs para @ai-sdk/google (sin prefijo google/). */
export const MAPA_ASISTENTE_VISION_MODEL_DEFAULT = "gemini-3.5-flash-lite"
export const MAPA_ASISTENTE_CHAT_MODEL_DEFAULT = "gemini-3.5-flash-lite"

export function modeloAsistenteVision(): string {
  return process.env.MAPA_ASISTENTE_VISION_MODEL?.trim() || MAPA_ASISTENTE_VISION_MODEL_DEFAULT
}

export function modeloAsistenteChat(): string {
  return process.env.MAPA_ASISTENTE_CHAT_MODEL?.trim() || MAPA_ASISTENTE_CHAT_MODEL_DEFAULT
}

export function mensajeErrorAsistenteLegible(detalle: string): string {
  const t = detalle.trim()
  if (t.includes("GOOGLE_GENERATIVE_AI_API_KEY") || t.includes("API key not valid")) {
    return (
      "Clave de Google inválida o ausente. Configure GOOGLE_GENERATIVE_AI_API_KEY en Vercel " +
      "(Google AI Studio → Get API key)."
    )
  }
  if (t.includes("Free tier users do not have access to this model")) {
    return (
      "Este mensaje corresponde a Vercel AI Gateway. El asistente ya debería usar Google directo; " +
      "redeploy producción y confirme GOOGLE_GENERATIVE_AI_API_KEY. Si persiste, elimine variables de AI Gateway."
    )
  }
  if (
    t.toLowerCase().includes("high demand") ||
    t.toLowerCase().includes("resource exhausted") ||
    t.includes("Failed after 3 attempts")
  ) {
    return (
      "Google reporta alta demanda en el modelo Gemini (saturación temporal). Espere 1–2 minutos y reintente, " +
      "o en Vercel defina MAPA_ASISTENTE_VISION_MODEL=google/gemini-3.6-flash (y redeploy)."
    )
  }
  if (t.toLowerCase().includes("no longer available")) {
    return (
      "Google retiró ese modelo Gemini. Actualice MAPA_ASISTENTE_VISION_MODEL / CHAT (p. ej. google/gemini-3.6-flash " +
      "o gemini-3.5-flash-lite) y redeploy. Los respaldos antiguos 2.0 ya no se usan."
    )
  }
  if (t.includes("Unauthenticated") || t.includes("AI_GATEWAY_API_KEY")) {
    return (
      "Error de autenticación con AI Gateway. Si usa Google directo, ignore AI Gateway: " +
      "defina GOOGLE_GENERATIVE_AI_API_KEY y redeploy."
    )
  }
  try {
    const json = JSON.parse(t) as { error?: string | { message?: string } }
    if (typeof json.error === "string") return mensajeErrorAsistenteLegible(json.error)
    if (json.error && typeof json.error === "object" && json.error.message) {
      return mensajeErrorAsistenteLegible(json.error.message)
    }
  } catch {
    /* texto plano */
  }
  return t.length > 280 ? `${t.slice(0, 280)}…` : t
}
