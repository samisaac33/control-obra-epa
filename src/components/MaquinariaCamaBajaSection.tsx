"use client"

import { FormEvent, useMemo, useState } from "react"
import { Pencil, Trash2, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegistrarMovimientoCamaBajaFields } from "@/src/components/maquinaria-cama-baja/RegistrarMovimientoCamaBajaFields"
import {
  camaBajaFormDesdeMovimiento,
  camaBajaInputDesdeFormState,
  estadoInicialCamaBaja,
  validarCamaBajaFormState,
  type RegistrarCamaBajaFormState,
} from "@/src/components/maquinaria-cama-baja/registrar-cama-baja-utils"
import { useEquiposMaquinariaProyecto } from "@/src/hooks/use-equipos-maquinaria-proyecto"
import { useMovimientosCamaBaja } from "@/src/hooks/use-movimientos-cama-baja"
import {
  actualizarMovimientoCamaBaja,
  crearMovimientoCamaBaja,
  eliminarMovimientoCamaBaja,
  totalHorasMovimientosCamaBaja,
} from "@/src/lib/maquinaria-cama-baja-movimientos"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import { createClient } from "@/src/lib/supabase/client"
import { formatearFechaRegistro } from "@/src/lib/tramo-maquinaria-historial"
import { useProyecto } from "@/src/contexts/ProyectoContext"

type MaquinariaCamaBajaSectionProps = {
  isResident: boolean
  printHidden?: boolean
}

export function MaquinariaCamaBajaSection({ isResident, printHidden = true }: MaquinariaCamaBajaSectionProps) {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const { movimientos, loading, error, recargar } = useMovimientosCamaBaja()
  const { equipos } = useEquiposMaquinariaProyecto()

  const [form, setForm] = useState<RegistrarCamaBajaFormState>(() => estadoInicialCamaBaja())
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)

  const totalHoras = totalHorasMovimientosCamaBaja(movimientos)

  function resetFormulario() {
    setForm(estadoInicialCamaBaja())
    setEditandoId(null)
    setErrorForm(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isResident) return

    const validacion = validarCamaBajaFormState(form, equipos)
    if (validacion) {
      setErrorForm(validacion)
      return
    }

    const input = camaBajaInputDesdeFormState(form, equipos)
    if (!input) return

    setGuardando(true)
    setErrorForm(null)
    try {
      if (editandoId) {
        await actualizarMovimientoCamaBaja(supabase, editandoId, input)
      } else {
        await crearMovimientoCamaBaja(supabase, proyectoId, input)
      }
      resetFormulario()
      await recargar()
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo guardar el movimiento.")
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(id: string) {
    if (!isResident) return
    if (!window.confirm("¿Eliminar este movimiento de cama baja?")) return
    setEliminandoId(id)
    try {
      await eliminarMovimientoCamaBaja(supabase, id)
      if (editandoId === id) resetFormulario()
      await recargar()
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo eliminar.")
    } finally {
      setEliminandoId(null)
    }
  }

  function iniciarEdicion(id: string) {
    const mov = movimientos.find((m) => m.id === id)
    if (!mov) return
    setEditandoId(id)
    setForm(camaBajaFormDesdeMovimiento(mov, equipos))
    setErrorForm(null)
  }

  return (
    <section
      aria-labelledby="cama-baja-title"
      className={printHidden ? "print:hidden" : undefined}
    >
      <Card className="border-foreground/10">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80">
              <Truck className="size-4 text-foreground/80" aria-hidden />
            </div>
            <div>
              <CardTitle id="cama-baja-title" className="text-base sm:text-lg">
                Movimientos con cama baja
              </CardTitle>
              <CardDescription className="mt-1 text-sm leading-relaxed">
                Registre traslados de excavadoras u otros equipos entre frentes. Las horas indicadas
                se suman al reporte consolidado de maquinaria (filas «Cama baja — …»).
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

          {isResident ? (
            <form onSubmit={(e) => void handleSubmit(e)} className="rounded-xl border border-foreground/10 bg-muted/20 p-4">
              <p className="mb-3 text-sm font-medium">
                {editandoId ? "Editar movimiento" : "Nuevo movimiento"}
              </p>
              <RegistrarMovimientoCamaBajaFields
                idPrefix="cama-baja"
                values={form}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                disabled={guardando}
              />
              {errorForm ? (
                <p className="mt-2 text-sm text-destructive">{errorForm}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="submit" size="sm" disabled={guardando}>
                  {guardando ? "Guardando…" : editandoId ? "Actualizar" : "Registrar movimiento"}
                </Button>
                {editandoId ? (
                  <Button type="button" variant="outline" size="sm" onClick={resetFormulario}>
                    Cancelar edición
                  </Button>
                ) : null}
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Solo el residente de obra puede registrar o editar movimientos. Usted puede consultar el
              historial y ver el impacto en el reporte impreso.
            </p>
          )}

          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando movimientos…</p>
          ) : movimientos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay movimientos registrados.</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {movimientos.length} movimiento{movimientos.length === 1 ? "" : "s"}
                {totalHoras > 0 ? ` · ${formatearNumero(totalHoras, 1)} h en reporte` : ""}
              </p>
              <ul className="divide-y divide-foreground/10 rounded-xl border border-foreground/10">
                {movimientos.map((m) => (
                  <li key={m.id} className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 text-sm">
                      <p className="font-medium">{formatearFechaRegistro(m.fecha)}</p>
                      <p className="mt-0.5">
                        <span className="text-muted-foreground">Cama baja:</span> {m.cama_baja}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Máquina:</span> {m.maquina_transportada}
                      </p>
                      {m.origen || m.destino ? (
                        <p className="text-muted-foreground">
                          {m.origen ? `Desde ${m.origen}` : ""}
                          {m.origen && m.destino ? " → " : ""}
                          {m.destino ? `Hasta ${m.destino}` : ""}
                        </p>
                      ) : null}
                      {m.duracion_horas != null ? (
                        <p className="font-mono tabular-nums text-muted-foreground">
                          {formatearNumero(m.duracion_horas, 1)} h
                        </p>
                      ) : null}
                      {m.observaciones ? (
                        <p className="mt-1 text-muted-foreground">{m.observaciones}</p>
                      ) : null}
                    </div>
                    {isResident ? (
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => iniciarEdicion(m.id)}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={eliminandoId === m.id}
                          onClick={() => void handleEliminar(m.id)}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                          {eliminandoId === m.id ? "…" : "Eliminar"}
                        </Button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
