"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { CanalAbscisa } from "@/src/data/auditoria/types"
import { etiquetaEstadoAbscisa, volumenAreasMedias } from "@/src/data/auditoria/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { actualizarAreasCanalAbscisa } from "@/src/lib/cargar-canal-abscisas"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import { createClient } from "@/src/lib/supabase/client"

type AbscisaDetalleSheetProps = {
  abscisa: CanalAbscisa | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onActualizada?: (abscisa: CanalAbscisa) => void
}

export function AbscisaDetalleSheet({
  abscisa,
  open,
  onOpenChange,
  onActualizada,
}: AbscisaDetalleSheetProps) {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const [a1, setA1] = useState("")
  const [a2, setA2] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!abscisa) return
    setA1(abscisa.area_inicial_m2 != null ? String(abscisa.area_inicial_m2) : "")
    setA2(abscisa.area_final_m2 != null ? String(abscisa.area_final_m2) : "")
    setError(null)
  }, [abscisa])

  const volumenPreview = useMemo(() => {
    if (!abscisa) return null
    const n1 = Number(a1.replace(",", "."))
    const n2 = Number(a2.replace(",", "."))
    if (!Number.isFinite(n1) || !Number.isFinite(n2)) return null
    return volumenAreasMedias(n1, n2, abscisa.longitud_m)
  }, [a1, a2, abscisa])

  async function guardar() {
    if (!abscisa) return
    setLoading(true)
    setError(null)
    try {
      const n1 = a1.trim() ? Number(a1.replace(",", ".")) : null
      const n2 = a2.trim() ? Number(a2.replace(",", ".")) : null
      if (n1 != null && !Number.isFinite(n1)) throw new Error("Área inicial inválida.")
      if (n2 != null && !Number.isFinite(n2)) throw new Error("Área final inválida.")

      const tieneAreas = n1 != null && n2 != null
      const hoy = new Date().toISOString().slice(0, 10)

      const actualizada = await actualizarAreasCanalAbscisa(supabase, abscisa.id, {
        area_inicial_m2: n1,
        area_final_m2: n2,
        estado: tieneAreas ? "ejecutado" : abscisa.estado === "pendiente" ? "en_proceso" : abscisa.estado,
        fecha_ejecucion: tieneAreas ? hoy : abscisa.fecha_ejecucion,
      })
      onActualizada?.(actualizada)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.")
    } finally {
      setLoading(false)
    }
  }

  const hrefDesalojo = abscisa
    ? `${rutaObra(proyectoId, "desalojo")}?abscisa=${abscisa.id}`
    : rutaObra(proyectoId, "desalojo")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{abscisa?.codigo_estacion ?? "Abscisa"}</SheetTitle>
          <SheetDescription>
            {abscisa ? (
              <>
                {abscisa.sector_nombre} · {etiquetaEstadoAbscisa(abscisa.estado)} · L ={" "}
                {abscisa.longitud_m.toFixed(0)} m
              </>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        {abscisa ? (
          <div className="mt-4 space-y-4 px-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="abscisa-a1">Área inicial A₁ (m²)</Label>
                <Input
                  id="abscisa-a1"
                  inputMode="decimal"
                  value={a1}
                  onChange={(e) => setA1(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="abscisa-a2">Área final A₂ (m²)</Label>
                <Input
                  id="abscisa-a2"
                  inputMode="decimal"
                  value={a2}
                  onChange={(e) => setA2(e.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Volumen (áreas medias):{" "}
              <span className="font-medium text-foreground">
                {volumenPreview != null
                  ? `${volumenPreview.toFixed(2)} m³`
                  : abscisa.volumen_teorico_m3 != null
                    ? `${abscisa.volumen_teorico_m3.toFixed(2)} m³`
                    : "—"}
              </span>
            </p>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}

        <SheetFooter className="mt-6 flex-col gap-2 sm:flex-col">
          <Button type="button" className="w-full touch-manipulation" disabled={loading || !abscisa} onClick={() => void guardar()}>
            {loading ? "Guardando…" : "Guardar cubicación"}
          </Button>
          <Button type="button" variant="outline" className="w-full touch-manipulation" asChild>
            <Link href={hrefDesalojo}>Registrar volqueta en esta abscisa</Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
