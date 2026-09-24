"use client"

import { useEffect, useMemo } from "react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CanalTramo } from "@/src/data/tramos/types"
import type { PropuestaPuntoMinitramo, TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import {
  calcularPropuestaPuntoDesdeGps,
  detectarTramoDesdeCoordenada,
  DISTANCIA_MAX_DETECCION_M,
} from "@/src/lib/tramo-geometria"

type AvancePorUbicacionBlockProps = {
  lat: string
  lng: string
  tramos: CanalTramo[]
  puntosPrevios: TramoPuntoAvance[]
  tramoIdSeleccionado: string
  onTramoChange: (tramoId: string) => void
  registrarAvance: boolean
  onRegistrarAvanceChange: (value: boolean) => void
}

export function AvancePorUbicacionBlock({
  lat,
  lng,
  tramos,
  puntosPrevios,
  tramoIdSeleccionado,
  onTramoChange,
  registrarAvance,
  onRegistrarAvanceChange,
}: AvancePorUbicacionBlockProps) {
  const latNum = Number(lat.trim())
  const lngNum = Number(lng.trim())
  const coordsValidas = lat.trim() !== "" && lng.trim() !== "" && !Number.isNaN(latNum) && !Number.isNaN(lngNum)

  const deteccion = useMemo(() => {
    if (!coordsValidas) return null
    return detectarTramoDesdeCoordenada(latNum, lngNum, tramos)
  }, [coordsValidas, latNum, lngNum, tramos])

  useEffect(() => {
    if (deteccion) {
      onTramoChange(deteccion.tramo.id)
    }
  }, [deteccion, onTramoChange])

  const tramoActivo = useMemo(
    () => tramos.find((t) => t.id === tramoIdSeleccionado) ?? deteccion?.tramo ?? null,
    [tramos, tramoIdSeleccionado, deteccion]
  )

  const propuesta: PropuestaPuntoMinitramo | null = useMemo(() => {
    if (!coordsValidas || !tramoActivo) return null
    return calcularPropuestaPuntoDesdeGps(tramoActivo, puntosPrevios, latNum, lngNum)
  }, [coordsValidas, tramoActivo, puntosPrevios, latNum, lngNum])

  if (!coordsValidas) {
    return (
      <div className="rounded-lg border border-dashed border-foreground/15 bg-muted/10 p-3 text-sm text-muted-foreground">
        Ingrese latitud y longitud (o suba una foto con GPS) para detectar el tramo de desasolve.
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-foreground/10 bg-muted/10 p-4">
      <div className="flex items-start gap-2">
        <input
          id="registrar-avance"
          type="checkbox"
          checked={registrarAvance}
          onChange={(e) => onRegistrarAvanceChange(e.target.checked)}
          className="mt-1 size-4 rounded border-border"
        />
        <div>
          <Label htmlFor="registrar-avance" className="cursor-pointer font-medium">
            Registrar avance de desasolve con esta foto
          </Label>
          <p className="text-xs text-muted-foreground">
            Tras subir la evidencia podrá confirmar el siguiente punto en secuencia (A, B, C…).
          </p>
        </div>
      </div>

      {registrarAvance ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="tramo-detectado">Tramo detectado</Label>
            <Select value={tramoIdSeleccionado || deteccion?.tramo.id || ""} onValueChange={onTramoChange}>
              <SelectTrigger id="tramo-detectado" className="h-10 w-full">
                <SelectValue placeholder="Sin tramo cercano" />
              </SelectTrigger>
              <SelectContent>
                {tramos.map((tramo) => (
                  <SelectItem key={tramo.id} value={tramo.id}>
                    {tramo.codigo} · {tramo.canal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {deteccion ? (
              <p className="text-xs text-muted-foreground">
                Detección automática a {deteccion.proyeccion.distancia_m.toFixed(1)} m del tramo (
                umbral {DISTANCIA_MAX_DETECCION_M} m).
              </p>
            ) : (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                No hay tramo dentro de {DISTANCIA_MAX_DETECCION_M} m. Seleccione manualmente si conoce
                el tramo.
              </p>
            )}
          </div>

          {propuesta ? (
            <div className="rounded-lg border border-foreground/10 bg-background p-3 text-sm">
              <p className="font-medium">Propuesta preliminar</p>
              <p className="mt-1 text-muted-foreground">{propuesta.mensaje}</p>
              <p className="mt-2">
                Punto {propuesta.letra}: {propuesta.punto.abscisa_m.toFixed(1)} m · Avance acumulado
                propuesto: {propuesta.avance_pct_propuesto.toFixed(1)}%
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
