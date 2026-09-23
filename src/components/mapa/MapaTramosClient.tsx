"use client"

import dynamic from "next/dynamic"
import { Map } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ConfirmarPuntoMinitramoModal,
  type ConfirmarPuntoPayload,
} from "@/src/components/mapa/ConfirmarPuntoMinitramoModal"
import { MapaTramosFiltros, type FiltrosTramos } from "@/src/components/mapa/MapaTramosFiltros"
import { MapaTramosKpis } from "@/src/components/mapa/MapaTramosKpis"
import { MapaTramosLeyenda } from "@/src/components/mapa/MapaTramosLeyenda"
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
  actualizarEstadoMinitramo,
  cargarPuntosAvancePorProyecto,
  confirmarPuntoMinitramo,
  corregirPuntoMinitramo,
  eliminarMinitramo,
  eliminarPuntoHuérfano,
  guardarOrigenTramoEInicio,
} from "@/src/lib/tramo-avance-coordenadas"
import type { PropuestaPuntoMinitramo, TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import {
  calcularKpisTramos,
  canalesUnicos,
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
  const [error, setError] = useState<string | null>(null)
  const [isResident, setIsResident] = useState(false)
  const [tramoSeleccionado, setTramoSeleccionado] = useState<CanalTramo | null>(null)
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosTramos>({
    estado: "todos",
    canal: "todos",
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

      setTramos((tramosData ?? []).map((row) => normalizarTramo(row as Record<string, unknown>)))
      setPuntosAvance(puntos)
      setPuntosRefreshKey((k) => k + 1)
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
    () => filtrarTramos(tramos, filtros),
    [tramos, filtros]
  )

  const kpis = useMemo(() => calcularKpisTramos(tramosFiltrados), [tramosFiltrados])

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

      await cargarDatos()
      cerrarConfirmacion()
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "No se pudo confirmar el punto.")
    } finally {
      setConfirmandoAvance(false)
    }
  }

  async function handleGuardarOrigenInicio(origen: OrigenExtremoTramo) {
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
      })

      await cargarDatos()
      setTramoSeleccionado((prev) =>
        prev ? { ...prev, origen_extremo: origen } : prev
      )
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "No se pudo configurar el inicio.")
      throw err
    } finally {
      setGuardandoOrigen(false)
    }
  }

  async function handleEstadoMinitramoChange(puntoFinId: string, estado: EstadoTramo) {
    setGuardandoEstadoMinitramoId(puntoFinId)
    setPanelError(null)
    try {
      await actualizarEstadoMinitramo(supabase, puntoFinId, estado)
      await cargarDatos()
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "No se pudo guardar el estado del minitramo.")
    } finally {
      setGuardandoEstadoMinitramoId(null)
    }
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

  return (
    <ProyectoModuloGuard modulo="mapaTramos">
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <Card className="border-foreground/10">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80">
                  <Map className="size-4" aria-hidden />
                </div>
                <div>
                  <CardTitle>Mapa interactivo</CardTitle>
                  <CardDescription>
                    Haga clic en un tramo para ver detalle y registrar avance
                    {isResident ? " (residente)" : ""}. Los colores indican el estado de desasolve.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <MapaTramosKpis kpis={kpis} />

              <MapaTramosFiltros
                filtros={filtros}
                canales={canalesUnicos(tramos)}
                semanas={semanasProgramadasUnicas(tramos)}
                onChange={setFiltros}
              />

              <MapaTramosLeyenda />

              <MapaTramosLeaflet
                tramos={tramosFiltrados}
                tramoSeleccionadoId={tramoSeleccionadoId}
                puntosAvance={puntosAvance}
                onTramoClick={handleTramoClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <TramoDetallePanel
        tramo={tramoSeleccionado}
        open={panelAbierto}
        onOpenChange={setPanelAbierto}
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
        guardandoEstadoMinitramoId={guardandoEstadoMinitramoId}
        onEvidenciaSubida={() => void cargarDatos()}
        onGuardarOrigenInicio={isResident ? handleGuardarOrigenInicio : undefined}
        guardandoOrigen={guardandoOrigen}
      />

      <ConfirmarPuntoMinitramoModal
        open={confirmModalAbierto}
        propuestaInicial={propuestaConfirm}
        puntosPrevios={puntosPreviosConfirm}
        registroFotoId={confirmRegistroFotoId}
        modo={confirmModo}
        puntoId={confirmPuntoId}
        loading={confirmandoAvance}
        onConfirm={handleConfirmarPunto}
        onCancel={cerrarConfirmacion}
      />
    </ProyectoModuloGuard>
  )
}
