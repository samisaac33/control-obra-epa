"use client"

import dynamic from "next/dynamic"
import { Map } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ConfirmarPuntoMinitramoModal,
  type ConfirmarPuntoPayload,
} from "@/src/components/mapa/ConfirmarPuntoMinitramoModal"
import { MapaTramosFiltros, type FiltrosTramos } from "@/src/components/mapa/MapaTramosFiltros"
import { MapaSegmentoInfoModal } from "@/src/components/mapa/MapaSegmentoInfoModal"
import { MapaTramosFiltrosSheet } from "@/src/components/mapa/MapaTramosFiltrosSheet"
import { MapaTramosKpis } from "@/src/components/mapa/MapaTramosKpis"
import { MapaTramosKpisBar } from "@/src/components/mapa/MapaTramosKpisBar"
import { MapaTramosLeyenda } from "@/src/components/mapa/MapaTramosLeyenda"
import { useEsViewportMovil } from "@/src/hooks/useEsViewportMovil"
import {
  TramoDetallePanel,
  type SolicitarConfirmacionAvanceOptions,
} from "@/src/components/mapa/TramoDetallePanel"
import type { TramoFormValues } from "@/src/components/mapa/TramoEditorForm"
import { ProyectoModuloGuard } from "@/src/components/ProyectoModuloGuard"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import type { CanalTramo, EstadoTramo, OrigenExtremoTramo } from "@/src/data/tramos/types"
import { createClient } from "@/src/lib/supabase/client"
import {
  actualizarEstadoPuntoAvance,
  cargarPuntosAvancePorProyecto,
  confirmarPuntoMinitramo,
  corregirPuntoMinitramo,
  eliminarMinitramo,
  eliminarPuntoHuérfano,
  guardarOrigenTramoEInicio,
  recalcularAvanceTramoDesdePuntos,
  reiniciarOrigenTramoYPuntos,
} from "@/src/lib/tramo-avance-coordenadas"
import type {
  PropuestaPuntoMinitramo,
  SegmentoVisualTramo,
  TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"
import { crearRegistroMaquinariaTramo } from "@/src/lib/tramo-maquinaria-historial"
import {
  calcularKpisTramos,
  filtrarTramos,
  semanasProgramadasUnicas,
} from "@/src/lib/tramos-avance"

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

function normalizarTramo(row: Record<string, unknown>): CanalTramo {
  const origenRaw = row.origen_extremo ? String(row.origen_extremo) : null
  const origen_extremo =
    origenRaw === "geometria_inicio" || origenRaw === "geometria_fin" ? origenRaw : null

  return {
    id: String(row.id),
    proyecto_id: String(row.proyecto_id),
    codigo: String(row.codigo),
    canal: String(row.canal),
    longitud_m: Number(row.longitud_m),
    geometria: row.geometria as CanalTramo["geometria"],
    origen_extremo,
    estado: row.estado as CanalTramo["estado"],
    avance_pct: Number(row.avance_pct),
    metros_ejecutados: Number(row.metros_ejecutados),
    fecha_inicio: row.fecha_inicio ? String(row.fecha_inicio) : null,
    fecha_fin: row.fecha_fin ? String(row.fecha_fin) : null,
    semana_programada: row.semana_programada ? String(row.semana_programada) : null,
    maquinaria_asignada: row.maquinaria_asignada ? String(row.maquinaria_asignada) : null,
    observaciones: row.observaciones ? String(row.observaciones) : null,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  }
}

function trimOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed || null
}

export function MapaTramosClient() {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const residentEmail = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()

  const [tramos, setTramos] = useState<CanalTramo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [guardandoOrigen, setGuardandoOrigen] = useState(false)
  const [reiniciandoOrigen, setReiniciandoOrigen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isResident, setIsResident] = useState(false)
  const [tramoSeleccionado, setTramoSeleccionado] = useState<CanalTramo | null>(null)
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosTramos>({
    estado: "todos",
    tramoId: "todos",
    semanaProgramada: "todos",
  })
  const [puntosAvance, setPuntosAvance] = useState<TramoPuntoAvance[]>([])
  const [puntosRefreshKey, setPuntosRefreshKey] = useState(0)
  const [confirmModalAbierto, setConfirmModalAbierto] = useState(false)
  const [propuestaConfirm, setPropuestaConfirm] = useState<PropuestaPuntoMinitramo | null>(null)
  const [confirmModo, setConfirmModo] = useState<"nuevo" | "corregir">("nuevo")
  const [confirmPuntoId, setConfirmPuntoId] = useState<string | undefined>()
  const [confirmRegistroFotoId, setConfirmRegistroFotoId] = useState<string | null>(null)
  const [confirmandoAvance, setConfirmandoAvance] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)
  const [guardandoEstadoMinitramoId, setGuardandoEstadoMinitramoId] = useState<string | null>(null)
  const [panelError, setPanelError] = useState<string | null>(null)
  const [tramoVisitanteModal, setTramoVisitanteModal] = useState<{
    tramo: CanalTramo
    segmentoDestacado: SegmentoVisualTramo
  } | null>(null)
  const esViewportMovil = useEsViewportMovil()

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ data: tramosData, error: tramosError }, puntos] = await Promise.all([
        supabase
          .from("canal_tramos")
          .select("*")
          .eq("proyecto_id", proyectoId)
          .order("codigo", { ascending: true }),
        cargarPuntosAvancePorProyecto(supabase, proyectoId),
      ])

      if (tramosError) throw new Error(tramosError.message)

      const tramosNormalizados = (tramosData ?? []).map((row) =>
        normalizarTramo(row as Record<string, unknown>)
      )
      setTramos(tramosNormalizados)
      setPuntosAvance(puntos)
      setPuntosRefreshKey((k) => k + 1)
      setTramoSeleccionado((prev) => {
        if (!prev) return prev
        const actualizado = tramosNormalizados.find((t) => t.id === prev.id)
        return actualizado ?? prev
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los tramos.")
      setTramos([])
      setPuntosAvance([])
    } finally {
      setLoading(false)
    }
  }, [proyectoId, supabase])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  useEffect(() => {
    async function checkResident() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsResident(Boolean(user?.email && user.email.toLowerCase() === residentEmail))
    }
    void checkResident()
  }, [supabase, residentEmail])

  const tramosFiltrados = useMemo(
    () => filtrarTramos(tramos, filtros, puntosAvance),
    [tramos, filtros, puntosAvance]
  )

  const kpis = useMemo(
    () => calcularKpisTramos(tramosFiltrados, puntosAvance),
    [tramosFiltrados, puntosAvance]
  )

  const tramoSeleccionadoId = tramoSeleccionado?.id ?? null

  function handleTramoClick(tramo: CanalTramo) {
    setTramoSeleccionado(tramo)
    setPanelAbierto(true)
    setPanelError(null)
  }

  async function handleSubmitTramo(tramoId: string, values: TramoFormValues) {
    setSaving(true)
    setPanelError(null)
    try {
      const { error: updateError } = await supabase
        .from("canal_tramos")
        .update({
          estado: values.estado,
          avance_pct: values.avance_pct,
          metros_ejecutados: values.metros_ejecutados,
          fecha_inicio: trimOrNull(values.fecha_inicio),
          fecha_fin: trimOrNull(values.fecha_fin),
          semana_programada: trimOrNull(values.semana_programada),
          maquinaria_asignada: trimOrNull(values.maquinaria_asignada),
          observaciones: trimOrNull(values.observaciones),
          updated_at: new Date().toISOString(),
        })
        .eq("id", tramoId)

      if (updateError) throw new Error(updateError.message)

      await cargarDatos()
      setTramoSeleccionado((prev) =>
        prev?.id === tramoId
          ? {
              ...prev,
              ...values,
              fecha_inicio: trimOrNull(values.fecha_inicio),
              fecha_fin: trimOrNull(values.fecha_fin),
              semana_programada: trimOrNull(values.semana_programada),
              maquinaria_asignada: trimOrNull(values.maquinaria_asignada),
              observaciones: trimOrNull(values.observaciones),
            }
          : prev
      )
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "No se pudo guardar el tramo.")
    } finally {
      setSaving(false)
    }
  }

  function handleSolicitarConfirmacion(
    propuesta: PropuestaPuntoMinitramo,
    opciones?: SolicitarConfirmacionAvanceOptions
  ) {
    setPropuestaConfirm(propuesta)
    setConfirmModo(opciones?.modo ?? "nuevo")
    setConfirmPuntoId(opciones?.puntoId)
    setConfirmRegistroFotoId(opciones?.registroFotoId ?? null)
    setConfirmModalAbierto(true)
    setPanelError(null)
  }

  function cerrarConfirmacion() {
    setConfirmModalAbierto(false)
    setPropuestaConfirm(null)
    setConfirmPuntoId(undefined)
    setConfirmRegistroFotoId(null)
  }

  async function handleConfirmarPunto(payload: ConfirmarPuntoPayload) {
    setConfirmandoAvance(true)
    setPanelError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setPanelError("Sesión no válida.")
        return
      }

      if (payload.modo === "corregir" && payload.puntoId) {
        await corregirPuntoMinitramo(supabase, {
          tramo: payload.tramo,
          puntoId: payload.puntoId,
          punto: payload.punto,
          estado: payload.estado,
        })
      } else {
        await confirmarPuntoMinitramo(supabase, {
          tramo: payload.tramo,
          punto: payload.punto,
          rol: payload.rol,
          orden: payload.orden,
          estado: payload.estado,
          registro_foto_id: payload.registro_foto_id,
          userId: user.id,
        })
      }

      if (payload.jornada) {
        try {
          await crearRegistroMaquinariaTramo(supabase, payload.tramo.id, payload.jornada)
        } catch (jornadaErr) {
          await cargarDatos()
          setPanelError(
            jornadaErr instanceof Error
              ? `Punto guardado, pero la jornada no se registró: ${jornadaErr.message}`
              : "Punto guardado, pero no se pudo registrar la jornada."
          )
          cerrarConfirmacion()
          setPuntosRefreshKey((k) => k + 1)
          return
        }
      }

      await cargarDatos()
      cerrarConfirmacion()
      setPuntosRefreshKey((k) => k + 1)
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "No se pudo confirmar el punto.")
    } finally {
      setConfirmandoAvance(false)
    }
  }

  async function handleReiniciarOrigenTramo() {
    if (!tramoSeleccionado) return
    setReiniciandoOrigen(true)
    setPanelError(null)
    try {
      await reiniciarOrigenTramoYPuntos(supabase, tramoSeleccionado)
      await cargarDatos()
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "No se pudo reiniciar el tramo.")
      throw err
    } finally {
      setReiniciandoOrigen(false)
    }
  }

  async function handleGuardarOrigenInicio(
    origen: OrigenExtremoTramo,
    opciones?: { marcarEnEjecucion?: boolean }
  ) {
    if (!tramoSeleccionado) return
    setGuardandoOrigen(true)
    setPanelError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setPanelError("Sesión no válida.")
        return
      }

      await guardarOrigenTramoEInicio(supabase, {
        tramo: tramoSeleccionado,
        origen_extremo: origen,
        userId: user.id,
        marcarEnEjecucion: opciones?.marcarEnEjecucion,
      })

      await cargarDatos()
      setTramoSeleccionado((prev) =>
        prev ? { ...prev, origen_extremo: origen } : prev
      )
      setPuntosRefreshKey((k) => k + 1)
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "No se pudo configurar el inicio.")
      throw err
    } finally {
      setGuardandoOrigen(false)
    }
  }

  async function handleEstadoPuntoChange(puntoId: string, estado: EstadoTramo | null) {
    if (!tramoSeleccionado) return
    setGuardandoEstadoMinitramoId(puntoId)
    setPanelError(null)
    try {
      await actualizarEstadoPuntoAvance(supabase, tramoSeleccionado.id, puntoId, estado)
      await recalcularAvanceTramoDesdePuntos(supabase, tramoSeleccionado)
      await cargarDatos()
      setPuntosRefreshKey((k) => k + 1)
    } catch (err) {
      setPanelError(
        err instanceof Error ? err.message : "No se pudo guardar el estado del punto."
      )
    } finally {
      setGuardandoEstadoMinitramoId(null)
    }
  }

  async function handleEstadoMinitramoChange(puntoFinId: string, estado: EstadoTramo) {
    await handleEstadoPuntoChange(puntoFinId, estado)
  }

  async function handleEliminarMinitramo(segmentoPuntoFinId: string) {
    if (!tramoSeleccionado) return
    if (!window.confirm("¿Eliminar este minitramo (punto final)?")) return
    setEliminandoId(segmentoPuntoFinId)
    setPanelError(null)
    try {
      await eliminarMinitramo(supabase, segmentoPuntoFinId, tramoSeleccionado)
      await cargarDatos()
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "No se pudo eliminar.")
    } finally {
      setEliminandoId(null)
    }
  }

  async function handleEliminarPuntoHuérfano(puntoId: string) {
    if (!tramoSeleccionado) return
    setEliminandoId(puntoId)
    setPanelError(null)
    try {
      await eliminarPuntoHuérfano(supabase, puntoId, tramoSeleccionado)
      await cargarDatos()
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "No se pudo eliminar el punto.")
    } finally {
      setEliminandoId(null)
    }
  }

  const puntosPreviosConfirm = useMemo(() => {
    if (!propuestaConfirm) return []
    return puntosAvance.filter((p) => p.tramo_id === propuestaConfirm.tramo.id)
  }, [puntosAvance, propuestaConfirm])

  const visitante = !isResident
  const visitanteMovil = visitante && esViewportMovil

  const mapaLeaflet = (
    <MapaTramosLeaflet
      tramos={tramosFiltrados}
      tramoSeleccionadoId={tramoSeleccionadoId}
      puntosAvance={puntosAvance}
      isResident={isResident}
      esViewportMovil={esViewportMovil}
      modoMapaVisitanteMovil={visitanteMovil}
      marcadoresCompactos={visitanteMovil}
      onTramoClick={handleTramoClick}
      onSegmentoVisitanteClick={
        isResident
          ? undefined
          : (segmento) =>
              setTramoVisitanteModal({ tramo: segmento.tramo, segmentoDestacado: segmento })
      }
    />
  )

  return (
    <ProyectoModuloGuard modulo="mapaTramos">
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <Card className="border-foreground/10">
            {isResident ? (
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80">
                    <Map className="size-4" aria-hidden />
                  </div>
                  <div>
                    <CardTitle>Mapa interactivo</CardTitle>
                    <CardDescription>
                      Haga clic en un tramo para ver detalle y registrar avance (residente). Los
                      colores indican el estado de desasolve.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            ) : null}
            <CardContent className={cn("space-y-4", visitante && "pt-4")}>
              {error ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              {visitante ? (
                <>
                  <MapaTramosKpisBar
                    kpis={kpis}
                    modo="stack"
                    chipsCarrusel={visitanteMovil}
                  />
                  <p className="text-sm text-muted-foreground">
                    {visitanteMovil
                      ? "Toque un tramo coloreado para ver detalle."
                      : "Pase el cursor sobre un tramo coloreado para ver minitramos, o haga clic para abrir el resumen."}
                  </p>
                  <MapaTramosLeyenda compact={visitanteMovil} />
                  {mapaLeaflet}
                  {visitanteMovil ? (
                    <MapaTramosFiltrosSheet
                      filtros={filtros}
                      tramos={tramos}
                      semanas={semanasProgramadasUnicas(tramos)}
                      onChange={setFiltros}
                    />
                  ) : (
                    <MapaTramosFiltros
                      filtros={filtros}
                      tramos={tramos}
                      semanas={semanasProgramadasUnicas(tramos)}
                      onChange={setFiltros}
                    />
                  )}
                </>
              ) : (
                <>
                  <MapaTramosKpis kpis={kpis} />
                  <MapaTramosFiltros
                    filtros={filtros}
                    tramos={tramos}
                    semanas={semanasProgramadasUnicas(tramos)}
                    onChange={setFiltros}
                  />
                  <MapaTramosLeyenda />
                  {mapaLeaflet}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TramoDetallePanel
        tramo={tramoSeleccionado}
        open={panelAbierto}
        onOpenChange={setPanelAbierto}
        detalleEnBottomSheet={esViewportMovil}
        isResident={isResident}
        loading={saving}
        proyectoId={proyectoId}
        puntosAvance={puntosAvance}
        puntosRefreshKey={puntosRefreshKey}
        eliminandoId={eliminandoId}
        panelError={panelError}
        onClearPanelError={() => setPanelError(null)}
        onSubmit={handleSubmitTramo}
        onSolicitarConfirmacionAvance={handleSolicitarConfirmacion}
        onEliminarMinitramo={isResident ? handleEliminarMinitramo : undefined}
        onEliminarPuntoHuérfano={isResident ? handleEliminarPuntoHuérfano : undefined}
        onEstadoMinitramoChange={isResident ? handleEstadoMinitramoChange : undefined}
        onEstadoPuntoChange={isResident ? handleEstadoPuntoChange : undefined}
        guardandoEstadoMinitramoId={guardandoEstadoMinitramoId}
        onEvidenciaSubida={() => void cargarDatos()}
        onGuardarOrigenInicio={isResident ? handleGuardarOrigenInicio : undefined}
        guardandoOrigen={guardandoOrigen}
        onReiniciarOrigenTramo={isResident ? handleReiniciarOrigenTramo : undefined}
        reiniciandoOrigen={reiniciandoOrigen}
      />

      {visitante ? (
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
      ) : null}

      <ConfirmarPuntoMinitramoModal
        open={confirmModalAbierto}
        propuestaInicial={propuestaConfirm}
        puntosPrevios={puntosPreviosConfirm}
        registroFotoId={confirmRegistroFotoId}
        modo={confirmModo}
        puntoId={confirmPuntoId}
        loading={confirmandoAvance}
        mostrarRegistrarJornada={isResident}
        onConfirm={handleConfirmarPunto}
        onCancel={cerrarConfirmacion}
      />
    </ProyectoModuloGuard>
  )
}
