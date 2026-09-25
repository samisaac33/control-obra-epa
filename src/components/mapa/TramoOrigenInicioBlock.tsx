"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { CanalTramo, OrigenExtremoTramo } from "@/src/data/tramos/types"
import { etiquetaOrigenExtremo, extremoInicioCoord } from "@/src/lib/tramo-geometria"

export type ConfirmarOrigenInicioOptions = {
  marcarEnEjecucion?: boolean
}

type TramoOrigenInicioBlockProps = {
  tramo: CanalTramo
  loading?: boolean
  onConfirmar: (origen: OrigenExtremoTramo, opciones?: ConfirmarOrigenInicioOptions) => Promise<void>
}

export function TramoOrigenInicioBlock({
  tramo,
  loading = false,
  onConfirmar,
}: TramoOrigenInicioBlockProps) {
  const [seleccion, setSeleccion] = useState<OrigenExtremoTramo | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGuardar(marcarEnEjecucion: boolean) {
    if (!seleccion) return
    setError(null)
    try {
      await onConfirmar(seleccion, { marcarEnEjecucion })
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el inicio del tramo.")
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-foreground/10 bg-muted/10 p-4">
      <div>
        <h4 className="text-sm font-medium">Inicio del tramo</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          ¿Desde qué extremo inicia el desasolve? Se registrará el punto A en ese extremo. Puede
          iniciar ya en ejecución (parpadeo en el mapa) sin necesidad de marcar el punto B.
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

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          className="w-full"
          disabled={!seleccion || loading}
          onClick={() => void handleGuardar(false)}
        >
          {loading ? "Guardando…" : "Confirmar inicio y punto A"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full border border-amber-500/40 bg-amber-500/10 text-amber-950 hover:bg-amber-500/20 dark:text-amber-100"
          disabled={!seleccion || loading}
          onClick={() => void handleGuardar(true)}
        >
          {loading ? "Guardando…" : "En ejecución (inicio + punto A)"}
        </Button>
      </div>
    </div>
  )
}
