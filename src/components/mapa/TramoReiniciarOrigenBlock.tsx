"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { RestablecerTramoModal } from "@/src/components/mapa/RestablecerTramoModal"
import type { CanalTramo } from "@/src/data/tramos/types"

type TramoReiniciarOrigenBlockProps = {
  tramo: CanalTramo
  loading?: boolean
  onReiniciar: () => Promise<void>
}

export function TramoReiniciarOrigenBlock({
  tramo,
  loading = false,
  onReiniciar,
}: TramoReiniciarOrigenBlockProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirmar() {
    setError(null)
    try {
      await onReiniciar()
      setModalAbierto(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo restablecer el tramo.")
    }
  }

  return (
    <>
      <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div>
          <h4 className="text-sm font-medium">Restablecer avance GPS</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Borra el origen y todos los puntos del tramo para volver a elegir el extremo de inicio
            desde cero.
          </p>
        </div>
        {error ? (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
          disabled={loading}
          onClick={() => setModalAbierto(true)}
        >
          Restablecer todo
        </Button>
      </div>

      <RestablecerTramoModal
        open={modalAbierto}
        tramo={tramo}
        loading={loading}
        onConfirm={handleConfirmar}
        onCancel={() => {
          if (!loading) setModalAbierto(false)
        }}
      />
    </>
  )
}
