const WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS = 40

type Bucket = {
  count: number
  windowStart: number
}

const buckets = new Map<string, Bucket>()

export function registrarSolicitudAsistente(key: string): {
  allowed: boolean
  retryAfterSec?: number
} {
  const id = key.trim() || "unknown"
  const now = Date.now()
  const current = buckets.get(id)

  if (!current || now - current.windowStart >= WINDOW_MS) {
    buckets.set(id, { count: 1, windowStart: now })
    return { allowed: true }
  }

  if (current.count >= MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - current.windowStart)) / 1000)
    return { allowed: false, retryAfterSec }
  }

  current.count += 1
  buckets.set(id, current)
  return { allowed: true }
}
