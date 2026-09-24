"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CanalTramo } from "@/src/data/tramos/types"
import { ESTADOS_TRAMO_MAPA, etiquetaEstadoTramo } from "@/src/data/tramos/types"
import type { PropuestaPuntoMinitramo, TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import { calcularPropuestaPunto } from "@/src/lib/tramo-geometria"

const MiniMapaTramoPunto = dynamic(
  () => import("@/src/components/mapa/MiniMapaTramoPunto").then((m) => m.MiniMapaTramoPunto),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Cargando mapa...
      </div>
    ),
  }
)

export type ConfirmarPuntoPayload = {
  tramo: CanalTramo
  punto: PropuestaPuntoMinitramo["punto"]
  rol: string
  orden: number
  estado: PropuestaPuntoMinitramo["estado_sugerido"]
  registro_foto_id?: string | null
  modo?: "nuevo" | "corregir"
  puntoId?: string
}

type ConfirmarPuntoMinitramoModalProps = {
  open: boolean
  propuestaInicial: PropuestaPuntoMinitramo | null
  puntosPrevios: TramoPuntoAvance[]
  registroFotoId?: string | null
  modo?: "nuevo" | "corregir"
  puntoId?: string
  loading?: boolean
  onConfirm: (payload: ConfirmarPuntoPayload) => Promise<void>
  onCancel: () => void
}

const INPUT_CLASS = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"

export function ConfirmarPuntoMinitramoModal({
  open,
  propuestaInicial,
  puntosPrevios,
  registroFotoId,
  modo = "nuevo",
  puntoId,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmarPuntoMinitramoModalProps) {
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [estado, setEstado] = useState<PropuestaPuntoMinitramo["estado_sugerido"]>("pendiente")

  useEffect(() => {
    if (!propuestaInicial) return
    setLat(propuestaInicial.punto.lat.toFixed(7))
    setLng(propuestaInicial.punto.lng.toFixed(7))
    setEstado(propuestaInicial.estado_sugerido)
  }, [propuestaInicial])

  const latNum = Number(lat)
  const lngNum = Number(lng)
  const coordsValidas = !Number.isNaN(latNum) && !Number.isNaN(lngNum)

  const propuesta = useMemo(() => {
    if (!propuestaInicial || !coordsValidas) return null
    return calcularPropuestaPunto(propuestaInicial.tramo, puntosPrevios, latNum, lngNum, {
      orden: propuestaInicial.orden,
      ...(modo === "corregir" && puntoId ? { excluirPuntoId: puntoId } : {}),
    })
  }, [propuestaInicial, puntosPrevios, latNum, lngNum, coordsValidas, modo, puntoId])

  if (!open || !propuestaInicial) return null

  const esCorreccion = modo === "corregir"

  async function handleConfirmar() {
    if (!propuesta) return
    await onConfirm({
      tramo: propuesta.tramo,
      punto: propuesta.punto,
      rol: propuesta.rol,
      orden: propuesta.orden,
      estado,
      registro_foto_id: registroFotoId,
      modo: esCorreccion ? "corregir" : "nuevo",
      puntoId: esCorreccion ? puntoId : undefined,
    })
  }

  const puntosConfirmados = puntosPrevios
    .filter((p) => p.tramo_id === propuestaInicial.tramo.id && p.confirmado && p.rol)
    .filter((p) => !(esCorreccion && p.id === puntoId))
    .map((p) => ({
      lat: p.lat,
      lng: p.lng,
      letra: p.rol!.toUpperCase(),
    }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmar-punto-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-foreground/10 bg-background p-5 shadow-xl">
        <h2 id="confirmar-punto-title" className="text-lg font-semibold">
          {esCorreccion
            ? `Corregir punto ${propuestaInicial.letra}`
            : `Confirmar punto ${propuestaInicial.letra}`}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Revise la posición proyectada sobre el trazado del tramo antes de guardar.
        </p>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="confirmar-lat">Latitud</Label>
              <input
                id="confirmar-lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmar-lng">Longitud</Label>
              <input
                id="confirmar-lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {coordsValidas ? (
            <MiniMapaTramoPunto
              tramo={propuestaInicial.tramo}
              puntoEdicion={{
                lat: latNum,
                lng: lngNum,
                letra: propuestaInicial.letra,
                editable: true,
              }}
              puntosConfirmados={puntosConfirmados}
              puntosAvance={puntosPrevios.filter((p) => p.tramo_id === propuestaInicial.tramo.id)}
              onPointMove={(newLat, newLng) => {
                setLat(newLat.toFixed(7))
                setLng(newLng.toFixed(7))
              }}
            />
          ) : null}

          {propuesta ? (
            <div className="space-y-2 rounded-lg border border-foreground/10 bg-muted/20 p-3 text-sm">
              <p>{propuesta.mensaje}</p>
              <p>
                <span className="text-muted-foreground">Abscisa:</span>{" "}
                {propuesta.punto.abscisa_m.toFixed(1)} m
              </p>
              <p>
                <span className="text-muted-foreground">Distancia al tramo:</span>{" "}
                {propuesta.distancia_m.toFixed(1)} m
              </p>
              {propuesta.cierraMinitramo ? (
                <p className="text-xs text-muted-foreground">
                  Avance acumulado propuesto: {propuesta.avance_pct_propuesto.toFixed(1)}%
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-destructive">Coordenadas no válidas.</p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="confirmar-estado">Estado del tramo</Label>
            <Select value={estado} onValueChange={(v) => setEstado(v as typeof estado)}>
              <SelectTrigger id="confirmar-estado" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_TRAMO_MAPA.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {propuesta ? (
              <p className="text-xs text-muted-foreground">
                Sugerido: {etiquetaEstadoTramo(propuesta.estado_sugerido)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirmar()}
            disabled={loading || !propuesta}
          >
            {loading
              ? "Guardando..."
              : esCorreccion
                ? `Confirmar corrección ${propuestaInicial.letra}`
                : `Confirmar punto ${propuestaInicial.letra}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
