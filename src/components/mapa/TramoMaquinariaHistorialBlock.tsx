"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  cargarRegistrosMaquinariaTramo,
  crearRegistroMaquinariaTramo,
  eliminarRegistroMaquinariaTramo,
  formatearFechaRegistro,
  formatearMetrosDesasolados,
  type TramoRegistroMaquinaria,
} from "@/src/lib/tramo-maquinaria-historial"
import {
  cargarEquiposMaquinariaProyecto,
  type ProyectoEquipoMaquinaria,
} from "@/src/lib/proyecto-equipos-maquinaria"
import { createClient } from "@/src/lib/supabase/client"

const EQUIPO_OTRO_VALUE = "__otro__"

type TramoMaquinariaHistorialBlockProps = {
  tramoId: string
  proyectoId: string
  isResident: boolean
  refreshKey?: number
}

export function TramoMaquinariaHistorialBlock({
  tramoId,
  proyectoId,
  isResident,
  refreshKey = 0,
}: TramoMaquinariaHistorialBlockProps) {
  const supabase = useMemo(() => createClient(), [])
  const [registros, setRegistros] = useState<TramoRegistroMaquinaria[]>([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formularioRegistroAbierto, setFormularioRegistroAbierto] = useState(false)
  const [equiposCatalogo, setEquiposCatalogo] = useState<ProyectoEquipoMaquinaria[]>([])
  const [cargandoEquipos, setCargandoEquipos] = useState(false)
  const [equipoSeleccionId, setEquipoSeleccionId] = useState("")
  const [equipoOtroTexto, setEquipoOtroTexto] = useState("")
  const [fecha, setFecha] = useState("")
  const [metros, setMetros] = useState("")
  const [horas, setHoras] = useState("")
  const [observaciones, setObservaciones] = useState("")

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await cargarRegistrosMaquinariaTramo(supabase, tramoId)
      setRegistros(data)
    } catch (err) {
      setRegistros([])
      setError(err instanceof Error ? err.message : "No se pudo cargar el historial.")
    } finally {
      setLoading(false)
    }
  }, [supabase, tramoId])

  useEffect(() => {
    void cargar()
  }, [cargar, refreshKey])

  useEffect(() => {
    setFormularioRegistroAbierto(false)
    setEquipoSeleccionId("")
    setEquipoOtroTexto("")
  }, [tramoId])

  useEffect(() => {
    if (!formularioRegistroAbierto || !isResident || !proyectoId) return

    let cancelado = false
    setCargandoEquipos(true)
    void cargarEquiposMaquinariaProyecto(supabase, proyectoId, { soloActivos: true })
      .then((data) => {
        if (!cancelado) setEquiposCatalogo(data)
      })
      .catch(() => {
        if (!cancelado) setEquiposCatalogo([])
      })
      .finally(() => {
        if (!cancelado) setCargandoEquipos(false)
      })

    return () => {
      cancelado = true
    }
  }, [formularioRegistroAbierto, isResident, proyectoId, supabase])

  function resetFormularioJornada() {
    setEquipoSeleccionId("")
    setEquipoOtroTexto("")
    setMetros("")
    setHoras("")
    setObservaciones("")
  }

  function resolverNombreEquipo(): string {
    if (equipoSeleccionId === EQUIPO_OTRO_VALUE) {
      return equipoOtroTexto.trim()
    }
    const encontrado = equiposCatalogo.find((e) => e.id === equipoSeleccionId)
    return encontrado?.nombre.trim() ?? ""
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isResident) return

    const equipoFinal = resolverNombreEquipo()
    const metrosNum = Number(metros.replace(",", "."))

    if (!fecha || !equipoSeleccionId || !equipoFinal || !Number.isFinite(metrosNum) || metrosNum < 0) {
      setError("Complete fecha, equipo y metros desasolados válidos.")
      return
    }

    const horasNum = horas.trim() ? Number(horas.replace(",", ".")) : null
    if (horasNum != null && (!Number.isFinite(horasNum) || horasNum < 0)) {
      setError("Las horas de trabajo no son válidas.")
      return
    }

    setGuardando(true)
    setError(null)
    try {
      await crearRegistroMaquinariaTramo(supabase, tramoId, {
        fecha,
        metros_desasolados: metrosNum,
        equipo: equipoFinal,
        duracion_horas: horasNum,
        observaciones: observaciones.trim() || null,
      })
      resetFormularioJornada()
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el registro.")
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(id: string) {
    if (!isResident) return
    if (!window.confirm("¿Eliminar este registro de maquinaria?")) return
    setEliminandoId(id)
    setError(null)
    try {
      await eliminarRegistroMaquinariaTramo(supabase, id)
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.")
    } finally {
      setEliminandoId(null)
    }
  }

  const totalMetros = registros.reduce((sum, r) => sum + r.metros_desasolados, 0)
  const mostrarEquipoOtro = equipoSeleccionId === EQUIPO_OTRO_VALUE

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Historial de maquinaria</h3>
        <p className="text-xs text-muted-foreground">
          Jornadas de desasolve registradas en este tramo
          {registros.length > 0 ? (
            <>
              {" "}
              · total registrado: {formatearMetrosDesasolados(totalMetros)}
            </>
          ) : null}
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-xs text-muted-foreground">Cargando historial…</p>
      ) : registros.length === 0 ? (
        <p className="rounded-lg border border-dashed border-foreground/15 bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground">
          {isResident
            ? "Aún no hay jornadas registradas. Agregue la primera abajo."
            : "Aún no hay jornadas de maquinaria registradas en este tramo."}
        </p>
      ) : (
        <ul className="space-y-2">
          {registros.map((registro) => (
            <li
              key={registro.id}
              className="rounded-lg border border-foreground/10 bg-background px-3 py-2.5 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{formatearFechaRegistro(registro.fecha)}</p>
                  <p className="mt-0.5 text-foreground">{registro.equipo}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold tabular-nums">
                    {formatearMetrosDesasolados(registro.metros_desasolados)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    desasolados
                  </p>
                </div>
              </div>
              {(registro.duracion_horas != null || registro.observaciones) && (
                <dl className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {registro.duracion_horas != null ? (
                    <div className="flex justify-between gap-2">
                      <dt>Horas de trabajo</dt>
                      <dd className="font-medium text-foreground">
                        {registro.duracion_horas.toFixed(1)} h
                      </dd>
                    </div>
                  ) : null}
                  {registro.observaciones ? (
                    <div>
                      <dt className="sr-only">Observaciones</dt>
                      <dd>{registro.observaciones}</dd>
                    </div>
                  ) : null}
                </dl>
              )}
              {isResident ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-8 px-2 text-destructive hover:text-destructive"
                  disabled={eliminandoId === registro.id}
                  onClick={() => void handleEliminar(registro.id)}
                >
                  <Trash2 className="mr-1 size-3.5" aria-hidden />
                  {eliminandoId === registro.id ? "Eliminando…" : "Eliminar"}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {isResident ? (
        <div className="rounded-xl border border-foreground/10 bg-muted/20 p-3">
          {!formularioRegistroAbierto ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setFormularioRegistroAbierto(true)}
            >
              Registrar jornada
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Registrar jornada</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground"
                  onClick={() => {
                    setFormularioRegistroAbierto(false)
                    resetFormularioJornada()
                  }}
                >
                  Cancelar
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="maq-fecha">Fecha</Label>
                  <Input
                    id="maq-fecha"
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maq-metros">Metros desasolados</Label>
                  <Input
                    id="maq-metros"
                    type="number"
                    min={0}
                    step={0.1}
                    required
                    placeholder="Ej. 120"
                    value={metros}
                    onChange={(e) => setMetros(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maq-equipo">Equipo / maquinaria</Label>
                <Select
                  value={equipoSeleccionId || undefined}
                  onValueChange={(value) => {
                    setEquipoSeleccionId(value)
                    if (value !== EQUIPO_OTRO_VALUE) setEquipoOtroTexto("")
                  }}
                  disabled={cargandoEquipos}
                >
                  <SelectTrigger id="maq-equipo" className="h-10 w-full">
                    <SelectValue
                      placeholder={
                        cargandoEquipos ? "Cargando equipos…" : "Seleccione un equipo"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {equiposCatalogo.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nombre}
                      </SelectItem>
                    ))}
                    <SelectItem value={EQUIPO_OTRO_VALUE}>Otro…</SelectItem>
                  </SelectContent>
                </Select>
                {equiposCatalogo.length === 0 && !cargandoEquipos ? (
                  <p className="text-xs text-muted-foreground">
                    No hay equipos en el catálogo.{" "}
                    <Link href="/maquinaria" className="font-medium text-primary underline-offset-4 hover:underline">
                      Regístrelos en Maquinaria
                    </Link>
                    .
                  </p>
                ) : null}
                {mostrarEquipoOtro ? (
                  <Input
                    id="maq-equipo-otro"
                    required
                    placeholder="Nombre del equipo"
                    value={equipoOtroTexto}
                    onChange={(e) => setEquipoOtroTexto(e.target.value)}
                    className="mt-2"
                    aria-label="Otro equipo"
                  />
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maq-horas">Horas de trabajo (opcional)</Label>
                <Input
                  id="maq-horas"
                  type="number"
                  min={0}
                  step={0.5}
                  value={horas}
                  onChange={(e) => setHoras(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maq-obs">Observaciones (opcional)</Label>
                <Textarea
                  id="maq-obs"
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={guardando || cargandoEquipos} className="w-full">
                {guardando ? "Guardando…" : "Agregar al historial"}
              </Button>
            </form>
          )}
        </div>
      ) : null}
    </section>
  )
}
