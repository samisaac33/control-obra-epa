"use client"

import Image from "next/image"
import { Images } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { EvidenciaGrupo } from "@/src/lib/evidencias-grupo"
import { cn } from "@/lib/utils"

type EvidenciaGaleriaCardProps = {
  grupo: EvidenciaGrupo
  isActive?: boolean
  onOpenGaleria: () => void
  onHoverChange?: (active: boolean) => void
}

export function EvidenciaGaleriaCard({
  grupo,
  isActive,
  onOpenGaleria,
  onHoverChange,
}: EvidenciaGaleriaCardProps) {
  const { imagenes } = grupo
  const total = imagenes.length
  const visibles = imagenes.slice(0, 4)
  const restantes = total - visibles.length

  return (
    <div
      className="group relative overflow-hidden"
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <div
        className={cn(
          "grid gap-0.5 bg-muted",
          total === 1 ? "grid-cols-1" : "grid-cols-2"
        )}
      >
        {visibles.map((imagen, index) => (
          <div
            key={imagen.id}
            className={cn(
              "relative overflow-hidden bg-muted",
              total === 1 ? "h-44" : total === 2 ? "h-44" : total === 3 && index === 0 ? "col-span-2 h-32" : "h-24"
            )}
          >
            {imagen.image_url ? (
              <Image
                src={imagen.image_url}
                alt={`Evidencia ${grupo.representante.sector} ${index + 1}`}
                width={400}
                height={300}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Sin vista previa
              </div>
            )}
            {restantes > 0 && index === visibles.length - 1 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
                +{restantes}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {total > 1 ? (
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-xs font-medium text-white">
          <Images className="size-3.5" aria-hidden />
          {total} fotos
        </div>
      ) : null}

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity duration-200",
          isActive
            ? "opacity-100"
            : "opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
        )}
      >
        <Button
          type="button"
          size="sm"
          className="bg-background/95 text-foreground hover:bg-background"
          onClick={(event) => {
            event.stopPropagation()
            onOpenGaleria()
          }}
        >
          {total > 1 ? "Ver galería" : "Ver foto"}
        </Button>
      </div>
    </div>
  )
}
