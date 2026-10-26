"use client"

import { useEffect, useState } from "react"

/** iPhone, iPad o iPadOS con teclado (MacIntel + touch). */
export function useEsDispositivoApple(): boolean {
  const [esApple, setEsApple] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    setEsApple(ios)
  }, [])

  return esApple
}
