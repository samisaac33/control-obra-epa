"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ObservacionTecnicaCampoProps = {
  value?: string | null
}

export function ObservacionTecnicaCampo({ value }: ObservacionTecnicaCampoProps) {
  const [expanded, setExpanded] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    setExpanded(false)
  }, [value])

  useLayoutEffect(() => {
    const el = textRef.current
    if (!el) return

    const checkOverflow = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setShowMore(false)
        return
      }
      if (expanded) {
        setShowMore(true)
        return
      }
      setShowMore(el.scrollHeight > el.clientHeight + 1)
    }

    checkOverflow()

    const resizeObserver = new ResizeObserver(checkOverflow)
    resizeObserver.observe(el)

    const mediaQuery = window.matchMedia("(min-width: 768px)")
    mediaQuery.addEventListener("change", checkOverflow)

    return () => {
      resizeObserver.disconnect()
      mediaQuery.removeEventListener("change", checkOverflow)
    }
  }, [value, expanded])

  if (!value?.trim()) return null

  return (
    <>
      <p className="hidden text-sm md:block">
        <span className="font-medium text-foreground">Observación técnica relevante: </span>
        <span className="text-muted-foreground">{value}</span>
      </p>

      <div className="text-sm md:hidden">
        <p className="font-medium text-foreground">Observación técnica relevante:</p>
        <p
          ref={textRef}
          className={cn("mt-0.5 text-muted-foreground", !expanded && "line-clamp-3")}
        >
          {value}
        </p>
        {showMore && !expanded ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExpanded(true)}
            className="mt-2 h-8 w-full border-primary/40 bg-primary/10 text-xs font-semibold text-primary shadow-sm hover:bg-primary/15"
          >
            Ver más
            <ChevronDown className="size-3.5" aria-hidden />
          </Button>
        ) : null}
        {expanded ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
            className="mt-2 h-8 w-full text-xs font-semibold text-primary"
          >
            Ver menos
            <ChevronUp className="size-3.5" aria-hidden />
          </Button>
        ) : null}
      </div>
    </>
  )
}
