"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  BotonGpsResidenteIcono,
  useMapaUbicacionResidente,
} from "@/src/components/mapa/MapaUbicacionResidenteBlock"

type MapaBuscarCoordenadasResidenteProps = {
  className?: string
  /** Estilo flotante legible sobre el mapa en pantalla completa */
  variant?: "default" | "overlay"
  /** Botón cuadrado «Mi ubicación» al inicio de la fila (móvil / pantalla completa) */
  conBotonUbicacion?: boolean
}

export function MapaBuscarCoordenadasResidente({
  className,
  variant = "default",
  conBotonUbicacion = false,
}: MapaBuscarCoordenadasResidenteProps) {
  const { buscarPorTextoCoordenadas, limpiarBusquedaCoordenadas, posicionManual } =
    useMapaUbicacionResidente()
  const [texto, setTexto] = useState("")
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  function ejecutarBusqueda() {
    const result = buscarPorTextoCoordenadas(texto)
    if (!result.ok) {
      setErrorLocal(result.error)
      return
    }
    setErrorLocal(null)
  }

  function handleChange(value: string) {
    setTexto(value)
    setErrorLocal(null)
    if (!value.trim()) {
      limpiarBusquedaCoordenadas()
    }
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex min-w-0 items-center gap-2">
        {conBotonUbicacion ? <BotonGpsResidenteIcono overlay={variant === "overlay"} /> : null}
        <Input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="Lat, lng o UTM (ej. zona 17, 552453E, 9907113N)"
          value={texto}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              ejecutarBusqueda()
            }
          }}
          className={cn(
            "min-h-11 min-w-0 flex-1 text-xs sm:text-sm",
            variant === "overlay" &&
              "border-foreground/15 bg-background/95 shadow-md backdrop-blur-sm"
          )}
          aria-label="Coordenadas latitud, longitud"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "size-11 shrink-0",
            variant === "overlay" &&
              "border-foreground/15 bg-background/95 shadow-md backdrop-blur-sm"
          )}
          aria-label="Buscar coordenadas"
          onClick={ejecutarBusqueda}
        >
          <Search className="size-4" aria-hidden />
        </Button>
      </div>
      {errorLocal ? (
        <p className="text-xs text-destructive" role="alert">
          {errorLocal}
        </p>
      ) : null}
      {posicionManual ? (
        <p className="text-xs text-muted-foreground">
          Pin en mapa: {posicionManual.lat.toFixed(6)}, {posicionManual.lng.toFixed(6)}
          {" · "}
          <button
            type="button"
            className="font-medium text-foreground underline-offset-2 hover:underline"
            onClick={() => {
              setTexto("")
              setErrorLocal(null)
              limpiarBusquedaCoordenadas()
            }}
          >
            Limpiar
          </button>
        </p>
      ) : null}
    </div>
  )
}
