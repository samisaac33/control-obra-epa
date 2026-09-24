"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"

const STORAGE_KEY = "mapa-visitante-hint-dismissed"

type MapaVisitanteHintProps = {
  activo: boolean
}

export function MapaVisitanteHint({ activo }: MapaVisitanteHintProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!activo) {
      setVisible(false)
      return
    }
    try {
      setVisible(sessionStorage.getItem(STORAGE_KEY) !== "1")
    } catch {
      setVisible(true)
    }
  }, [activo])

  if (!visible) return null

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 z-[400] flex justify-center px-3">
      <div className="pointer-events-auto flex max-w-sm items-start gap-2 rounded-full border border-foreground/10 bg-background/95 py-2 pl-4 pr-2 text-xs shadow-md backdrop-blur-sm">
        <p className="leading-snug text-foreground">
          Toca un tramo coloreado para ver el minitramo
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 rounded-full"
          aria-label="Cerrar ayuda"
          onClick={dismiss}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
