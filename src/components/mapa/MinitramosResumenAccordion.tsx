"use client"

import { Trash2 } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { EstadoTramo } from "@/src/data/tramos/types"
import { ESTADOS_TRAMO, colorEstadoTramo, etiquetaEstadoTramo } from "@/src/data/tramos/types"
import { etiquetaLetra, type ItemResumenMinitramo } from "@/src/lib/tramo-geometria"

const SELECT_EN_SHEET_CLASS =
  "z-[90] max-h-[min(16rem,50dvh)] w-(--radix-select-trigger-width)"

type MinitramoCompleto = Extract<ItemResumenMinitramo, { tipo: "completo" }>

type MinitramosResumenAccordionProps = {
  items: ItemResumenMinitramo[]
  isResident?: boolean
  guardandoEstadoId?: string | null
  eliminandoId?: string | null
  onEstadoChange?: (puntoFinId: string, estado: EstadoTramo) => void | Promise<void>
  onEliminar?: (grupoId: string) => void
  compact?: boolean
}

export function MinitramosResumenAccordion({
  items,
  isResident = false,
  guardandoEstadoId = null,
  eliminandoId = null,
  onEstadoChange,
  onEliminar,
  compact = false,
}: MinitramosResumenAccordionProps) {
  const completos = items.filter((item): item is MinitramoCompleto => item.tipo === "completo")

  if (completos.length === 0) {
    return null
  }

  return (
    <Accordion type="single" collapsible className="space-y-1">
      {completos.map((item) => {
        const etiquetaMinitramo = `${etiquetaLetra(item.letraInicio)}–${etiquetaLetra(item.letraFin)}`
        const eliminando = eliminandoId === item.grupo_id

        return (
          <AccordionItem
            key={item.grupo_id}
            value={item.grupo_id}
            className="rounded-md border border-foreground/10 bg-background px-0"
          >
            <div className="flex items-stretch gap-0.5 pr-1">
              <AccordionTrigger
                className={`min-w-0 flex-1 gap-2 px-2 hover:no-underline ${compact ? "py-2 text-xs" : "py-2.5 text-xs"}`}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full ring-1 ring-foreground/10"
                  style={{ backgroundColor: colorEstadoTramo(item.estado) }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 text-left font-medium">
                  Minitramo {etiquetaMinitramo}: {item.abscisaInicio.toFixed(1)} m →{" "}
                  {item.abscisaFin.toFixed(1)} m ({item.longitud_m.toFixed(1)} m)
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {etiquetaEstadoTramo(item.estado)}
                </span>
              </AccordionTrigger>
              {isResident && onEliminar ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="my-1 size-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={eliminando}
                  aria-label={
                    eliminando
                      ? `Eliminando minitramo ${etiquetaMinitramo}`
                      : `Eliminar minitramo ${etiquetaMinitramo}`
                  }
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation()
                    onEliminar(item.grupo_id)
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              ) : null}
            </div>
            <AccordionContent className="space-y-3 px-2 pb-3 pt-0">
              {isResident && onEstadoChange ? (
                <div className="space-y-1.5">
                  <Label htmlFor={`estado-minitramo-${item.puntoFinId}`} className="text-xs">
                    Estado del minitramo
                  </Label>
                  <Select
                    value={item.estado}
                    disabled={guardandoEstadoId === item.puntoFinId}
                    onValueChange={(value) =>
                      void onEstadoChange(item.puntoFinId, value as EstadoTramo)
                    }
                  >
                    <SelectTrigger id={`estado-minitramo-${item.puntoFinId}`} className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" className={SELECT_EN_SHEET_CLASS}>
                      {ESTADOS_TRAMO.map((estado) => (
                        <SelectItem key={estado.id} value={estado.id}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Estado: {etiquetaEstadoTramo(item.estado)}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
