"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type EstadoGeolocalizacion =
  | "idle"
  | "solicitando"
  | "activo"
  | "denegado"
  | "no_disponible"
  | "error"

export type PosicionGeolocalizacion = {
  lat: number
  lng: number
  precision_m: number
}

const OPCIONES_GPS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 2000,
  timeout: 15000,
}

function mensajeErrorGeolocalizacion(code: number): string {
  switch (code) {
    case GeolocationPositionError.PERMISSION_DENIED:
      return "Permiso de ubicación denegado. Actívelo en la configuración del navegador."
    case GeolocationPositionError.POSITION_UNAVAILABLE:
      return "Ubicación no disponible. Verifique que el GPS esté activo."
    case GeolocationPositionError.TIMEOUT:
      return "Tiempo de espera agotado al obtener la ubicación."
    default:
      return "No se pudo obtener la ubicación."
  }
}

export function useGeolocalizacion() {
  const [estado, setEstado] = useState<EstadoGeolocalizacion>("idle")
  const [posicion, setPosicion] = useState<PosicionGeolocalizacion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  const limpiarWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  const detenerSeguimiento = useCallback(() => {
    limpiarWatch()
    setEstado("idle")
    setPosicion(null)
    setError(null)
  }, [limpiarWatch])

  const iniciarSeguimiento = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setEstado("no_disponible")
      setError("Este navegador no admite geolocalización.")
      return
    }

    limpiarWatch()
    setEstado("solicitando")
    setError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setPosicion({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          precision_m: position.coords.accuracy,
        })
        setEstado("activo")
        setError(null)
      },
      (err) => {
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setEstado("denegado")
        } else if (err.code === GeolocationPositionError.POSITION_UNAVAILABLE) {
          setEstado("no_disponible")
        } else {
          setEstado("error")
        }
        setError(mensajeErrorGeolocalizacion(err.code))
      },
      OPCIONES_GPS
    )
  }, [limpiarWatch])

  useEffect(() => {
    return () => limpiarWatch()
  }, [limpiarWatch])

  return {
    estado,
    posicion,
    error,
    activo: estado === "activo" || estado === "solicitando",
    iniciarSeguimiento,
    detenerSeguimiento,
  }
}
