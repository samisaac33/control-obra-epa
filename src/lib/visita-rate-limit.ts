const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 20

type Bucket = {
  count: number
  windowStart: number
}

const buckets = new Map<string, Bucket>()

export function registrarIntentoPin(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const key = ip.trim() || "unknown"
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || now - current.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now })
    return { allowed: true }
  }

  if (current.count >= MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - current.windowStart)) / 1000)
    return { allowed: false, retryAfterSec }
  }

  current.count += 1
  buckets.set(key, current)
  return { allowed: true }
}

export function ipDesdeRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown"
  }
  return request.headers.get("x-real-ip")?.trim() ?? "unknown"
}
