"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { Crosshair, LocateOff, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UbicacionUsuario } from "@/src/components/mapa/UbicacionUsuarioEnMapa"
import type { CanalTramo } from "@/src/data/tramos/types"
import { useGeolocalizacion } from "@/src/hooks/use-geolocalizacion"
import { parseCoordenadasDesdeTexto } from "@/src/lib/coordenadas-evidencia"
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

type MapaUbicacionResidenteProviderProps = {
  tramos: CanalTramo[]
  puntosAvance: TramoPuntoAvance[]
  onUbicacionChange: (ubicacion: UbicacionUsuario | null, seguir: boolean) => void
  onTramoDetectado?: (tramo: CanalTramo | null) => void
  onSolicitarConfirmacion: (propuesta: PropuestaPuntoMinitramo) => void
  onRequiereConfigurarOrigen: (payload: RequiereOrigenDesdeMapaPayload) => void
  onCentrarMapaEnUbicacion?: () => void
  children: ReactNode
}

type BuscarCoordenadasResult = { ok: true } | { ok: false; error: string }

type UbicacionResidenteContextValue = {
  estadoGps: ReturnType<typeof useGeolocalizacion>["estado"]
  posicionGps: ReturnType<typeof useGeolocalizacion>["posicion"]
  posicionManual: UbicacionUsuario | null
  posicionEfectiva: UbicacionUsuario | null
  errorGps: string | null
  gpsActivo: boolean
  deteccion: ReturnType<typeof detectarTramoDesdeCoordenada>
  puedeRegistrar: boolean
  lineaEstado: string | null
  mensajeLocal: string | null
  handleToggleGps: () => void
  handleRegistrarPunto: () => void
  buscarPorTextoCoordenadas: (texto: string) => BuscarCoordenadasResult
  limpiarBusquedaCoordenadas: () => void
}

const UbicacionResidenteContext = createContext<UbicacionResidenteContextValue | null>(null)

export function useMapaUbicacionResidente() {
  const ctx = useContext(UbicacionResidenteContext)
  if (!ctx) {
    throw new Error("useMapaUbicacionResidente debe usarse dentro de MapaUbicacionResidenteProvider")
  }
  return ctx
}

function useUbicacionResidenteContext() {
  return useMapaUbicacionResidente()
}

export function MapaUbicacionResidenteProvider({
  tramos,
  puntosAvance,
  onUbicacionChange,
  onTramoDetectado,
  onSolicitarConfirmacion,
  onRequiereConfigurarOrigen,
  onCentrarMapaEnUbicacion,
  children,
}: MapaUbicacionResidenteProviderProps) {
  const [mensajeLocal, setMensajeLocal] = useState<string | null>(null)
  const [posicionManual, setPosicionManual] = useState<UbicacionUsuario | null>(null)

  const {
    estado: estadoGps,
    posicion: posicionGps,
    error: errorGps,
    activo: gpsActivo,
    iniciarSeguimiento,
    detenerSeguimiento,
  } = useGeolocalizacion()

  const posicionEfectiva = useMemo(
    () => posicionManual ?? (gpsActivo ? posicionGps : null),
    [posicionManual, gpsActivo, posicionGps]
  )

  const seguirUbicacion = gpsActivo && Boolean(posicionGps) && !posicionManual

  useEffect(() => {
    onUbicacionChange(posicionEfectiva, seguirUbicacion)
  }, [posicionEfectiva, seguirUbicacion, onUbicacionChange])

  useEffect(() => {
    return () => {
      onUbicacionChange(null, false)
      detenerSeguimiento()
    }
  }, [detenerSeguimiento, onUbicacionChange])

  const deteccion = useMemo(() => {
    if (!posicionEfectiva) return null
    return detectarTramoDesdeCoordenada(posicionEfectiva.lat, posicionEfectiva.lng, tramos)
  }, [posicionEfectiva, tramos])

  useEffect(() => {
    onTramoDetectado?.(deteccion?.tramo ?? null)
  }, [deteccion, onTramoDetectado])

  const limpiarBusquedaCoordenadas = useCallback(() => {
    setPosicionManual(null)
  }, [])

  const buscarPorTextoCoordenadas = useCallback(
    (texto: string): BuscarCoordenadasResult => {
      setMensajeLocal(null)
      const parsed = parseCoordenadasDesdeTexto(texto)
      if (!parsed.ok) {
        return { ok: false, error: parsed.error }
      }
      setPosicionManual({
        lat: parsed.lat,
        lng: parsed.lng,
        precision_m: parsed.precision_m,
      })
      onCentrarMapaEnUbicacion?.()
      return { ok: true }
    },
    [onCentrarMapaEnUbicacion]
  )

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
    if (!posicionEfectiva || !deteccion) return

    const { tramo } = deteccion
    const { lat, lng } = posicionEfectiva
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

  const puedeRegistrar = Boolean(posicionEfectiva && deteccion)

  const lineaEstado = (() => {
    if (posicionManual) {
      if (mensajeLocal) return mensajeLocal
      if (deteccion) {
        return `${deteccion.tramo.codigo} · ${deteccion.proyeccion.distancia_m.toFixed(0)} m · búsqueda`
      }
      return `Sin tramo a ${DISTANCIA_MAX_DETECCION_M} m — acérquese al canal`
    }
    if (estadoGps === "solicitando") return "Obteniendo ubicación GPS…"
    if (errorGps) return errorGps
    if (mensajeLocal) return mensajeLocal
    if (!posicionEfectiva) return null
    if (deteccion) {
      return `${deteccion.tramo.codigo} · ${deteccion.proyeccion.distancia_m.toFixed(0)} m · ±${posicionEfectiva.precision_m.toFixed(0)} m`
    }
    return `Sin tramo a ${DISTANCIA_MAX_DETECCION_M} m — acérquese al canal`
  })()

  const value: UbicacionResidenteContextValue = {
    estadoGps,
    posicionGps,
    posicionManual,
    posicionEfectiva,
    errorGps,
    gpsActivo,
    deteccion,
    puedeRegistrar,
    lineaEstado,
    mensajeLocal,
    handleToggleGps,
    handleRegistrarPunto,
    buscarPorTextoCoordenadas,
    limpiarBusquedaCoordenadas,
  }

  return (
    <UbicacionResidenteContext.Provider value={value}>{children}</UbicacionResidenteContext.Provider>
  )
}

function BotonesUbicacionResidente({ barraMapa }: { barraMapa?: boolean }) {
  const { gpsActivo, posicionEfectiva, puedeRegistrar, handleToggleGps, handleRegistrarPunto } =
    useUbicacionResidenteContext()

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={gpsActivo ? "secondary" : "outline"}
        size={barraMapa ? "default" : "sm"}
        className={cn(
          "min-h-11 flex-1 text-xs shadow-sm",
          barraMapa && "border-foreground/15 bg-background/95 backdrop-blur-sm"
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
      {posicionEfectiva ? (
        <Button
          type="button"
          size={barraMapa ? "default" : "sm"}
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
}

export function MapaUbicacionResidenteBarra({ className }: { className?: string }) {
  const { lineaEstado, errorGps, mensajeLocal, deteccion } = useUbicacionResidenteContext()

  const esAlerta = Boolean(errorGps || mensajeLocal)

  return (
    <div className={cn("space-y-1.5", className)}>
      {lineaEstado ? (
        <p
          className={cn(
            "rounded-md px-2 py-1 text-center text-[11px] leading-snug shadow-sm backdrop-blur-sm",
            esAlerta
              ? "border border-destructive/30 bg-destructive/10 text-destructive"
              : deteccion
                ? "border border-foreground/10 bg-background/90 text-foreground"
                : "border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100"
          )}
          role={esAlerta ? "alert" : undefined}
        >
          {lineaEstado}
        </p>
      ) : null}
      <BotonesUbicacionResidente barraMapa />
    </div>
  )
}

export function MapaUbicacionResidentePanel({ className }: { className?: string }) {
  const {
    estadoGps,
    posicionEfectiva,
    posicionManual,
    errorGps,
    deteccion,
    mensajeLocal,
  } = useUbicacionResidenteContext()

  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border border-foreground/10 bg-muted/10 px-3 py-2.5",
        className
      )}
    >
      <p className="text-xs font-medium text-foreground">Ubicación en campo</p>
      <BotonesUbicacionResidente />

      {estadoGps === "solicitando" && !posicionManual ? (
        <p className="text-xs text-muted-foreground">Obteniendo ubicación GPS…</p>
      ) : null}

      {errorGps && !posicionManual ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive"
          role="alert"
        >
          {errorGps}
        </p>
      ) : null}

      {posicionEfectiva ? (
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            {posicionManual ? "Coordenadas buscadas" : "Precisión GPS"}:{" "}
            <span className="font-medium text-foreground">
              {posicionManual
                ? `${posicionEfectiva.lat.toFixed(6)}, ${posicionEfectiva.lng.toFixed(6)}`
                : `±${posicionEfectiva.precision_m.toFixed(0)} m`}
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

/** @deprecated Use Provider + Panel/Barra; kept for compatibility if imported elsewhere */
export function MapaUbicacionResidenteBlock(
  props: Omit<MapaUbicacionResidenteProviderProps, "children"> & {
    className?: string
    variant?: "default" | "barraMapa"
  }
) {
  const { className, variant = "default", ...providerProps } = props
  return (
    <MapaUbicacionResidenteProvider {...providerProps}>
      {variant === "barraMapa" ? (
        <MapaUbicacionResidenteBarra className={className} />
      ) : (
        <MapaUbicacionResidentePanel className={className} />
      )}
    </MapaUbicacionResidenteProvider>
  )
}
