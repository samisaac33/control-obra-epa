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
import {
  MapaTramosFiltroTramo,
  MapaTramosFiltros,
  type FiltrosTramos,
} from "@/src/components/mapa/MapaTramosFiltros"
import { MapaSegmentoInfoModal } from "@/src/components/mapa/MapaSegmentoInfoModal"
import { MapaTramosFiltrosSheet } from "@/src/components/mapa/MapaTramosFiltrosSheet"
import { MapaOpcionesCapasMapa } from "@/src/components/mapa/MapaOpcionesCapasMapa"
import { MapaBuscarCoordenadasResidente } from "@/src/components/mapa/MapaBuscarCoordenadasResidente"
import {
  MapaUbicacionResidenteBarra,
  MapaUbicacionResidentePanel,
  MapaUbicacionResidenteProvider,
  type RequiereOrigenDesdeMapaPayload,
} from "@/src/components/mapa/MapaUbicacionResidenteBlock"
import { RegistrarPuntoOrigenDialog } from "@/src/components/mapa/RegistrarPuntoOrigenDialog"
import type { UbicacionUsuario } from "@/src/components/mapa/UbicacionUsuarioEnMapa"
import { MapaTramosKpis } from "@/src/components/mapa/MapaTramosKpis"
import { MapaTramosKpisBar } from "@/src/components/mapa/MapaTramosKpisBar"
import { MapaTramosMapaConBarra } from "@/src/components/mapa/MapaTramosMapaConBarra"
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
import { cargarTramosMapaProyecto } from "@/src/lib/cargar-tramos-mapa-proyecto"
import {
  actualizarFrenteParpadeoTramo,
  frenteParpadeoPorTramoDesdeTramos,
} from "@/src/lib/tramo-frente-mapa"
import { createClient } from "@/src/lib/supabase/client"
import {
  actualizarEstadoPuntoAvance,
  cargarPuntosAvancePorProyecto,
  confirmarPuntoMinitramo,
  renumerarRolesPuntosTramo,
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
import { contextoEditarMinitramo, evaluarPropuestaPuntoConAutoEnlace } from "@/src/lib/tramo-geometria"
import { guardarJornadaMinitramo } from "@/src/lib/tramo-maquinaria-historial"
import {
  calcularKpisTramos,
  filtrarTramos,
  filtrarTramosPorRangoNumerico,
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
  const [confirmModo, setConfirmModo] = useState<"nuevo" | "corregir" | "editar_minitramo">("nuevo")
  const [confirmPuntoId, setConfirmPuntoId] = useState<string | undefined>()
  const [editarEtiquetaMinitramo, setEditarEtiquetaMinitramo] = useState<string | undefined>()
  const [editarEstadoInicial, setEditarEstadoInicial] = useState<EstadoTramo | undefined>()
  const [confirmRegistroFotoId, setConfirmRegistroFotoId] = useState<string | null>(null)
  const [confirmandoAvance, setConfirmandoAvance] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)
  const [guardandoEstadoMinitramoId, setGuardandoEstadoMinitramoId] = useState<string | null>(null)
  const [guardandoFrenteParpadeoPuntoId, setGuardandoFrenteParpadeoPuntoId] = useState<
    string | null
  >(null)
  const [panelError, setPanelError] = useState<string | null>(null)
  const [tramoVisitanteModal, setTramoVisitanteModal] = useState<{
    tramo: CanalTramo
    segmentoDestacado: SegmentoVisualTramo
  } | null>(null)
  const esViewportMovil = useEsViewportMovil()
  const [vistaSoloTramos1a24, setVistaSoloTramos1a24] = useState(false)
  const [mostrarNumerosTramo, setMostrarNumerosTramo] = useState(false)
  const [mostrarPuntosAvance, setMostrarPuntosAvance] = useState(false)
  const [ocultarMinitramosTerminados, setOcultarMinitramosTerminados] = useState(false)
  const [mapaConsolidado, setMapaConsolidado] = useState(true)
  const [ubicacionResidente, setUbicacionResidente] = useState<UbicacionUsuario | null>(null)
  const [seguirUbicacionResidente, setSeguirUbicacionResidente] = useState(false)
  const [origenDesdeMapa, setOrigenDesdeMapa] = useState<RequiereOrigenDesdeMapaPayload | null>(
    null
  )
  const [gpsPendienteTrasOrigen, setGpsPendienteTrasOrigen] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [centrarUbicacionKey, setCentrarUbicacionKey] = useState(0)
  const cargarDatos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { tramos: tramosNormalizados, puntosAvance: puntos } = await cargarTramosMapaProyecto(
        supabase,
        proyectoId
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

  const tramosParaVista = useMemo(
    () =>
      vistaSoloTramos1a24 ? filtrarTramosPorRangoNumerico(tramos, 1, 24) : tramos,
    [tramos, vistaSoloTramos1a24]
  )

  const tramosFiltrados = useMemo(
    () => filtrarTramos(tramosParaVista, filtros, puntosAvance),
    [tramosParaVista, filtros, puntosAvance]
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
    setConfirmModo("nuevo")
    setEditarEtiquetaMinitramo(undefined)
    setEditarEstadoInicial(undefined)
  }

  function handleSolicitarEditarMinitramo(puntoFinId: string) {
    if (!tramoSeleccionado) return
    const puntos = puntosAvance.filter(
      (p) => p.tramo_id === tramoSeleccionado.id && p.confirmado
    )
    const ctx = contextoEditarMinitramo(tramoSeleccionado, puntos, puntoFinId)
    if (!ctx) {
      setPanelError("No se pudo abrir la edición de este minitramo.")
      return
    }
    setPropuestaConfirm(ctx.propuestaInicial)
    setConfirmModo("editar_minitramo")
    setConfirmPuntoId(ctx.puntoFinId)
    setEditarEtiquetaMinitramo(ctx.etiquetaMinitramo)
    setEditarEstadoInicial(ctx.estadoActual)
    setConfirmRegistroFotoId(null)
    setConfirmModalAbierto(true)
    setPanelError(null)
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

      let nuevoPuntoIdConfirmado: string | undefined

      if (
        (payload.modo === "corregir" || payload.modo === "editar_minitramo") &&
        payload.puntoId
      ) {
        await corregirPuntoMinitramo(supabase, {
          tramo: payload.tramo,
          puntoId: payload.puntoId,
          punto: payload.punto,
          estado: payload.estado,
        })
      } else {
        nuevoPuntoIdConfirmado = await confirmarPuntoMinitramo(supabase, {
          tramo: payload.tramo,
          punto: payload.punto,
          rol: payload.rol,
          orden: payload.orden,
          estado: payload.estado,
          registro_foto_id: payload.registro_foto_id,
          userId: user.id,
          punto_enlace_id: payload.puntoEnlaceId ?? null,
        })
      }

      const puntoJornada =
        payload.puntoAvanceIdJornada ??
        payload.puntoId ??
        nuevoPuntoIdConfirmado ??
        null

      if (payload.jornada && puntoJornada) {
        try {
          await guardarJornadaMinitramo(
            supabase,
            payload.tramo.id,
            puntoJornada,
            payload.jornada,
            payload.registroJornadaId
          )
        } catch (jornadaErr) {
          await cargarDatos()
          const prefijoGuardado =
            payload.modo === "editar_minitramo"
              ? "Cambios guardados, pero la jornada no se registró"
              : "Punto guardado, pero la jornada no se registró"
          setPanelError(
            jornadaErr instanceof Error
              ? `${prefijoGuardado}: ${jornadaErr.message}`
              : payload.modo === "editar_minitramo"
                ? "Cambios guardados, pero no se pudo registrar la jornada."
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
    opciones?: { marcarEnEjecucion?: boolean },
    tramoOverride?: CanalTramo
  ) {
    const tramo = tramoOverride ?? tramoSeleccionado
    if (!tramo) return
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
        tramo,
        origen_extremo: origen,
        userId: user.id,
        marcarEnEjecucion: opciones?.marcarEnEjecucion,
      })

      await cargarDatos()
      setTramoSeleccionado((prev) => {
        if (prev?.id === tramo.id) {
          return { ...prev, origen_extremo: origen }
        }
        return prev ?? { ...tramo, origen_extremo: origen }
      })
      setPuntosRefreshKey((k) => k + 1)
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "No se pudo configurar el inicio.")
      throw err
    } finally {
      setGuardandoOrigen(false)
    }
  }

  const handleUbicacionResidenteChange = useCallback(
    (ubicacion: UbicacionUsuario | null, seguir: boolean) => {
      setUbicacionResidente(ubicacion)
      setSeguirUbicacionResidente(seguir)
    },
    []
  )

  const handleTramoDetectadoDesdeGps = useCallback((tramo: CanalTramo | null) => {
    if (tramo) {
      setTramoSeleccionado(tramo)
    }
  }, [])

  const handleCentrarMapaEnUbicacion = useCallback(() => {
    setCentrarUbicacionKey((k) => k + 1)
  }, [])

  function abrirConfirmacionDesdeGps(
    tramo: CanalTramo,
    lat: number,
    lng: number,
    puntosFuente: TramoPuntoAvance[] = puntosAvance
  ) {
    const puntosDelTramo = puntosFuente.filter((p) => p.tramo_id === tramo.id && p.confirmado)
    const { propuesta, motivoBloqueo } = evaluarPropuestaPuntoConAutoEnlace(
      tramo,
      puntosDelTramo,
      lat,
      lng
    )
    if (!propuesta) {
      setPanelError(motivoBloqueo ?? "No se pudo calcular el punto en este tramo.")
      return
    }
    handleSolicitarConfirmacion(propuesta)
  }

  function handleRequiereConfigurarOrigenDesdeMapa(payload: RequiereOrigenDesdeMapaPayload) {
    setTramoSeleccionado(payload.tramo)
    setGpsPendienteTrasOrigen({ lat: payload.lat, lng: payload.lng })
    setOrigenDesdeMapa(payload)
    setPanelError(null)
  }

  async function handleConfirmarOrigenDesdeMapa(
    origen: OrigenExtremoTramo,
    opciones?: { marcarEnEjecucion?: boolean }
  ) {
    if (!origenDesdeMapa) return
    const coords = gpsPendienteTrasOrigen ?? {
      lat: origenDesdeMapa.lat,
      lng: origenDesdeMapa.lng,
    }
    const tramoBase = origenDesdeMapa.tramo
    await handleGuardarOrigenInicio(origen, opciones, tramoBase)
    setOrigenDesdeMapa(null)
    setGpsPendienteTrasOrigen(null)

    const puntosFresh = await cargarPuntosAvancePorProyecto(supabase, proyectoId)
    setPuntosAvance(puntosFresh)
    const tramoActualizado = { ...tramoBase, origen_extremo: origen }
    abrirConfirmacionDesdeGps(tramoActualizado, coords.lat, coords.lng, puntosFresh)
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

  const puntoFrenteParpadeoPorTramo = useMemo(
    () => frenteParpadeoPorTramoDesdeTramos(tramos, puntosAvance),
    [tramos, puntosAvance]
  )

  const handleFrenteTrabajoParpadeo = useCallback(
    async (tramoId: string, puntoId: string) => {
      const tramo = tramos.find((t) => t.id === tramoId)
      if (!tramo) return

      const activo = tramo.punto_frente_mapa_id === puntoId
      const nextPuntoId = activo ? null : puntoId

      setGuardandoFrenteParpadeoPuntoId(puntoId)
      setPanelError(null)
      const tramosSnapshot = tramos
      const tramoSeleccionadoSnapshot = tramoSeleccionado

      const patchFrente = (t: CanalTramo): CanalTramo =>
        t.id === tramoId ? { ...t, punto_frente_mapa_id: nextPuntoId } : t

      setTramos((prev) => prev.map(patchFrente))
      setTramoSeleccionado((prev) => (prev?.id === tramoId ? patchFrente(prev) : prev))

      try {
        await actualizarFrenteParpadeoTramo(supabase, tramoId, nextPuntoId)
      } catch (err) {
        setTramos(tramosSnapshot)
        setTramoSeleccionado(tramoSeleccionadoSnapshot)
        setPanelError(
          err instanceof Error ? err.message : "No se pudo guardar el frente en el mapa."
        )
      } finally {
        setGuardandoFrenteParpadeoPuntoId(null)
      }
    },
    [tramos, tramoSeleccionado, supabase]
  )

  const puntoIdsParpadeoFrente = useMemo(() => {
    return new Set(Object.values(puntoFrenteParpadeoPorTramo))
  }, [puntoFrenteParpadeoPorTramo])

  async function handleRenumerarPuntosTramo() {
    if (!tramoSeleccionado) return
    if (
      !window.confirm(
        "¿Renumerar A, B, C… según la posición de cada punto en el canal? Corrige minitramos y avance cuando hubo enlaces ramificados."
      )
    ) {
      return
    }
    setPanelError(null)
    try {
      await renumerarRolesPuntosTramo(supabase, tramoSeleccionado)
      await cargarDatos()
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "No se pudo renumerar los puntos.")
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

  const visitante = !isResident
  const visitanteMovil = visitante && esViewportMovil

  const ubicacionResidenteProps = useMemo(
    () => ({
      tramos,
      puntosAvance,
      onUbicacionChange: handleUbicacionResidenteChange,
      onTramoDetectado: handleTramoDetectadoDesdeGps,
      onSolicitarConfirmacion: handleSolicitarConfirmacion,
      onRequiereConfigurarOrigen: handleRequiereConfigurarOrigenDesdeMapa,
      onCentrarMapaEnUbicacion: handleCentrarMapaEnUbicacion,
    }),
    [
      tramos,
      puntosAvance,
      handleUbicacionResidenteChange,
      handleTramoDetectadoDesdeGps,
      handleRequiereConfigurarOrigenDesdeMapa,
      handleCentrarMapaEnUbicacion,
    ]
  )

  const mapaLeaflet = (
    <MapaTramosLeaflet
      tramos={tramosFiltrados}
      tramoSeleccionadoId={tramoSeleccionadoId}
      puntosAvance={puntosAvance}
      isResident={isResident}
      esViewportMovil={esViewportMovil}
      modoMapaVisitanteMovil={visitanteMovil}
      alturaResponsiveResidente={isResident}
      marcadoresCompactos={visitanteMovil}
      mostrarEtiquetasTramo={mostrarNumerosTramo}
      mostrarPuntosAvance={mostrarPuntosAvance}
      mostrarMinitramosTerminados={!ocultarMinitramosTerminados}
      mapaConsolidado={mapaConsolidado}
      onTramoClick={handleTramoClick}
      onSegmentoVisitanteClick={
        isResident
          ? undefined
          : (segmento) =>
              setTramoVisitanteModal({ tramo: segmento.tramo, segmentoDestacado: segmento })
      }
      ubicacionUsuario={isResident ? ubicacionResidente : null}
      seguirUbicacionUsuario={isResident ? seguirUbicacionResidente : false}
      centrarUbicacionVersion={isResident ? centrarUbicacionKey : 0}
      puntoIdsParpadeoFrente={puntoIdsParpadeoFrente}
    />
  )

  return (
    <ProyectoModuloGuard modulo="mapaTramos">
      <div className="p-3 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
          <Card className="border-foreground/10">
            {isResident ? (
              <CardHeader className="max-md:pb-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80">
                    <Map className="size-4" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="max-md:text-base">Mapa interactivo</CardTitle>
                    <CardDescription className="hidden md:block">
                      Haga clic en un tramo para ver detalle y registrar avance (residente). Los
                      colores indican el estado de desasolve.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            ) : null}
            <CardContent
              className={cn(
                isResident ? "max-md:space-y-3 max-md:pt-0 space-y-4" : "space-y-4",
                visitante && "pt-4"
              )}
            >
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
                  {visitanteMovil ? null : (
                    <p className="text-sm text-muted-foreground">
                      Pase el cursor sobre un tramo coloreado para ver minitramos, o haga clic para
                      abrir el resumen.
                    </p>
                  )}
                  <MapaTramosLeyenda compact={visitanteMovil} />
                  {visitanteMovil ? null : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0 sm:flex-1">
                        <MapaTramosFiltroTramo
                          filtros={filtros}
                          tramos={tramos}
                          onChange={setFiltros}
                          selectId="filtro-tramo-visitante-inline"
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
                        idPrefix="visitante"
                        className="sm:max-w-md sm:flex-1"
                      />
                    </div>
                  )}
                  {mapaLeaflet}
                  {visitanteMovil ? (
                    <MapaTramosFiltrosSheet
                      variant="visitanteTramoCapas"
                      filtros={filtros}
                      tramos={tramos}
                      semanas={semanasProgramadasUnicas(tramos)}
                      onChange={setFiltros}
                      capas={{
                        vistaSoloTramos1a24,
                        onVistaSoloTramos1a24Change: setVistaSoloTramos1a24,
                        mostrarNumerosTramo,
                        onMostrarNumerosTramoChange: setMostrarNumerosTramo,
                        mostrarPuntosAvance,
                        onMostrarPuntosAvanceChange: setMostrarPuntosAvance,
                        ocultarMinitramosTerminados,
                        onOcultarMinitramosTerminadosChange: setOcultarMinitramosTerminados,
                        mapaConsolidado,
                        onMapaConsolidadoChange: setMapaConsolidado,
                        idPrefix: "visitante-movil",
                      }}
                    />
                  ) : (
                    <MapaTramosFiltros
                      filtros={filtros}
                      tramos={tramos}
                      semanas={semanasProgramadasUnicas(tramos)}
                      onChange={setFiltros}
                      campos={["estado", "semana"]}
                    />
                  )}
                </>
              ) : (
                <MapaUbicacionResidenteProvider {...ubicacionResidenteProps}>
                  <div className="md:hidden">
                    <MapaTramosKpisBar kpis={kpis} modo="stack" chipsCarrusel compact />
                  </div>
                  <div className="hidden space-y-4 md:block">
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
                      idPrefix="residente"
                    />
                    <MapaUbicacionResidentePanel />
                    <MapaBuscarCoordenadasResidente />
                    <MapaTramosKpis kpis={kpis} />
                    <MapaTramosFiltros
                      filtros={filtros}
                      tramos={tramos}
                      semanas={semanasProgramadasUnicas(tramos)}
                      onChange={setFiltros}
                    />
                    <MapaTramosLeyenda />
                  </div>
                  <MapaTramosMapaConBarra
                    barraInferior={
                      <div className="md:hidden">
                        <MapaUbicacionResidenteBarra />
                      </div>
                    }
                  >
                    {mapaLeaflet}
                  </MapaTramosMapaConBarra>
                  <div className="md:hidden">
                    <MapaBuscarCoordenadasResidente />
                  </div>
                  <div className="md:hidden">
                    <MapaTramosFiltrosSheet
                      filtros={filtros}
                      tramos={tramos}
                      semanas={semanasProgramadasUnicas(tramos)}
                      onChange={setFiltros}
                      triggerLabel="Filtros y capas"
                      camposFiltro={["estado", "tramo", "semana"]}
                      leyendaCompact
                      capas={{
                        vistaSoloTramos1a24,
                        onVistaSoloTramos1a24Change: setVistaSoloTramos1a24,
                        mostrarNumerosTramo,
                        onMostrarNumerosTramoChange: setMostrarNumerosTramo,
                        mostrarPuntosAvance,
                        onMostrarPuntosAvanceChange: setMostrarPuntosAvance,
                        ocultarMinitramosTerminados,
                        onOcultarMinitramosTerminadosChange: setOcultarMinitramosTerminados,
                        mapaConsolidado,
                        onMapaConsolidadoChange: setMapaConsolidado,
                        idPrefix: "residente-movil",
                      }}
                    />
                  </div>
                </MapaUbicacionResidenteProvider>
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
        onEditarMinitramo={isResident ? handleSolicitarEditarMinitramo : undefined}
        onEliminarPuntoHuérfano={isResident ? handleEliminarPuntoHuérfano : undefined}
        onEstadoMinitramoChange={isResident ? handleEstadoMinitramoChange : undefined}
        onEstadoPuntoChange={isResident ? handleEstadoPuntoChange : undefined}
        puntoFrenteParpadeoId={
          tramoSeleccionado ? (puntoFrenteParpadeoPorTramo[tramoSeleccionado.id] ?? null) : null
        }
        onFrenteTrabajoParpadeo={
          isResident && tramoSeleccionado
            ? (puntoId) => void handleFrenteTrabajoParpadeo(tramoSeleccionado.id, puntoId)
            : undefined
        }
        guardandoEstadoMinitramoId={guardandoEstadoMinitramoId ?? guardandoFrenteParpadeoPuntoId}
        onEvidenciaSubida={() => void cargarDatos()}
        onGuardarOrigenInicio={isResident ? handleGuardarOrigenInicio : undefined}
        guardandoOrigen={guardandoOrigen}
        onReiniciarOrigenTramo={isResident ? handleReiniciarOrigenTramo : undefined}
        reiniciandoOrigen={reiniciandoOrigen}
        onRenumerarPuntosTramo={isResident ? handleRenumerarPuntosTramo : undefined}
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

      <RegistrarPuntoOrigenDialog
        open={origenDesdeMapa !== null}
        tramo={origenDesdeMapa?.tramo ?? null}
        loading={guardandoOrigen}
        onConfirmar={handleConfirmarOrigenDesdeMapa}
        onCancel={() => {
          setOrigenDesdeMapa(null)
          setGpsPendienteTrasOrigen(null)
        }}
      />

      <ConfirmarPuntoMinitramoModal
        open={confirmModalAbierto}
        propuestaInicial={propuestaConfirm}
        puntosPrevios={puntosPreviosConfirm}
        registroFotoId={confirmRegistroFotoId}
        modo={confirmModo}
        puntoId={confirmPuntoId}
        etiquetaMinitramo={editarEtiquetaMinitramo}
        estadoInicialMinitramo={editarEstadoInicial}
        loading={confirmandoAvance}
        mostrarRegistrarJornada={isResident}
        onConfirm={handleConfirmarPunto}
        onCancel={cerrarConfirmacion}
      />
    </ProyectoModuloGuard>
  )
}
