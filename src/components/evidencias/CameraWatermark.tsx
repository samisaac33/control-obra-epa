"use client"

import { useCallback, useMemo, useState } from "react"
import * as exifr from "exifr"
import { Camera, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { aplicarWatermarkEnImagen } from "@/src/lib/evidencia-watermark"
import { leerExifGps } from "@/src/lib/evidencia-upload"
import { createClient } from "@/src/lib/supabase/client"

const BUCKET = "evidencias"

export type CameraWatermarkProps = {
  proyectoId: string
  frente: string
  abscisa: string
  userId: string
  onUploaded?: (publicPath: string) => void
}

export function CameraWatermark({
  proyectoId,
  frente,
  abscisa,
  userId,
  onUploaded,
}: CameraWatermarkProps) {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const procesarArchivo = useCallback(
    async (file: File) => {
      setLoading(true)
      setError(null)
      try {
        const exif = await leerExifGps(file)
        let lat = exif.lat
        let lng = exif.lng
        let fecha = exif.fecha ?? new Date()

        if (lat == null || lng == null) {
          try {
            const parsed = await exifr.parse(file, { gps: true })
            if (typeof parsed?.latitude === "number") lat = parsed.latitude
            if (typeof parsed?.longitude === "number") lng = parsed.longitude
          } catch {
            /* sin EXIF GPS */
          }
        }

        const blob = await aplicarWatermarkEnImagen(file, {
          frente,
          abscisa,
          lat,
          lng,
          fecha,
        })

        const fileName = `${Date.now()}-evidencia.jpg`
        const path = `${userId}/${proyectoId}/${fileName}`

        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
          contentType: "image/jpeg",
          upsert: false,
        })
        if (uploadError) throw new Error(uploadError.message)

        onUploaded?.(path)
        setPreviewUrl(URL.createObjectURL(blob))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al procesar evidencia.")
      } finally {
        setLoading(false)
      }
    },
    [abscisa, frente, onUploaded, proyectoId, supabase.storage, userId]
  )

  return (
    <div className="space-y-3 rounded-xl border border-foreground/10 bg-muted/20 p-4">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Camera className="size-4" aria-hidden />
        Evidencia con estampado contractual
      </Label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
        disabled={loading}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void procesarArchivo(f)
        }}
      />
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Procesando imagen…
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {previewUrl ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Vista previa evidencia estampada" className="max-h-48 rounded-lg border" />
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={previewUrl} target="_blank" rel="noreferrer">
              Abrir evidencia
            </a>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
