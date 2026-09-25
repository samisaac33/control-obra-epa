"use client"

import type { ReactNode } from "react"
import { createPortal } from "react-dom"

type MapaOverlayPortalProps = {
  open: boolean
  children: ReactNode
}

export function MapaOverlayPortal({ open, children }: MapaOverlayPortalProps) {
  if (!open || typeof document === "undefined") return null
  return createPortal(children, document.body)
}
