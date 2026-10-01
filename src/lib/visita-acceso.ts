import type { NextRequest } from "next/server"

export const VISITA_COOKIE_NAME = "obra_visita"
const VISITA_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30

type VisitaCookiePayload = {
  exp: number
}

export function isVisitaGateConfigured(): boolean {
  const secret = process.env.VISITANTE_SESSION_SECRET?.trim()
  if (!secret) return false
  const pin = process.env.VISITANTE_PIN?.trim()
  const pinHash = process.env.VISITANTE_PIN_SHA256?.trim().toLowerCase()
  return Boolean(pin || pinHash)
}

function sessionSecret(): string | null {
  const secret = process.env.VISITANTE_SESSION_SECRET?.trim()
  return secret || null
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function sha256Base64Url(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return bytesToBase64Url(new Uint8Array(hash))
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

function encodePayload(payload: VisitaCookiePayload): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
}

function decodePayload(encoded: string): VisitaCookiePayload | null {
  try {
    const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"))
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json) as VisitaCookiePayload
    if (typeof parsed.exp !== "number" || !Number.isFinite(parsed.exp)) return null
    return parsed
  } catch {
    return null
  }
}

async function signPayload(payload: string, secret: string): Promise<string> {
  return sha256Base64Url(`${secret}:${payload}`)
}

export async function verificarPin(pin: string): Promise<boolean> {
  const normalized = pin.trim()
  if (!normalized) return false

  const plain = process.env.VISITANTE_PIN?.trim()
  const expectedHash = process.env.VISITANTE_PIN_SHA256?.trim().toLowerCase()

  if (expectedHash) {
    const actualHash = await sha256Hex(normalized)
    return timingSafeEqualStr(actualHash, expectedHash)
  }

  if (plain) {
    return timingSafeEqualStr(plain, normalized)
  }

  return false
}

export async function crearValorCookieVisita(nowMs = Date.now()): Promise<string | null> {
  const secret = sessionSecret()
  if (!secret) return null

  const exp = nowMs + VISITA_COOKIE_MAX_AGE_SEC * 1000
  const payloadEncoded = encodePayload({ exp })
  const signature = await signPayload(payloadEncoded, secret)
  return `${payloadEncoded}.${signature}`
}

export async function validarValorCookieVisita(
  value: string | undefined,
  nowMs = Date.now()
): Promise<boolean> {
  if (!value) return false
  const secret = sessionSecret()
  if (!secret) return false

  const dot = value.lastIndexOf(".")
  if (dot <= 0) return false

  const payloadEncoded = value.slice(0, dot)
  const signature = value.slice(dot + 1)
  const expected = await signPayload(payloadEncoded, secret)

  if (!timingSafeEqualStr(signature, expected)) return false

  const payload = decodePayload(payloadEncoded)
  if (!payload) return false
  return payload.exp > nowMs
}

export async function validarCookieVisita(request: NextRequest, nowMs = Date.now()): Promise<boolean> {
  const value = request.cookies.get(VISITA_COOKIE_NAME)?.value
  return validarValorCookieVisita(value, nowMs)
}

export function opcionesCookieVisita() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: VISITA_COOKIE_MAX_AGE_SEC,
  }
}

export function rutasPublicasVisita(pathname: string): boolean {
  if (pathname === "/ingreso" || pathname === "/login") return true
  if (pathname === "/infimas" || pathname.startsWith("/infimas/")) return true
  if (
    pathname === "/api/visita/verificar" ||
    pathname === "/api/visita/salir" ||
    pathname === "/api/visita/estado"
  ) {
    return true
  }
  return false
}
