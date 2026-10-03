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
import { MapaOpcionesCapasMapa } from "@/src/components/mapa/MapaOpcionesCapasMapa"
import {
  MapaTramosFiltroTramo,
  MapaTramosFiltros,
  type FiltrosTramos,
} from "@/src/components/mapa/MapaTramosFiltros"
import { MapaTramosLeyenda } from "@/src/components/mapa/MapaTramosLeyenda"

type CapasMapaProps = {
  vistaSoloTramos1a24: boolean
  onVistaSoloTramos1a24Change: (value: boolean) => void
  mostrarNumerosTramo: boolean
  onMostrarNumerosTramoChange: (value: boolean) => void
  mostrarPuntosAvance: boolean
  onMostrarPuntosAvanceChange: (value: boolean) => void
  ocultarMinitramosTerminados: boolean
  onOcultarMinitramosTerminadosChange: (value: boolean) => void
  mapaConsolidado: boolean
  onMapaConsolidadoChange: (value: boolean) => void
  idPrefix: string
}

type MapaTramosFiltrosSheetProps = {
  filtros: FiltrosTramos
  tramos: { id: string; codigo: string }[]
  semanas: string[]
  onChange: (filtros: FiltrosTramos) => void
  triggerLabel?: string
  variant?: "default" | "visitanteTramoCapas"
  camposFiltro?: Array<"estado" | "tramo" | "semana">
  leyendaCompact?: boolean
  capas?: CapasMapaProps
}

function filtrosActivos(filtros: FiltrosTramos): boolean {
  return (
    filtros.estado !== "todos" ||
    filtros.tramoId !== "todos" ||
    filtros.semanaProgramada !== "todos"
  )
}

function capasActivas(capas: CapasMapaProps | undefined): boolean {
  if (!capas) return false
  return (
    capas.vistaSoloTramos1a24 ||
    capas.mostrarNumerosTramo ||
    capas.mostrarPuntosAvance ||
    capas.ocultarMinitramosTerminados ||
    !capas.mapaConsolidado
  )
}

function filtrosVisitanteTramoActivos(filtros: FiltrosTramos): boolean {
  return filtros.tramoId !== "todos"
}

export function MapaTramosFiltrosSheet({
  filtros,
  tramos,
  semanas,
  onChange,
  triggerLabel = "Filtros y leyenda",
  variant = "default",
  camposFiltro = ["estado", "semana"],
  leyendaCompact = false,
  capas,
}: MapaTramosFiltrosSheetProps) {
  const esVisitanteTramoCapas = variant === "visitanteTramoCapas"

  const activos = esVisitanteTramoCapas
    ? filtrosVisitanteTramoActivos(filtros) || capasActivas(capas)
    : filtrosActivos(filtros) || capasActivas(capas)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="relative min-h-11 w-full gap-2">
          <SlidersHorizontal className="size-4" aria-hidden />
          {triggerLabel}
          {activos ? (
            <span className="absolute right-3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary" />
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto" aria-label="Filtros del mapa">
        <SheetHeader>
          <SheetTitle>Filtros del mapa</SheetTitle>
          <SheetDescription>
            {esVisitanteTramoCapas
              ? "Seleccione tramo y capas del mapa."
              : "Refine los tramos visibles, capas y leyenda de colores."}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {esVisitanteTramoCapas ? (
            <>
              <MapaTramosFiltroTramo
                filtros={filtros}
                tramos={tramos}
                onChange={onChange}
                selectId="filtro-tramo-visitante-sheet"
              />
              {capas ? (
                <MapaOpcionesCapasMapa
                  vistaSoloTramos1a24={capas.vistaSoloTramos1a24}
                  onVistaSoloTramos1a24Change={capas.onVistaSoloTramos1a24Change}
                  mostrarNumerosTramo={capas.mostrarNumerosTramo}
                  onMostrarNumerosTramoChange={capas.onMostrarNumerosTramoChange}
                  mostrarPuntosAvance={capas.mostrarPuntosAvance}
                  onMostrarPuntosAvanceChange={capas.onMostrarPuntosAvanceChange}
                  ocultarMinitramosTerminados={capas.ocultarMinitramosTerminados}
                  onOcultarMinitramosTerminadosChange={capas.onOcultarMinitramosTerminadosChange}
                  mapaConsolidado={capas.mapaConsolidado}
                  onMapaConsolidadoChange={capas.onMapaConsolidadoChange}
                  idPrefix={capas.idPrefix}
                  perfil="visitante"
                />
              ) : null}
            </>
          ) : (
            <>
              <MapaTramosFiltros
                filtros={filtros}
                tramos={tramos}
                semanas={semanas}
                onChange={onChange}
                campos={camposFiltro}
              />
              {capas ? (
                <MapaOpcionesCapasMapa
                  vistaSoloTramos1a24={capas.vistaSoloTramos1a24}
                  onVistaSoloTramos1a24Change={capas.onVistaSoloTramos1a24Change}
                  mostrarNumerosTramo={capas.mostrarNumerosTramo}
                  onMostrarNumerosTramoChange={capas.onMostrarNumerosTramoChange}
                  mostrarPuntosAvance={capas.mostrarPuntosAvance}
                  onMostrarPuntosAvanceChange={capas.onMostrarPuntosAvanceChange}
                  ocultarMinitramosTerminados={capas.ocultarMinitramosTerminados}
                  onOcultarMinitramosTerminadosChange={capas.onOcultarMinitramosTerminadosChange}
                  mapaConsolidado={capas.mapaConsolidado}
                  onMapaConsolidadoChange={capas.onMapaConsolidadoChange}
                  idPrefix={capas.idPrefix}
                />
              ) : null}
              <MapaTramosLeyenda compact={leyendaCompact} />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
