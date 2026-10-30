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
import { cn } from "@/lib/utils"
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
  habilitarCapaAbscisas?: boolean
  mostrarAbscisas?: boolean
  onMostrarAbscisasChange?: (value: boolean) => void
  habilitarCapaEscombreras?: boolean
  mostrarEscombreras?: boolean
  onMostrarEscombrerasChange?: (value: boolean) => void
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
  /** Superpone el botón al mapa y abre un panel inferior sin oscurecer el mapa. */
  anclajeMapa?: boolean
  triggerClassName?: string
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
    !capas.mapaConsolidado ||
    capas.mostrarAbscisas === true ||
    capas.mostrarEscombreras === false
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
  anclajeMapa = false,
  triggerClassName,
}: MapaTramosFiltrosSheetProps) {
  const esVisitanteTramoCapas = variant === "visitanteTramoCapas"

  const activos = esVisitanteTramoCapas
    ? filtrosVisitanteTramoActivos(filtros) || capasActivas(capas)
    : filtrosActivos(filtros) || capasActivas(capas)

  return (
    <Sheet modal={!anclajeMapa}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "relative min-h-11 w-full gap-2",
            anclajeMapa &&
              "border-foreground/15 bg-background/92 shadow-md backdrop-blur-md touch-manipulation",
            triggerClassName
          )}
        >
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
          {triggerLabel}
          {activos ? (
            <span className="absolute right-3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary" />
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        showOverlay={!anclajeMapa}
        className={cn(
          "overflow-y-auto",
          anclajeMapa
            ? "z-[230] max-h-[min(46dvh,360px)] gap-0 rounded-t-2xl border-t border-foreground/15 bg-background/95 p-0 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md"
            : "max-h-[85dvh]"
        )}
        aria-label="Filtros del mapa"
      >
        <SheetHeader
          className={cn(
            anclajeMapa &&
              "border-b border-foreground/10 px-4 py-3 pr-12 text-left"
          )}
        >
          {anclajeMapa ? (
            <div
              className="mx-auto mb-1 h-1 w-10 shrink-0 rounded-full bg-foreground/20"
              aria-hidden
            />
          ) : null}
          <SheetTitle className={cn(anclajeMapa && "text-sm font-semibold")}>
            {anclajeMapa ? triggerLabel : "Filtros del mapa"}
          </SheetTitle>
          {!anclajeMapa ? (
            <SheetDescription>
              {esVisitanteTramoCapas
                ? "Seleccione tramo y capas del mapa."
                : "Refine los tramos visibles, capas y leyenda de colores."}
            </SheetDescription>
          ) : null}
        </SheetHeader>
        <div className={cn("space-y-4", anclajeMapa ? "px-4 pb-4 pt-3" : "mt-4")}>
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
                  habilitarCapaAbscisas={capas.habilitarCapaAbscisas}
                  mostrarAbscisas={capas.mostrarAbscisas}
                  onMostrarAbscisasChange={capas.onMostrarAbscisasChange}
                  habilitarCapaEscombreras={capas.habilitarCapaEscombreras}
                  mostrarEscombreras={capas.mostrarEscombreras}
                  onMostrarEscombrerasChange={capas.onMostrarEscombrerasChange}
                />
              ) : null}
              {anclajeMapa ? <MapaTramosLeyenda compact /> : null}
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
                  habilitarCapaAbscisas={capas.habilitarCapaAbscisas}
                  mostrarAbscisas={capas.mostrarAbscisas}
                  onMostrarAbscisasChange={capas.onMostrarAbscisasChange}
                  habilitarCapaEscombreras={capas.habilitarCapaEscombreras}
                  mostrarEscombreras={capas.mostrarEscombreras}
                  onMostrarEscombrerasChange={capas.onMostrarEscombrerasChange}
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
