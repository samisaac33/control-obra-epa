"use client"

import { useEffect, useState } from "react"

function detectarViewportMovil(): boolean {
  if (typeof window === "undefined") return false
  const coarse = window.matchMedia("(pointer: coarse)").matches
  const estrecho = window.matchMedia("(max-width: 767px)").matches
  return coarse || estrecho
}

export function useEsViewportMovil(): boolean {
  const [esMovil, setEsMovil] = useState(() => detectarViewportMovil())

  useEffect(() => {
    setEsMovil(detectarViewportMovil())
    const mqPointer = window.matchMedia("(pointer: coarse)")
    const mqWidth = window.matchMedia("(max-width: 767px)")
    const actualizar = () => setEsMovil(detectarViewportMovil())
    mqPointer.addEventListener("change", actualizar)
    mqWidth.addEventListener("change", actualizar)
    return () => {
      mqPointer.removeEventListener("change", actualizar)
      mqWidth.removeEventListener("change", actualizar)
    }
  }, [])

  return esMovil
}
