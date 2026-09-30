"use client"

import { useSyncExternalStore } from "react"

const QUERY_MOVIL = "(max-width: 767px), (hover: none) and (pointer: coarse)"

function suscribirViewportMovil(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const mq = window.matchMedia(QUERY_MOVIL)
  mq.addEventListener("change", callback)
  return () => mq.removeEventListener("change", callback)
}

function leerViewportMovil(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia(QUERY_MOVIL).matches
}

export function useEsViewportMovil(): boolean {
  return useSyncExternalStore(suscribirViewportMovil, leerViewportMovil, () => false)
}
