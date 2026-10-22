const WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS_DEFAULT = 40
export const MAX_REQUESTS_VISITANTE = 25

type Bucket = {
  count: number
  windowStart: number
}

const buckets = new Map<string, Bucket>()

export function registrarSolicitudAsistente(
  key: string,
  options?: { maxRequests?: number }
): {
  allowed: boolean
  retryAfterSec?: number
} {
  const id = key.trim() || "unknown"
  const maxRequests = options?.maxRequests ?? MAX_REQUESTS_DEFAULT
  const now = Date.now()
  const current = buckets.get(id)

  if (!current || now - current.windowStart >= WINDOW_MS) {
    buckets.set(id, { count: 1, windowStart: now })
    return { allowed: true }
  }

  if (current.count >= maxRequests) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - current.windowStart)) / 1000)
    return { allowed: false, retryAfterSec }
  }

  current.count += 1
  buckets.set(id, current)
  return { allowed: true }
}
