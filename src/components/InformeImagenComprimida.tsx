"use client"

import { useEffect, useRef, useState } from "react"

import { obtenerUrlImagenComprimidaInforme } from "@/src/lib/compress-image-informe"
import { cn } from "@/lib/utils"

type InformeImagenComprimidaProps = {
  src: string
  alt: string
  className?: string
}

export function InformeImagenComprimida({ src, alt, className }: InformeImagenComprimidaProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [displaySrc, setDisplaySrc] = useState<string | null>(null)
  const [lista, setLista] = useState(false)

  useEffect(() => {
    let activo = true

    async function cargar() {
      setLista(false)
      setDisplaySrc(null)

      try {
        const url = await obtenerUrlImagenComprimidaInforme(src)
        if (activo) {
          setDisplaySrc(url)
        }
      } catch {
        if (activo) {
          setDisplaySrc(src)
        }
      }
    }

    void cargar()

    return () => {
      activo = false
    }
  }, [src])

  useEffect(() => {
    if (!displaySrc) return
    if (imgRef.current?.complete) {
      setLista(true)
    }
  }, [displaySrc])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={displaySrc ?? undefined}
      alt={alt}
      className={cn("libro-obra-imagen block w-full h-auto max-w-full", className)}
      data-informe-imagen-lista={lista && displaySrc ? "true" : "false"}
      onLoad={() => setLista(true)}
      onError={() => setLista(true)}
    />
  )
}
