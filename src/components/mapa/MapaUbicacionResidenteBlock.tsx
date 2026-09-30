"use client"

import { Crosshair, LocateOff, MapPin } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UbicacionUsuario } from "@/src/components/mapa/UbicacionUsuarioEnMapa"
import type { CanalTramo } from "@/src/data/tramos/types"
import { useGeolocalizacion } from "@/src/hooks/use-geolocalizacion"
import type { PropuestaPuntoMinitramo, TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import {
  detectarTramoDesdeCoordenada,
  DISTANCIA_MAX_DETECCION_M,
  evaluarPropuestaPunto,
  tramoRequiereConfigurarOrigen,
} from "@/src/lib/tramo-geometria"

export type RequiereOrigenDesdeMapaPayload = {
  tramo: CanalTramo
  lat: number
  lng: number
}

type MapaUbicacionResidenteBlockProps = {
  tramos: CanalTramo[]
  puntosAvance: TramoPuntoAvance[]
  className?: string
  variant?: "default" | "barraMapa"
  onUbicacionChange: (ubicacion: UbicacionUsuario | null, seguir: boolean) => void
  onTramoDetectado?: (tramo: CanalTramo | null) => void
  onSolicitarConfirmacion: (propuesta: PropuestaPuntoMinitramo) => void
  onRequiereConfigurarOrigen: (payload: RequiereOrigenDesdeMapaPayload) => void
}

export function MapaUbicacionResidenteBlock({
  tramos,
  puntosAvance,
  className,
  variant = "default",
  onUbicacionChange,
  onTramoDetectado,
  onSolicitarConfirmacion,
  onRequiereConfigurarOrigen,
}: MapaUbicacionResidenteBlockProps) {
  const [mensajeLocal, setMensajeLocal] = useState<string | null>(null)
  const esBarraMapa = variant === "barraMapa"

  const {
    estado: estadoGps,
    posicion: posicionGps,
    error: errorGps,
    activo: gpsActivo,
    iniciarSeguimiento,
    detenerSeguimiento,
  } = useGeolocalizacion()

  const seguirUbicacion = gpsActivo && Boolean(posicionGps)

  useEffect(() => {
    onUbicacionChange(posicionGps, seguirUbicacion)
  }, [posicionGps, seguirUbicacion, onUbicacionChange])

  useEffect(() => {
    return () => {
      onUbicacionChange(null, false)
      detenerSeguimiento()
    }
  }, [detenerSeguimiento, onUbicacionChange])

  const deteccion = useMemo(() => {
    if (!posicionGps) return null
    return detectarTramoDesdeCoordenada(posicionGps.lat, posicionGps.lng, tramos)
  }, [posicionGps, tramos])

  useEffect(() => {
    onTramoDetectado?.(deteccion?.tramo ?? null)
  }, [deteccion, onTramoDetectado])

  function handleToggleGps() {
    setMensajeLocal(null)
    if (gpsActivo) {
      detenerSeguimiento()
    } else {
      iniciarSeguimiento()
    }
  }

  function handleRegistrarPunto() {
    setMensajeLocal(null)
    if (!posicionGps || !deteccion) return

    const { tramo } = deteccion
    const { lat, lng } = posicionGps
    const puntosDelTramo = puntosAvance.filter((p) => p.tramo_id === tramo.id && p.confirmado)

    if (tramoRequiereConfigurarOrigen(tramo, puntosDelTramo)) {
      onRequiereConfigurarOrigen({ tramo, lat, lng })
      return
    }

    const { propuesta, motivoBloqueo } = evaluarPropuestaPunto(tramo, puntosDelTramo, lat, lng)
    if (!propuesta) {
      setMensajeLocal(motivoBloqueo ?? "No se pudo calcular el punto en este tramo.")
      return
    }

    onSolicitarConfirmacion(propuesta)
  }

  const puedeRegistrar = Boolean(posicionGps && deteccion)

  const lineaEstado = (() => {
    if (estadoGps === "solicitando") return "Obteniendo ubicación GPS…"
    if (errorGps) return errorGps
    if (mensajeLocal) return mensajeLocal
    if (!posicionGps) return null
    if (deteccion) {
      return `${deteccion.tramo.codigo} · ${deteccion.proyeccion.distancia_m.toFixed(0)} m · ±${posicionGps.precision_m.toFixed(0)} m`
    }
    return `Sin tramo a ${DISTANCIA_MAX_DETECCION_M} m — acérquese al canal`
  })()

  const botones = (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={gpsActivo ? "secondary" : "outline"}
        size={esBarraMapa ? "default" : "sm"}
        className={cn(
          "min-h-11 flex-1 text-xs shadow-sm",
          esBarraMapa && "border-foreground/15 bg-background/95 backdrop-blur-sm"
        )}
        onClick={handleToggleGps}
      >
        {gpsActivo ? (
          <>
            <LocateOff className="mr-1.5 size-4 shrink-0" aria-hidden />
            Ocultar GPS
          </>
        ) : (
          <>
            <Crosshair className="mr-1.5 size-4 shrink-0" aria-hidden />
            Mi ubicación
          </>
        )}
      </Button>
      {gpsActivo && posicionGps ? (
        <Button
          type="button"
          size={esBarraMapa ? "default" : "sm"}
          className="min-h-11 flex-1 text-xs shadow-sm"
          disabled={!puedeRegistrar}
          onClick={handleRegistrarPunto}
        >
          <MapPin className="mr-1.5 size-4 shrink-0" aria-hidden />
          Registrar punto
        </Button>
      ) : null}
    </div>
  )

  if (esBarraMapa) {
    return (
      <div className={cn("space-y-1.5", className)}>
        {lineaEstado ? (
          <p
            className={cn(
              "rounded-md px-2 py-1 text-center text-[11px] leading-snug shadow-sm backdrop-blur-sm",
              errorGps || mensajeLocal
                ? "border border-destructive/30 bg-destructive/10 text-destructive"
                : deteccion
                  ? "border border-foreground/10 bg-background/90 text-foreground"
                  : "border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100"
            )}
            role={errorGps || mensajeLocal ? "alert" : undefined}
          >
            {lineaEstado}
          </p>
        ) : null}
        {botones}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border border-foreground/10 bg-muted/10 px-3 py-2.5",
        className
      )}
    >
      <p className="text-xs font-medium text-foreground">Ubicación en campo</p>
      {botones}

      {estadoGps === "solicitando" ? (
        <p className="text-xs text-muted-foreground">Obteniendo ubicación GPS…</p>
      ) : null}

      {errorGps ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive"
          role="alert"
        >
          {errorGps}
        </p>
      ) : null}

      {posicionGps ? (
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            Precisión GPS:{" "}
            <span className="font-medium text-foreground">
              ±{posicionGps.precision_m.toFixed(0)} m
            </span>
          </p>
          {deteccion ? (
            <p>
              Tramo detectado:{" "}
              <span className="font-medium text-foreground">{deteccion.tramo.codigo}</span> ·{" "}
              {deteccion.proyeccion.distancia_m.toFixed(1)} m del trazado
            </p>
          ) : (
            <p className="text-amber-700 dark:text-amber-400">
              No hay tramo dentro de {DISTANCIA_MAX_DETECCION_M} m. Acérquese al canal para registrar
              un punto.
            </p>
          )}
        </div>
      ) : null}

      {mensajeLocal ? (
        <p className="text-xs text-destructive" role="alert">
          {mensajeLocal}
        </p>
      ) : null}
    </div>
  )
}
