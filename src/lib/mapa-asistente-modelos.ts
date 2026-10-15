/** Modelos con visión + structured output; accesibles en créditos gratuitos de AI Gateway (no usar gemini-2.5-flash base). */
export const MAPA_ASISTENTE_VISION_MODEL_DEFAULT = "google/gemini-2.5-flash-lite"
export const MAPA_ASISTENTE_CHAT_MODEL_DEFAULT = "google/gemini-2.5-flash-lite"

export function modeloAsistenteVision(): string {
  return process.env.MAPA_ASISTENTE_VISION_MODEL?.trim() || MAPA_ASISTENTE_VISION_MODEL_DEFAULT
}

export function modeloAsistenteChat(): string {
  return process.env.MAPA_ASISTENTE_CHAT_MODEL?.trim() || MAPA_ASISTENTE_CHAT_MODEL_DEFAULT
}

export function mensajeErrorAsistenteLegible(detalle: string): string {
  const t = detalle.trim()
  if (t.includes("Free tier users do not have access to this model")) {
    return (
      "El modelo de IA configurado no está disponible en el plan gratuito de Vercel AI Gateway. " +
      "Opciones: (1) recargar créditos de pago en el equipo de Vercel, o (2) usar modelos «lite» — " +
      "por defecto el proyecto ya usa google/gemini-2.5-flash-lite; si definió variables de modelo, cámbielas o elimínelas y redeploy."
    )
  }
  if (t.includes("Unauthenticated") || t.includes("AI_GATEWAY_API_KEY")) {
    return (
      "No se pudo autenticar con AI Gateway. Revise OIDC (Settings → Security) o AI_GATEWAY_API_KEY."
    )
  }
  try {
    const json = JSON.parse(t) as { error?: string }
    if (typeof json.error === "string") return mensajeErrorAsistenteLegible(json.error)
  } catch {
    /* texto plano */
  }
  return t.length > 280 ? `${t.slice(0, 280)}…` : t
}
