"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { MapaOverlayPortal } from "@/src/components/mapa/MapaOverlayPortal"
import type { CanalTramo } from "@/src/data/tramos/types"
import { Z_MAPA_DIALOG } from "@/src/lib/mapa-capas-z"

function fechaLocalIso(): string {
  const hoy = new Date()
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, "0")
  const d = String(hoy.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export type ReportarIncidenciaPayload = {
  fecha: string
  notas: string
}

type ReportarIncidenciaTramoModalProps = {
  open: boolean
  tramo: CanalTramo | null
  loading?: boolean
  errorExterno?: string | null
  onGuardar: (payload: ReportarIncidenciaPayload) => void | Promise<void>
  onCancel: () => void
}

export function ReportarIncidenciaTramoModal({
  open,
  tramo,
  loading = false,
  errorExterno = null,
  onGuardar,
  onCancel,
}: ReportarIncidenciaTramoModalProps) {
  const [fecha, setFecha] = useState(fechaLocalIso)
  const [notas, setNotas] = useState("")
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setFecha(fechaLocalIso())
    setNotas("")
    setErrorLocal(null)
  }, [open, tramo?.id])

  if (!open || !tramo) return null

  const errorMostrar = errorExterno ?? errorLocal

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = notas.trim()
    if (!fecha) {
      setErrorLocal("Indique la fecha de la incidencia.")
      return
    }
    if (trimmed.length < 3) {
      setErrorLocal("Las notas deben tener al menos 3 caracteres.")
      return
    }
    setErrorLocal(null)
    await onGuardar({ fecha, notas: trimmed })
  }

  return (
    <MapaOverlayPortal open>
      <div
        className={cn(
          "fixed inset-0 flex items-end justify-center bg-black/50 p-4 sm:items-center",
          Z_MAPA_DIALOG
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reportar-incidencia-title"
        onClick={(event) => {
          if (event.target === event.currentTarget && !loading) onCancel()
        }}
      >
        <form
          className="w-full max-w-md rounded-xl border border-foreground/10 bg-background p-5 shadow-xl"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <h2 id="reportar-incidencia-title" className="text-lg font-semibold">
            Reportar incidencia
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tramo {tramo.codigo} · {tramo.canal}. El registro aparecerá en la página de maquinaria
            del proyecto (hecho extraordinario, sin metros desazolvados).
          </p>

          {errorMostrar ? (
            <p
              className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {errorMostrar}
            </p>
          ) : null}

          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="incidencia-fecha">Fecha</Label>
              <Input
                id="incidencia-fecha"
                type="date"
                value={fecha}
                disabled={loading}
                required
                onChange={(event) => setFecha(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="incidencia-notas">Notas</Label>
              <Textarea
                id="incidencia-notas"
                value={notas}
                disabled={loading}
                required
                minLength={3}
                rows={4}
                placeholder="Describa el hecho extraordinario (obligatorio)"
                onChange={(event) => setNotas(event.target.value)}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={loading} onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando…" : "Guardar incidencia"}
            </Button>
          </div>
        </form>
      </div>
    </MapaOverlayPortal>
  )
}
