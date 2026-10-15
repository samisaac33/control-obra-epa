/** Valores que no son claves reales pero a veces se pegan desde el panel de Vercel. */
const PLACEHOLDERS_INVALIDOS = new Set(
  ["active", "inactive", "enabled", "disabled", "true", "false", "yes", "no"].map((s) =>
    s.toLowerCase()
  )
)

export function verificarCredencialesAiGateway():
  | { ok: true }
  | { ok: false; mensaje: string } {
  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim()
  const oidc = process.env.VERCEL_OIDC_TOKEN?.trim()

  if (apiKey && PLACEHOLDERS_INVALIDOS.has(apiKey.toLowerCase())) {
    return {
      ok: false,
      mensaje:
        'AI_GATEWAY_API_KEY no debe ser "ACTIVE" ni otro estado del panel. Cree una API key en Vercel → AI Gateway → API Keys y pegue el valor secreto completo, o elimine esa variable y use OIDC en el despliegue.',
    }
  }

  if (apiKey && apiKey.length >= 20) {
    return { ok: true }
  }

  if (oidc && oidc.length > 20) {
    return { ok: true }
  }

  if (apiKey && apiKey.length < 20) {
    return {
      ok: false,
      mensaje:
        "AI_GATEWAY_API_KEY parece incompleta. Use la clave secreta generada en Vercel (AI Gateway → API Keys), no la etiqueta ACTIVE del estado del servicio.",
    }
  }

  return {
    ok: false,
    mensaje:
      "Falta autenticación con AI Gateway. En Vercel: cree AI_GATEWAY_API_KEY con una API key real, o enlace el proyecto a AI Gateway para OIDC (VERCEL_OIDC_TOKEN en runtime).",
  }
}
