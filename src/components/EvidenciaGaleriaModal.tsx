"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { RegistroFotoDetalle } from "@/src/components/RegistroFotoDetalle"
import { descargarImagenEvidencia, nombreArchivoEvidencia } from "@/src/lib/descargar-evidencia"
import type { EvidenciaGrupo } from "@/src/lib/evidencias-grupo"
import { cn } from "@/lib/utils"

type EvidenciaGaleriaModalProps = {
  grupo: EvidenciaGrupo | null
  onClose: () => void
}

export function EvidenciaGaleriaModal({ grupo, onClose }: EvidenciaGaleriaModalProps) {
  const [indiceActivo, setIndiceActivo] = useState(0)

  useEffect(() => {
    setIndiceActivo(0)
  }, [grupo?.grupoId])

  useEffect(() => {
    if (!grupo) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
        return
      }
      if (event.key === "ArrowLeft") {
        setIndiceActivo((current) => Math.max(0, current - 1))
      }
      if (event.key === "ArrowRight") {
        setIndiceActivo((current) => Math.min(grupo.imagenes.length - 1, current + 1))
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [grupo, onClose])

  if (!grupo) return null

  const { representante, imagenes } = grupo
  const imagenActual = imagenes[indiceActivo]
  const hayVarias = imagenes.length > 1

  async function handleDescargarImagenActual() {
    if (!imagenActual?.image_url) return

    try {
      await descargarImagenEvidencia(
        imagenActual.image_url,
        nombreArchivoEvidencia(
          imagenActual,
          indiceActivo,
          representante.sector,
          imagenes.length
        )
      )
    } catch {
      window.open(imagenActual.image_url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl bg-background p-3 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-foreground">
            {representante.sector}
            {hayVarias ? ` — Foto ${indiceActivo + 1} de ${imagenes.length}` : ""}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-border">
          {imagenActual?.image_url ? (
            <Image
              src={imagenActual.image_url}
              alt={`Evidencia ampliada ${representante.sector}`}
              width={1400}
              height={1000}
              className="h-auto max-h-[50vh] w-full object-contain"
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Vista previa no disponible
            </div>
          )}

          {imagenActual?.image_url ? (
            <button
              type="button"
              onClick={() => void handleDescargarImagenActual()}
              className={cn(
                "absolute bottom-2 right-2 z-10 flex size-9 items-center justify-center rounded-md",
                "bg-black/65 text-white shadow-sm ring-1 ring-white/20",
                "transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                "touch-manipulation"
              )}
              aria-label={`Descargar foto ${indiceActivo + 1} de ${representante.sector}`}
            >
              <Download className="size-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}

          {hayVarias ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90"
                disabled={indiceActivo === 0}
                onClick={() => setIndiceActivo((current) => Math.max(0, current - 1))}
                aria-label="Foto anterior"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90"
                disabled={indiceActivo === imagenes.length - 1}
                onClick={() =>
                  setIndiceActivo((current) => Math.min(imagenes.length - 1, current + 1))
                }
                aria-label="Foto siguiente"
              >
                <ChevronRight className="size-4" />
              </Button>
            </>
          ) : null}
        </div>

        {hayVarias ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {imagenes.map((imagen, index) => (
              <button
                key={imagen.id}
                type="button"
                onClick={() => setIndiceActivo(index)}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 ${
                  index === indiceActivo ? "border-primary" : "border-transparent"
                }`}
              >
                {imagen.image_url ? (
                  <Image
                    src={imagen.image_url}
                    alt={`Miniatura ${index + 1}`}
                    width={80}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-3 max-h-[28vh] overflow-y-auto rounded-lg border border-border bg-muted/20 p-3">
          <RegistroFotoDetalle
            sector={representante.sector}
            fechaCaptura={representante.fecha_captura}
            lat={representante.lat}
            lng={representante.lng}
            descripcion={representante.descripcion}
            numeroRubro={representante.numero_rubro}
            ubicacionAbscisa={representante.ubicacion_abscisa}
            actividadEspecifica={representante.actividad_especifica}
            maquinariaUtilizada={representante.maquinaria_utilizada}
            estadoHito={representante.estado_hito}
            observacionTecnica={representante.observacion_tecnica}
            showMapLink={false}
          />
        </div>
      </div>
    </div>
  )
}
