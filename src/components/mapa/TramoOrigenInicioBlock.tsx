"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { CanalTramo, OrigenExtremoTramo } from "@/src/data/tramos/types"
import { etiquetaOrigenExtremo, extremoInicioCoord } from "@/src/lib/tramo-geometria"

type TramoOrigenInicioBlockProps = {
  tramo: CanalTramo
  loading?: boolean
  onConfirmar: (origen: OrigenExtremoTramo) => Promise<void>
}

export function TramoOrigenInicioBlock({
  tramo,
  loading = false,
  onConfirmar,
}: TramoOrigenInicioBlockProps) {
  const [seleccion, setSeleccion] = useState<OrigenExtremoTramo | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGuardar() {
    if (!seleccion) return
    setError(null)
    try {
      await onConfirmar(seleccion)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el inicio del tramo.")
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-foreground/10 bg-muted/10 p-4">
      <div>
        <h4 className="text-sm font-medium">Inicio del tramo</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          ¿Desde qué extremo inicia el desasolve en este tramo? Se registrará automáticamente el
          punto A en ese extremo.
        </p>
      </div>

      <div className="grid gap-2">
        {(["geometria_inicio", "geometria_fin"] as const).map((extremo) => {
          const coord = extremoInicioCoord({ ...tramo, origen_extremo: extremo })
          return (
            <Button
              key={extremo}
              type="button"
              variant={seleccion === extremo ? "default" : "outline"}
              className="h-auto flex-col items-start gap-1 px-3 py-2 text-left text-xs"
              onClick={() => setSeleccion(extremo)}
            >
              <span className="font-medium">{etiquetaOrigenExtremo(extremo)}</span>
              <span className="text-muted-foreground font-normal">
                {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
              </span>
            </Button>
          )
        })}
      </div>

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        className="w-full"
        disabled={!seleccion || loading}
        onClick={() => void handleGuardar()}
      >
        {loading ? "Guardando…" : "Confirmar inicio y punto A"}
      </Button>
    </div>
  )
}
