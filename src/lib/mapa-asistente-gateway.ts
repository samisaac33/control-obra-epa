/** Valores que no son claves reales pero a veces se pegan desde el panel de Vercel. */
const PLACEHOLDERS_INVALIDOS = new Set(
  ["active", "inactive", "enabled", "disabled", "true", "false", "yes", "no"].map((s) =>
    s.toLowerCase()
  )
)

/**
 * Solo rechaza configuraciones claramente incorrectas.
 * Con OIDC, el AI SDK obtiene el token en cada request vía @vercel/oidc;
 * no hace falta que VERCEL_OIDC_TOKEN aparezca en Environment Variables del dashboard.
 */
export function verificarCredencialesAiGateway():
  | { ok: true }
  | { ok: false; mensaje: string } {
  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim()

  if (apiKey && PLACEHOLDERS_INVALIDOS.has(apiKey.toLowerCase())) {
    return {
      ok: false,
      mensaje:
        'AI_GATEWAY_API_KEY no debe ser "ACTIVE" ni otro estado del panel. Elimine esa variable para usar OIDC, o pegue una API key secreta real de AI Gateway.',
    }
  }

  if (apiKey && apiKey.length > 0 && apiKey.length < 20) {
    return {
      ok: false,
      mensaje:
        "AI_GATEWAY_API_KEY parece incompleta. Use la clave secreta de Vercel (AI Gateway → API Keys) o elimínela para OIDC.",
    }
  }

  return { ok: true }
}
