"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { MapaOverlayPortal } from "@/src/components/mapa/MapaOverlayPortal"
import {
  Z_MAPA_DIALOG,
  Z_MAPA_SELECT_EN_DIALOG,
} from "@/src/lib/mapa-capas-z"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RegistrarJornadaTramoFields } from "@/src/components/mapa/RegistrarJornadaTramoFields"
import {
  buscarRegistroJornadaLegacyParaPunto,
  estadoInicialJornada,
  jornadaFormDesdeRegistro,
  jornadaInputDesdeFormState,
  type RegistrarJornadaFormState,
  validarJornadaFormState,
} from "@/src/components/mapa/registrar-jornada-tramo-utils"
import type { CanalTramo } from "@/src/data/tramos/types"
import { ESTADOS_TRAMO_MAPA, etiquetaEstadoTramo } from "@/src/data/tramos/types"
import type { TramoRegistroMaquinariaInput } from "@/src/lib/tramo-maquinaria-historial"
import type { PropuestaPuntoMinitramo, TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import {
  calcularPropuestaPunto,
  longitudMinitramoMetros,
  minitramosDesdePuntos,
} from "@/src/lib/tramo-geometria"
import {
  cargarRegistroMaquinariaPorPuntoAvance,
  cargarRegistrosMaquinariaTramo,
} from "@/src/lib/tramo-maquinaria-historial"
import {
  cargarEquiposMaquinariaProyecto,
  type ProyectoEquipoMaquinaria,
} from "@/src/lib/proyecto-equipos-maquinaria"
import { createClient } from "@/src/lib/supabase/client"

const MiniMapaTramoPunto = dynamic(
  () => import("@/src/components/mapa/MiniMapaTramoPunto").then((m) => m.MiniMapaTramoPunto),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Cargando mapa...
      </div>
    ),
  }
)

export type ConfirmarPuntoPayload = {
  tramo: CanalTramo
  punto: PropuestaPuntoMinitramo["punto"]
  rol: string
  orden: number
  estado: PropuestaPuntoMinitramo["estado_sugerido"]
  registro_foto_id?: string | null
  modo?: "nuevo" | "corregir" | "editar_minitramo"
  puntoId?: string
  jornada?: TramoRegistroMaquinariaInput | null
  registroJornadaId?: string
  puntoAvanceIdJornada?: string
  puntoEnlaceId?: string
}

type ConfirmarPuntoMinitramoModalProps = {
  open: boolean
  propuestaInicial: PropuestaPuntoMinitramo | null
  puntosPrevios: TramoPuntoAvance[]
  registroFotoId?: string | null
  modo?: "nuevo" | "corregir" | "editar_minitramo"
  puntoId?: string
  etiquetaMinitramo?: string
  estadoInicialMinitramo?: PropuestaPuntoMinitramo["estado_sugerido"]
  loading?: boolean
  mostrarRegistrarJornada?: boolean
  onConfirm: (payload: ConfirmarPuntoPayload) => Promise<void>
  onCancel: () => void
}

const INPUT_CLASS = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"

export function ConfirmarPuntoMinitramoModal({
  open,
  propuestaInicial,
  puntosPrevios,
  registroFotoId,
  modo = "nuevo",
  puntoId,
  etiquetaMinitramo,
  estadoInicialMinitramo,
  loading = false,
  mostrarRegistrarJornada = false,
  onConfirm,
  onCancel,
}: ConfirmarPuntoMinitramoModalProps) {
  const supabase = useMemo(() => createClient(), [])
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [estado, setEstado] = useState<PropuestaPuntoMinitramo["estado_sugerido"]>("pendiente")
  const [incluirJornada, setIncluirJornada] = useState(false)
  const [jornadaForm, setJornadaForm] = useState<RegistrarJornadaFormState>(() => estadoInicialJornada())
  const [equiposCatalogo, setEquiposCatalogo] = useState<ProyectoEquipoMaquinaria[]>([])
  const [registroJornadaId, setRegistroJornadaId] = useState<string | undefined>()
  const [errorJornada, setErrorJornada] = useState<string | null>(null)

  useEffect(() => {
    if (!propuestaInicial) return
    setLat(propuestaInicial.punto.lat.toFixed(7))
    setLng(propuestaInicial.punto.lng.toFixed(7))
    setEstado(
      modo === "editar_minitramo" && estadoInicialMinitramo != null
        ? estadoInicialMinitramo
        : propuestaInicial.estado_sugerido
    )
    setErrorJornada(null)
  }, [propuestaInicial, modo, estadoInicialMinitramo])

  useEffect(() => {
    if (!open) {
      setIncluirJornada(false)
      setJornadaForm(estadoInicialJornada())
      setRegistroJornadaId(undefined)
      setErrorJornada(null)
    }
  }, [open])

  useEffect(() => {
    if (!open || !mostrarRegistrarJornada || !propuestaInicial) return

    const cargarJornadaExistente =
      (modo === "corregir" || modo === "editar_minitramo") && Boolean(puntoId)

    if (!cargarJornadaExistente) {
      setRegistroJornadaId(undefined)
      setIncluirJornada(false)
      setJornadaForm(estadoInicialJornada())
      return
    }

    let cancelado = false

    void (async () => {
      const proyectoId = propuestaInicial.tramo.proyecto_id
      const equipos = await cargarEquiposMaquinariaProyecto(supabase, proyectoId, {
        soloActivos: false,
      })
      if (cancelado) return
      setEquiposCatalogo(equipos)

      const puntoAvanceId = puntoId!
      let registro = await cargarRegistroMaquinariaPorPuntoAvance(supabase, puntoAvanceId)

      if (!registro) {
        const registros = await cargarRegistrosMaquinariaTramo(
          supabase,
          propuestaInicial.tramo.id
        )
        const puntosConfirmados = puntosPrevios.filter(
          (p) => p.tramo_id === propuestaInicial.tramo.id && p.confirmado
        )
        const minitramos = minitramosDesdePuntos(
          puntosConfirmados,
          propuestaInicial.tramo.id,
          propuestaInicial.tramo
        )
        const minitramo = minitramos.find((m) => m.puntoFin.id === puntoAvanceId)
        if (minitramo) {
          registro =
            buscarRegistroJornadaLegacyParaPunto(
              propuestaInicial.tramo,
              minitramo.puntoFin,
              registros,
              minitramo.longitud_m
            ) ?? null
        }
      }

      if (cancelado) return

      if (registro) {
        setRegistroJornadaId(registro.id)
        setIncluirJornada(true)
        setJornadaForm(jornadaFormDesdeRegistro(registro, equipos))
      } else {
        setRegistroJornadaId(undefined)
        setIncluirJornada(false)
        setJornadaForm(estadoInicialJornada())
      }
    })()

    return () => {
      cancelado = true
    }
  }, [
    open,
    mostrarRegistrarJornada,
    propuestaInicial,
    modo,
    puntoId,
    puntosPrevios,
    supabase,
  ])

  useEffect(() => {
    if (!open || !mostrarRegistrarJornada || !incluirJornada || !propuestaInicial) return
    void cargarEquiposMaquinariaProyecto(supabase, propuestaInicial.tramo.proyecto_id, {
      soloActivos: true,
    }).then(setEquiposCatalogo)
  }, [open, mostrarRegistrarJornada, incluirJornada, propuestaInicial, supabase])

  const latNum = Number(lat)
  const lngNum = Number(lng)
  const coordsValidas = !Number.isNaN(latNum) && !Number.isNaN(lngNum)

  const propuesta = useMemo(() => {
    if (!propuestaInicial || !coordsValidas) return null
    return calcularPropuestaPunto(propuestaInicial.tramo, puntosPrevios, latNum, lngNum, {
      orden: propuestaInicial.orden,
      puntoEnlaceId: propuestaInicial.puntoEnlaceId,
      ...((modo === "corregir" || modo === "editar_minitramo") && puntoId
        ? { excluirPuntoId: puntoId }
        : {}),
    })
  }, [propuestaInicial, puntosPrevios, latNum, lngNum, coordsValidas, modo, puntoId])

  if (!open || !propuestaInicial) return null

  const esCorreccion = modo === "corregir" || modo === "editar_minitramo"
  const esEditarMinitramo = modo === "editar_minitramo"
  const mostrarJornada = mostrarRegistrarJornada

  function sugerirMetrosJornada(): string {
    if (!propuesta?.cierraMinitramo) return ""
    const enlace = puntosPrevios.find((p) => p.id === propuesta.puntoEnlaceId)
    if (!enlace) return ""
    const longitud = longitudMinitramoMetros(propuesta.tramo, enlace, {
      id: "__propuesta__",
      tramo_id: propuesta.tramo.id,
      registro_foto_id: null,
      lat: propuesta.punto.lat,
      lng: propuesta.punto.lng,
      abscisa_m: propuesta.punto.abscisa_m,
      confirmado: true,
      created_at: new Date().toISOString(),
      rol: propuesta.rol,
    })
    if (longitud <= 0) return ""
    return String(Math.round(longitud * 10) / 10)
  }

  function toggleIncluirJornada(checked: boolean) {
    setIncluirJornada(checked)
    setErrorJornada(null)
    if (checked) {
      setJornadaForm((prev) => {
        if (prev.metros.trim() || prev.equipoSeleccionId.trim()) return prev
        const metrosSugeridos = sugerirMetrosJornada()
        return {
          ...estadoInicialJornada(),
          metros: metrosSugeridos,
        }
      })
    } else {
      setRegistroJornadaId(undefined)
      setJornadaForm(estadoInicialJornada())
    }
  }

  async function handleConfirmar() {
    if (!propuesta) return
    setErrorJornada(null)

    let jornada: TramoRegistroMaquinariaInput | null = null
    if (mostrarJornada && incluirJornada) {
      const equipos =
        equiposCatalogo.length > 0
          ? equiposCatalogo
          : await cargarEquiposMaquinariaProyecto(supabase, propuesta.tramo.proyecto_id, {
              soloActivos: true,
            })
      const validacion = validarJornadaFormState(jornadaForm, equipos)
      if (validacion) {
        setErrorJornada(validacion)
        return
      }
      jornada = jornadaInputDesdeFormState(jornadaForm, equipos)
      if (!jornada) {
        setErrorJornada("Complete los datos de la jornada.")
        return
      }
    }

    await onConfirm({
      tramo: propuesta.tramo,
      punto: propuesta.punto,
      rol: propuesta.rol,
      orden: propuesta.orden,
      estado,
      registro_foto_id: registroFotoId,
      modo: esEditarMinitramo ? "editar_minitramo" : esCorreccion ? "corregir" : "nuevo",
      puntoId: esCorreccion ? puntoId : undefined,
      jornada,
      registroJornadaId,
      puntoAvanceIdJornada: esCorreccion ? puntoId : undefined,
      puntoEnlaceId: propuesta.puntoEnlaceId,
    })
  }

  const puntosConfirmados = puntosPrevios
    .filter((p) => p.tramo_id === propuestaInicial.tramo.id && p.confirmado && p.rol)
    .filter((p) => !(esCorreccion && p.id === puntoId))
    .map((p) => ({
      lat: p.lat,
      lng: p.lng,
      letra: p.rol!.toUpperCase(),
    }))

  return (
    <MapaOverlayPortal open>
      <div
        className={cn(
          "fixed inset-0 flex items-end justify-center bg-black/50 p-4 sm:items-center",
          Z_MAPA_DIALOG
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmar-punto-title"
      >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-foreground/10 bg-background p-5 shadow-xl">
        <h2 id="confirmar-punto-title" className="text-lg font-semibold">
          {esEditarMinitramo
            ? "Editar minitramo"
            : esCorreccion
              ? `Corregir punto ${propuestaInicial.letra}`
              : `Confirmar punto ${propuestaInicial.letra}`}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {esEditarMinitramo && etiquetaMinitramo ? (
            <>
              Minitramo {etiquetaMinitramo}. Revise la posición del punto{" "}
              {propuestaInicial.letra} sobre el trazado antes de guardar.
            </>
          ) : (
            "Revise la posición proyectada sobre el trazado del tramo antes de guardar."
          )}
        </p>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="confirmar-lat">Latitud</Label>
              <input
                id="confirmar-lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmar-lng">Longitud</Label>
              <input
                id="confirmar-lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {coordsValidas ? (
            <MiniMapaTramoPunto
              tramo={propuestaInicial.tramo}
              puntoEdicion={{
                lat: latNum,
                lng: lngNum,
                letra: propuestaInicial.letra,
                editable: true,
              }}
              puntosConfirmados={puntosConfirmados}
              puntosAvance={puntosPrevios.filter((p) => p.tramo_id === propuestaInicial.tramo.id)}
              onPointMove={(newLat, newLng) => {
                setLat(newLat.toFixed(7))
                setLng(newLng.toFixed(7))
              }}
            />
          ) : null}

          {propuesta ? (
            <div className="space-y-2 rounded-lg border border-foreground/10 bg-muted/20 p-3 text-sm">
              <p>{propuesta.mensaje}</p>
              <p>
                <span className="text-muted-foreground">Abscisa:</span>{" "}
                {propuesta.punto.abscisa_m.toFixed(1)} m
              </p>
              <p>
                <span className="text-muted-foreground">Distancia al tramo:</span>{" "}
                {propuesta.distancia_m.toFixed(1)} m
              </p>
              {propuesta.cierraMinitramo ? (
                <p className="text-xs text-muted-foreground">
                  Avance acumulado propuesto: {propuesta.avance_pct_propuesto.toFixed(1)}%
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-destructive">Coordenadas no válidas.</p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="confirmar-estado">Estado del tramo</Label>
            <Select value={estado} onValueChange={(v) => setEstado(v as typeof estado)}>
              <SelectTrigger id="confirmar-estado" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="bottom"
                className={cn(
                  Z_MAPA_SELECT_EN_DIALOG,
                  "max-h-[min(16rem,50dvh)] w-(--radix-select-trigger-width)"
                )}
              >
                {ESTADOS_TRAMO_MAPA.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {propuesta ? (
              <p className="text-xs text-muted-foreground">
                Sugerido: {etiquetaEstadoTramo(propuesta.estado_sugerido)}
              </p>
            ) : null}
          </div>

          {mostrarJornada ? (
            <div className="space-y-3 rounded-lg border border-foreground/10 bg-muted/10 p-3">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 size-4 rounded border-input"
                  checked={incluirJornada}
                  onChange={(e) => toggleIncluirJornada(e.target.checked)}
                  disabled={loading}
                />
                <span>
                  <span className="font-medium">Registrar jornada (opcional)</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {esEditarMinitramo
                      ? "Maquinaria desazolvada asociada a esta edición del minitramo."
                      : "Maquinaria desazolvada en esta confirmación de punto."}
                  </span>
                </span>
              </label>
              {incluirJornada ? (
                <RegistrarJornadaTramoFields
                  proyectoId={propuestaInicial.tramo.proyecto_id}
                  idPrefix="confirmar-jornada"
                  values={jornadaForm}
                  onChange={(patch) => setJornadaForm((prev) => ({ ...prev, ...patch }))}
                  disabled={loading}
                  selectContentZIndexClass={Z_MAPA_SELECT_EN_DIALOG}
                />
              ) : null}
              {errorJornada ? (
                <p className="text-sm text-destructive" role="alert">
                  {errorJornada}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirmar()}
            disabled={loading || !propuesta}
          >
            {loading
              ? "Guardando..."
              : esEditarMinitramo
                ? "Guardar cambios"
                : esCorreccion
                  ? `Confirmar corrección ${propuestaInicial.letra}`
                  : `Confirmar punto ${propuestaInicial.letra}`}
          </Button>
        </div>
      </div>
    </div>
    </MapaOverlayPortal>
  )
}
