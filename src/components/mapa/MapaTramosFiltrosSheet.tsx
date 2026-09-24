"use client"

import { SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MapaTramosFiltros, type FiltrosTramos } from "@/src/components/mapa/MapaTramosFiltros"
import { MapaTramosLeyenda } from "@/src/components/mapa/MapaTramosLeyenda"

type MapaTramosFiltrosSheetProps = {
  filtros: FiltrosTramos
  canales: string[]
  semanas: string[]
  onChange: (filtros: FiltrosTramos) => void
}

function filtrosActivos(filtros: FiltrosTramos): boolean {
  return (
    filtros.estado !== "todos" ||
    filtros.canal !== "todos" ||
    filtros.semanaProgramada !== "todos"
  )
}

export function MapaTramosFiltrosSheet({
  filtros,
  canales,
  semanas,
  onChange,
}: MapaTramosFiltrosSheetProps) {
  const activos = filtrosActivos(filtros)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="relative w-full gap-2">
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtros y leyenda
          {activos ? (
            <span className="absolute right-3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary" />
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto" aria-label="Filtros del mapa">
        <SheetHeader>
          <SheetTitle>Filtros del mapa</SheetTitle>
          <SheetDescription>Refine los tramos visibles y consulte la leyenda de colores.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <MapaTramosFiltros filtros={filtros} canales={canales} semanas={semanas} onChange={onChange} />
          <MapaTramosLeyenda />
        </div>
      </SheetContent>
    </Sheet>
  )
}
