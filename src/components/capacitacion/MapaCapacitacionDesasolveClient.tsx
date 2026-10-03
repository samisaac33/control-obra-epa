"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapaOpcionesCapasMapa } from "@/src/components/mapa/MapaOpcionesCapasMapa"
import {
  MapaTramosFiltroTramo,
  MapaTramosFiltros,
  type FiltrosTramos,
} from "@/src/components/mapa/MapaTramosFiltros"
import { MapaSegmentoInfoModal } from "@/src/components/mapa/MapaSegmentoInfoModal"
import { MapaTramosKpisBar } from "@/src/components/mapa/MapaTramosKpisBar"
import { MapaTramosLeyenda } from "@/src/components/mapa/MapaTramosLeyenda"
import { TramoDetallePanel } from "@/src/components/mapa/TramoDetallePanel"
import {
  DEMO_PUNTOS_CAPACITACION,
  DEMO_TRAMOS_CAPACITACION,
} from "@/src/data/capacitacion/demo-map-desasolve"
import { tramosMapaDesasolveSinExcluidos } from "@/src/data/tramos/tramos-excluidos"
import type { CanalTramo } from "@/src/data/tramos/types"
import { frenteParpadeoPorTramoDesdeTramos } from "@/src/lib/tramo-frente-mapa"
import type { SegmentoVisualTramo } from "@/src/lib/tramo-geometria"
import {
  calcularKpisTramos,
  filtrarTramos,
  filtrarTramosPorRangoNumerico,
  semanasProgramadasUnicas,
} from "@/src/lib/tramos-avance"
import { useEsViewportMovil } from "@/src/hooks/useEsViewportMovil"

const MapaTramosLeaflet = dynamic(
  () =>
    import("@/src/components/mapa/MapaTramosLeaflet").then((mod) => mod.MapaTramosLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(65vh,560px)] items-center justify-center rounded-xl border border-dashed border-foreground/15 bg-muted/20 text-sm text-muted-foreground">
        Cargando mapa...
      </div>
    ),
  }
)

export function MapaCapacitacionDesasolveClient() {
  const tramos = DEMO_TRAMOS_CAPACITACION
  const puntosAvance = DEMO_PUNTOS_CAPACITACION
  const esViewportMovil = useEsViewportMovil()

  const [filtros, setFiltros] = useState<FiltrosTramos>({
    estado: "todos",
    tramoId: "todos",
    semanaProgramada: "todos",
  })
  const [tramoSeleccionado, setTramoSeleccionado] = useState<CanalTramo | null>(null)
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [tramoVisitanteModal, setTramoVisitanteModal] = useState<{
    tramo: CanalTramo
    segmentoDestacado: SegmentoVisualTramo
  } | null>(null)
  const [vistaSoloTramos1a24, setVistaSoloTramos1a24] = useState(false)
  const [mostrarNumerosTramo, setMostrarNumerosTramo] = useState(false)
  const [mostrarPuntosAvance, setMostrarPuntosAvance] = useState(true)
  const [ocultarMinitramosTerminados, setOcultarMinitramosTerminados] = useState(false)
  const [mapaConsolidado, setMapaConsolidado] = useState(true)

  const tramosParaVista = useMemo(() => {
    if (vistaSoloTramos1a24) {
      return filtrarTramosPorRangoNumerico(tramos, 1, 24)
    }
    return tramosMapaDesasolveSinExcluidos(tramos)
  }, [tramos, vistaSoloTramos1a24])

  const tramosFiltrados = useMemo(
    () => filtrarTramos(tramosParaVista, filtros, puntosAvance),
    [tramosParaVista, filtros, puntosAvance]
  )

  const kpis = useMemo(
    () => calcularKpisTramos(tramosFiltrados, puntosAvance),
    [tramosFiltrados, puntosAvance]
  )

  const puntoFrenteParpadeoPorTramo = useMemo(
    () => frenteParpadeoPorTramoDesdeTramos(tramos, puntosAvance),
    [tramos, puntosAvance]
  )

  const puntoIdsParpadeoFrente = useMemo(() => {
    return new Set(Object.values(puntoFrenteParpadeoPorTramo))
  }, [puntoFrenteParpadeoPorTramo])

  function handleTramoClick(tramo: CanalTramo) {
    setTramoSeleccionado(tramo)
    setPanelAbierto(true)
  }

  const mapaLeaflet = (
    <MapaTramosLeaflet
      tramos={tramosFiltrados}
      tramoSeleccionadoId={tramoSeleccionado?.id ?? null}
      puntosAvance={puntosAvance}
      isResident={false}
      esViewportMovil={esViewportMovil}
      modoMapaVisitanteMovil={false}
      marcadoresCompactos={false}
      mostrarEtiquetasTramo={mostrarNumerosTramo}
      mostrarPuntosAvance={mostrarPuntosAvance}
      mostrarMinitramosTerminados={!ocultarMinitramosTerminados}
      mapaConsolidado={mapaConsolidado}
      onTramoClick={handleTramoClick}
      onSegmentoVisitanteClick={(segmento) =>
        setTramoVisitanteModal({ tramo: segmento.tramo, segmentoDestacado: segmento })
      }
      puntoIdsParpadeoFrente={puntoIdsParpadeoFrente}
    />
  )

  return (
    <div className="p-3 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <Card className="border-foreground/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Mapa Desasolve — capacitación</CardTitle>
            <CardDescription>
              Vista equivalente a visitante en{" "}
              <span className="font-medium">/desasolve-canales/mapa</span>. Datos de demostración
              para grabación; en producción los tramos provienen de Supabase.{" "}
              <Link
                href="/capacitacion/mapa-desasolve/video"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Ver video de capacitación (MP4)
              </Link>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <MapaTramosKpisBar kpis={kpis} modo="stack" chipsCarrusel={false} />
            <p className="text-sm text-muted-foreground">
              Pase el cursor sobre un tramo coloreado para ver minitramos, o haga clic para abrir
              el resumen.
            </p>
            <MapaTramosLeyenda />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 sm:flex-1">
                <MapaTramosFiltroTramo
                  filtros={filtros}
                  tramos={tramosParaVista}
                  onChange={setFiltros}
                  selectId="filtro-tramo-capacitacion"
                />
              </div>
              <MapaOpcionesCapasMapa
                vistaSoloTramos1a24={vistaSoloTramos1a24}
                onVistaSoloTramos1a24Change={setVistaSoloTramos1a24}
                mostrarNumerosTramo={mostrarNumerosTramo}
                onMostrarNumerosTramoChange={setMostrarNumerosTramo}
                mostrarPuntosAvance={mostrarPuntosAvance}
                onMostrarPuntosAvanceChange={setMostrarPuntosAvance}
                ocultarMinitramosTerminados={ocultarMinitramosTerminados}
                onOcultarMinitramosTerminadosChange={setOcultarMinitramosTerminados}
                mapaConsolidado={mapaConsolidado}
                onMapaConsolidadoChange={setMapaConsolidado}
                idPrefix="capacitacion"
                className="sm:max-w-md sm:flex-1"
              />
            </div>
            {mapaLeaflet}
            <MapaTramosFiltros
              filtros={filtros}
              tramos={tramosParaVista}
              semanas={semanasProgramadasUnicas(tramos)}
              onChange={setFiltros}
              campos={["estado", "semana"]}
            />
          </CardContent>
        </Card>
      </div>

      <TramoDetallePanel
        tramo={tramoSeleccionado}
        open={panelAbierto}
        onOpenChange={setPanelAbierto}
        detalleEnBottomSheet={esViewportMovil}
        isResident={false}
        loading={false}
        proyectoId="desasolve-canales"
        puntosAvance={puntosAvance}
        puntosRefreshKey={0}
        eliminandoId={null}
        panelError={null}
        onClearPanelError={() => {}}
        onSubmit={async () => {}}
        onSolicitarConfirmacionAvance={() => {}}
        puntoFrenteParpadeoId={
          tramoSeleccionado ? (puntoFrenteParpadeoPorTramo[tramoSeleccionado.id] ?? null) : null
        }
        guardandoEstadoMinitramoId={null}
        onEvidenciaSubida={() => {}}
      />

      <MapaSegmentoInfoModal
        open={tramoVisitanteModal !== null}
        tramo={tramoVisitanteModal?.tramo ?? null}
        puntosAvance={puntosAvance}
        segmentoDestacado={tramoVisitanteModal?.segmentoDestacado ?? null}
        onClose={() => setTramoVisitanteModal(null)}
        onVerDetalleTramo={(tramo) => {
          setTramoVisitanteModal(null)
          handleTramoClick(tramo)
        }}
      />
    </div>
  )
}
