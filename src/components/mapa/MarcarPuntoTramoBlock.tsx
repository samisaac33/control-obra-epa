"use client"

import dynamic from "next/dynamic"
import { Crosshair, Link2, LocateFixed, LocateOff } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import type { CanalTramo } from "@/src/data/tramos/types"
import { useGeolocalizacion } from "@/src/hooks/use-geolocalizacion"
import { MinitramosResumenAccordion } from "@/src/components/mapa/MinitramosResumenAccordion"
import type { EstadoTramo } from "@/src/data/tramos/types"
import {
  calcularPropuestaPunto,
  DISTANCIA_MAX_DETECCION_M,
  etiquetaLetra,
  intervalosDesdePuntos,
  metrosDesdeIntervalos,
  ordenDesdeRol,
  posicionInicialPunto,
  proyectarPuntoEnLinea,
  resumenMinitramos,
  siguienteLetraPunto,
  ultimoPuntoConfirmadoTramo,
  type ModoMarcadoTramo,
  type PropuestaPuntoMinitramo,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"

const MiniMapaTramoPunto = dynamic(
  () => import("@/src/components/mapa/MiniMapaTramoPunto").then((m) => m.MiniMapaTramoPunto),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Cargando mapa...
      </div>
    ),
  }
)

export type SolicitarConfirmacionMarcarOptions = {
  modo?: ModoMarcadoTramo
  puntoId?: string
}

type MarcarPuntoTramoBlockProps = {
  tramo: CanalTramo
  puntosPrevios: TramoPuntoAvance[]
  isResident?: boolean
  guardandoEstadoMinitramoId?: string | null
  onEstadoMinitramoChange?: (puntoFinId: string, estado: EstadoTramo) => void | Promise<void>
  onSolicitarConfirmacion: (
    propuesta: PropuestaPuntoMinitramo,
    opciones?: SolicitarConfirmacionMarcarOptions
  ) => void
}

export function MarcarPuntoTramoBlock({
  tramo,
  puntosPrevios,
  isResident = false,
  guardandoEstadoMinitramoId = null,
  onEstadoMinitramoChange,
  onSolicitarConfirmacion,
}: MarcarPuntoTramoBlockProps) {
  const puntosDelTramo = useMemo(
    () => puntosPrevios.filter((p) => p.tramo_id === tramo.id && p.confirmado),
    [puntosPrevios, tramo.id]
  )

  const ultimoPunto = useMemo(
    () => ultimoPuntoConfirmadoTramo(puntosDelTramo, tramo.id),
    [puntosDelTramo, tramo.id]
  )
  const puedeCorregir = ultimoPunto !== null

  const [modoMarcado, setModoMarcado] = useState<ModoMarcadoTramo>("nuevo")

  const letraActual = useMemo(() => {
    if (modoMarcado === "corregir" && ultimoPunto?.rol) {
      return etiquetaLetra(ultimoPunto.rol)
    }
    return etiquetaLetra(siguienteLetraPunto(puntosDelTramo, tramo.id))
  }, [modoMarcado, ultimoPunto, puntosDelTramo, tramo.id])

  const posicionInicial = useMemo(
    () =>
      modoMarcado === "corregir" && ultimoPunto
        ? {
            lat: ultimoPunto.lat,
            lng: ultimoPunto.lng,
            abscisa_m: ultimoPunto.abscisa_m,
          }
        : posicionInicialPunto(tramo, puntosDelTramo),
    [modoMarcado, ultimoPunto, tramo, puntosDelTramo]
  )

  const [lat, setLat] = useState(() => posicionInicial.lat)
  const [lng, setLng] = useState(() => posicionInicial.lng)
  const [seguirEnMapa, setSeguirEnMapa] = useState(false)

  const {
    estado: estadoGps,
    posicion: posicionGps,
    error: errorGps,
    activo: gpsActivo,
    iniciarSeguimiento,
    detenerSeguimiento,
  } = useGeolocalizacion()

  const propuestaEnlazarGps = useMemo(() => {
    if (!posicionGps || modoMarcado === "corregir") return null
    return calcularPropuestaPunto(tramo, puntosDelTramo, posicionGps.lat, posicionGps.lng)
  }, [tramo, puntosDelTramo, posicionGps, modoMarcado])

  const propuestaEfectiva = useMemo(() => {
    const opciones =
      modoMarcado === "corregir" && ultimoPunto?.rol
        ? {
            excluirPuntoId: ultimoPunto.id,
            orden: ordenDesdeRol(ultimoPunto.rol),
          }
        : undefined
    return calcularPropuestaPunto(tramo, puntosDelTramo, lat, lng, opciones)
  }, [tramo, puntosDelTramo, lat, lng, modoMarcado, ultimoPunto])

  const resumen = useMemo(() => resumenMinitramos(puntosDelTramo, tramo.id), [puntosDelTramo, tramo.id])

  const avanceAcumulado = useMemo(() => {
    const intervalos = intervalosDesdePuntos(puntosDelTramo, tramo.id)
    const metros = metrosDesdeIntervalos(intervalos, tramo.longitud_m)
    return tramo.longitud_m > 0 ? (metros / tramo.longitud_m) * 100 : 0
  }, [puntosDelTramo, tramo.id, tramo.longitud_m])

  const puntosConfirmadosMapa = useMemo(
    () =>
      puntosDelTramo
        .filter((p) => p.rol && !(modoMarcado === "corregir" && p.id === ultimoPunto?.id))
        .map((p) => ({
          lat: p.lat,
          lng: p.lng,
          letra: etiquetaLetra(p.rol!),
        })),
    [puntosDelTramo, modoMarcado, ultimoPunto?.id]
  )

  useEffect(() => {
    if (modoMarcado === "corregir" && !puedeCorregir) {
      setModoMarcado("nuevo")
    }
  }, [modoMarcado, puedeCorregir, tramo.id])

  useEffect(() => {
    setLat(posicionInicial.lat)
    setLng(posicionInicial.lng)
  }, [tramo.id, puntosDelTramo.length, modoMarcado, ultimoPunto?.id, posicionInicial.lat, posicionInicial.lng])

  useEffect(() => {
    return () => detenerSeguimiento()
  }, [detenerSeguimiento])

  useEffect(() => {
    if (!gpsActivo) setSeguirEnMapa(false)
  }, [gpsActivo])

  const distanciaAlTramo = useMemo(() => {
    if (!posicionGps) return null
    const proyeccion = proyectarPuntoEnLinea(
      posicionGps.lat,
      posicionGps.lng,
      tramo.geometria
    )
    return proyeccion?.distancia_m ?? null
  }, [posicionGps, tramo.geometria])

  function handleToggleGps() {
    if (gpsActivo) {
      detenerSeguimiento()
      setSeguirEnMapa(false)
    } else {
      iniciarSeguimiento()
    }
  }

  function handlePointMove(newLat: number, newLng: number) {
    setLat(newLat)
    setLng(newLng)
  }

  function handleEnlazarGps() {
    if (!propuestaEnlazarGps) return
    setLat(propuestaEnlazarGps.punto.lat)
    setLng(propuestaEnlazarGps.punto.lng)
    onSolicitarConfirmacion(propuestaEnlazarGps, { modo: "nuevo" })
  }

  const esCorreccion = modoMarcado === "corregir" && ultimoPunto !== null

  return (
    <div className="space-y-3 rounded-lg border border-foreground/10 bg-muted/10 p-4">
      <div>
        <h4 className="text-sm font-medium">Marcar minitramos en mapa</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Confirme punto a punto (A, B, C, D…). Cada tramo consecutivo (A–B, B–C, C–D…) forma un
          minitramo ejecutado en verde.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={modoMarcado === "nuevo" ? "default" : "outline"}
          size="sm"
          className="h-9 text-xs"
          onClick={() => setModoMarcado("nuevo")}
        >
          Registrar nuevo punto
        </Button>
        <Button
          type="button"
          variant={modoMarcado === "corregir" ? "default" : "outline"}
          size="sm"
          className="h-9 text-xs"
          disabled={!puedeCorregir}
          onClick={() => setModoMarcado("corregir")}
        >
          Corregir último punto
        </Button>
      </div>

      <p className="text-xs font-medium text-foreground">
        {esCorreccion
          ? `Corrigiendo punto ${letraActual}`
          : `Próximo punto: ${letraActual}`}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={gpsActivo ? "default" : "outline"}
          size="sm"
          className="h-8 flex-1 text-xs"
          onClick={handleToggleGps}
        >
          {gpsActivo ? (
            <>
              <LocateOff className="mr-1.5 size-3.5" aria-hidden />
              Ocultar ubicación
            </>
          ) : (
            <>
              <Crosshair className="mr-1.5 size-3.5" aria-hidden />
              Mostrar mi ubicación
            </>
          )}
        </Button>
        {gpsActivo && posicionGps ? (
          <>
            <Button
              type="button"
              variant={seguirEnMapa ? "default" : "outline"}
              size="sm"
              className="h-8 flex-1 text-xs"
              onClick={() => setSeguirEnMapa((prev) => !prev)}
            >
              <LocateFixed className="mr-1.5 size-3.5" aria-hidden />
              {seguirEnMapa ? "Dejar de seguir" : "Seguir en mapa"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 w-full text-xs"
              disabled={!propuestaEnlazarGps || modoMarcado === "corregir"}
              onClick={handleEnlazarGps}
            >
              <Link2 className="mr-1.5 size-3.5" aria-hidden />
              Enlazar
            </Button>
          </>
        ) : null}
      </div>

      {estadoGps === "solicitando" ? (
        <p className="text-xs text-muted-foreground">Obteniendo ubicación GPS…</p>
      ) : null}

      {errorGps ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive" role="alert">
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
          {distanciaAlTramo !== null ? (
            distanciaAlTramo > DISTANCIA_MAX_DETECCION_M ? (
              <p className="text-amber-700 dark:text-amber-400">
                Está a {distanciaAlTramo.toFixed(1)} m del tramo (umbral{" "}
                {DISTANCIA_MAX_DETECCION_M} m). Coloque el marcador manualmente sobre el canal.
              </p>
            ) : (
              <p>
                Distancia al tramo:{" "}
                <span className="font-medium text-foreground">
                  {distanciaAlTramo.toFixed(1)} m
                </span>
              </p>
            )
          ) : null}
        </div>
      ) : null}

      <MiniMapaTramoPunto
        tramo={tramo}
        puntoEdicion={{ lat, lng, letra: letraActual, editable: true }}
        puntosConfirmados={puntosConfirmadosMapa}
        puntosAvance={puntosDelTramo}
        height="260px"
        scrollWheelZoom
        onPointMove={handlePointMove}
        ubicacionUsuario={posicionGps}
        seguirUbicacion={seguirEnMapa}
      />

      <div className="rounded-lg border border-foreground/10 bg-background p-3 text-sm space-y-2">
        <p className="font-medium">Resumen de minitramos</p>

        {resumen.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin minitramos confirmados aún.</p>
        ) : (
          <MinitramosResumenAccordion
            items={resumen}
            isResident={isResident}
            guardandoEstadoId={guardandoEstadoMinitramoId}
            onEstadoChange={onEstadoMinitramoChange}
            compact
          />
        )}

        <p className="border-t border-foreground/10 pt-2 text-xs text-muted-foreground">
          Avance acumulado (minitramos enlazados):{" "}
          <span className="font-medium text-foreground">{avanceAcumulado.toFixed(1)}%</span>
        </p>

        {propuestaEfectiva ? (
          <p className="text-xs text-muted-foreground">{propuestaEfectiva.mensaje}</p>
        ) : null}
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={!propuestaEfectiva}
        onClick={() =>
          propuestaEfectiva &&
          onSolicitarConfirmacion(propuestaEfectiva, {
            modo: esCorreccion ? "corregir" : "nuevo",
            puntoId: esCorreccion ? ultimoPunto?.id : undefined,
          })
        }
      >
        {esCorreccion ? `Confirmar corrección ${letraActual}…` : `Confirmar punto ${letraActual}…`}
      </Button>
    </div>
  )
}
