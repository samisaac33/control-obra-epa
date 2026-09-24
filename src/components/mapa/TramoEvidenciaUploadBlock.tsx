"use client"

import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { CanalTramo } from "@/src/data/tramos/types"
import { getSectorLabelDesasolve } from "@/src/data/sectores-fotos-desasolve"
import { validarCoordenadasOpcionales } from "@/src/lib/coordenadas-evidencia"
import { leerExifGps, subirEvidenciaTramo } from "@/src/lib/evidencia-upload"
import type { PropuestaPuntoMinitramo } from "@/src/lib/tramo-geometria"
import { calcularPropuestaPuntoDesdeGps } from "@/src/lib/tramo-geometria"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import { createClient } from "@/src/lib/supabase/client"

const MAX_ARCHIVOS = 5
const SECTOR_OTROS = "canal-otros"
const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"

type TramoEvidenciaUploadBlockProps = {
  tramo: CanalTramo
  proyectoId: string
  puntosPrevios: TramoPuntoAvance[]
  onEvidenciaSubida?: () => void
  onSolicitarConfirmacion: (
    propuesta: PropuestaPuntoMinitramo,
    opciones: { registroFotoId: string }
  ) => void
}

function toLocalDatetimeValue(date: Date): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16)
}

function trimOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed || null
}

export function TramoEvidenciaUploadBlock({
  tramo,
  proyectoId,
  puntosPrevios,
  onEvidenciaSubida,
  onSolicitarConfirmacion,
}: TramoEvidenciaUploadBlockProps) {
  const supabase = createClient()
  const [archivos, setArchivos] = useState<File[]>([])
  const [fileInputKey, setFileInputKey] = useState(0)
  const [fechaCaptura, setFechaCaptura] = useState(() => toLocalDatetimeValue(new Date()))
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [descripcion, setDescripcion] = useState(`${tramo.codigo} — avance desasolve`)
  const [registrarAvance, setRegistrarAvance] = useState(true)
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleArchivosChange(fileList: FileList | null) {
    const seleccionados = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"))
    if (seleccionados.length > MAX_ARCHIVOS) {
      setError(`Puede subir hasta ${MAX_ARCHIVOS} imágenes.`)
      setArchivos(seleccionados.slice(0, MAX_ARCHIVOS))
      return
    }
    setError(null)
    setArchivos(seleccionados)

    if (seleccionados.length > 0) {
      const exif = await leerExifGps(seleccionados[0])
      if (exif.lat !== null && exif.lng !== null) {
        setLat(exif.lat.toFixed(7))
        setLng(exif.lng.toFixed(7))
      }
      if (exif.fecha) {
        setFechaCaptura(toLocalDatetimeValue(exif.fecha))
      }
    }
  }

  function resetFormulario() {
    setArchivos([])
    setFileInputKey((k) => k + 1)
    setFechaCaptura(toLocalDatetimeValue(new Date()))
    setLat("")
    setLng("")
    setDescripcion(`${tramo.codigo} — avance desasolve`)
    setRegistrarAvance(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setMensaje(null)

    if (archivos.length === 0) {
      setError("Seleccione al menos una imagen.")
      return
    }

    const coordenadas = validarCoordenadasOpcionales(lat, lng)
    if (coordenadas.error) {
      setError(coordenadas.error)
      return
    }

    if (registrarAvance && (coordenadas.lat === null || coordenadas.lng === null)) {
      setError("Para registrar avance ingrese coordenadas o suba una foto con GPS.")
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("Sesión no válida.")
        return
      }

      const sector = getSectorLabelDesasolve(SECTOR_OTROS) ?? "Otros tramos / frentes"
      const grupoId = crypto.randomUUID()
      let primerRegistroId: string | null = null

      for (const [index, archivo] of archivos.entries()) {
        const { registroId } = await subirEvidenciaTramo({
          supabase,
          userId: user.id,
          proyectoId,
          tramoId: tramo.id,
          archivo,
          sector,
          fechaCaptura: new Date(fechaCaptura).toISOString(),
          lat: coordenadas.lat,
          lng: coordenadas.lng,
          descripcion: trimOrNull(descripcion),
          grupoId,
        })
        if (index === 0) primerRegistroId = registroId
      }

      onEvidenciaSubida?.()

      if (registrarAvance && coordenadas.lat !== null && coordenadas.lng !== null && primerRegistroId) {
        const propuesta = calcularPropuestaPuntoDesdeGps(
          tramo,
          puntosPrevios,
          coordenadas.lat,
          coordenadas.lng
        )
        if (propuesta) {
          resetFormulario()
          onSolicitarConfirmacion(propuesta, { registroFotoId: primerRegistroId })
          return
        }
      }

      resetFormulario()
      setMensaje(
        registrarAvance && (coordenadas.lat === null || coordenadas.lng === null)
          ? "Foto guardada. Ingrese coordenadas o marque en mapa para registrar avance."
          : "Evidencia fotográfica guardada y vinculada al tramo."
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la evidencia.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-foreground/10 bg-muted/10 p-4">
      <div>
        <h4 className="text-sm font-medium">Subir evidencia fotográfica</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Fotos con GPS del celular se georreferencian automáticamente y quedan vinculadas a este
          tramo.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tramo-evidencia-imagen">Imágenes</Label>
        <input
          key={fileInputKey}
          id="tramo-evidencia-imagen"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => void handleArchivosChange(e.target.files)}
          className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        {archivos.length > 0 ? (
          <p className="text-xs text-muted-foreground">{archivos.length} archivo(s) seleccionado(s)</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tramo-evidencia-fecha">Fecha y hora</Label>
        <input
          id="tramo-evidencia-fecha"
          type="datetime-local"
          value={fechaCaptura}
          onChange={(e) => setFechaCaptura(e.target.value)}
          required
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tramo-evidencia-lat">Latitud</Label>
          <input
            id="tramo-evidencia-lat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="-1.23456"
            className={INPUT_CLASS}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tramo-evidencia-lng">Longitud</Label>
          <input
            id="tramo-evidencia-lng"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="-79.12345"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tramo-evidencia-desc">Descripción</Label>
        <input
          id="tramo-evidencia-desc"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          id="tramo-evidencia-registrar-avance"
          type="checkbox"
          checked={registrarAvance}
          onChange={(e) => setRegistrarAvance(e.target.checked)}
          className="mt-1 size-4 rounded border-border"
        />
        <Label htmlFor="tramo-evidencia-registrar-avance" className="cursor-pointer text-sm">
          Registrar avance con esta foto
        </Label>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {mensaje ? <p className="text-sm text-muted-foreground">{mensaje}</p> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Subiendo..." : "Subir evidencia"}
      </Button>
    </form>
  )
}
