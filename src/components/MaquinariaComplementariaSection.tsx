"use client"

import { FormEvent, useMemo, useState } from "react"
import { Pencil, Trash2, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegistrarMaquinariaComplementariaFields } from "@/src/components/maquinaria-complementaria/RegistrarMaquinariaComplementariaFields"
import {
  complementariaFormDesdeRegistro,
  complementariaInputDesdeFormState,
  estadoInicialComplementaria,
  validarComplementariaFormState,
  type RegistrarComplementariaFormState,
} from "@/src/components/maquinaria-complementaria/registrar-maquinaria-complementaria-utils"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { useEquiposMaquinariaProyecto } from "@/src/hooks/use-equipos-maquinaria-proyecto"
import { useMaquinariaComplementaria } from "@/src/hooks/use-maquinaria-complementaria"
import {
  actualizarRegistroMaquinariaComplementaria,
  crearRegistroMaquinariaComplementaria,
  eliminarRegistroMaquinariaComplementaria,
  kpisMaquinariaComplementaria,
} from "@/src/lib/maquinaria-complementaria"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import { createClient } from "@/src/lib/supabase/client"
import {
  formatearFechaRegistro,
  mapaEquiposPorId,
  nombreEquipoParaMostrar,
} from "@/src/lib/tramo-maquinaria-historial"

type MaquinariaComplementariaSectionProps = {
  isResident: boolean
  printHidden?: boolean
}

export function MaquinariaComplementariaSection({
  isResident,
  printHidden = true,
}: MaquinariaComplementariaSectionProps) {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const { registros, loading, error, recargar } = useMaquinariaComplementaria()
  const { equipos } = useEquiposMaquinariaProyecto()
  const equiposPorId = useMemo(() => mapaEquiposPorId(equipos), [equipos])

  const [form, setForm] = useState<RegistrarComplementariaFormState>(() => estadoInicialComplementaria())
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)

  const kpis = useMemo(() => kpisMaquinariaComplementaria(registros), [registros])

  function resetFormulario() {
    setForm(estadoInicialComplementaria())
    setEditandoId(null)
    setErrorForm(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isResident) return

    const validacion = validarComplementariaFormState(form, equipos)
    if (validacion) {
      setErrorForm(validacion)
      return
    }

    const input = complementariaInputDesdeFormState(form, equipos)
    if (!input) {
      setErrorForm("Revise los datos del formulario.")
      return
    }

    setGuardando(true)
    setErrorForm(null)
    try {
      if (editandoId) {
        await actualizarRegistroMaquinariaComplementaria(supabase, editandoId, input)
      } else {
        await crearRegistroMaquinariaComplementaria(supabase, proyectoId, input)
      }
      resetFormulario()
      await recargar()
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo guardar el registro.")
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(id: string) {
    if (!isResident) return
    if (!window.confirm("¿Eliminar este registro de trabajo complementario?")) return
    setEliminandoId(id)
    try {
      await eliminarRegistroMaquinariaComplementaria(supabase, id)
      if (editandoId === id) resetFormulario()
      await recargar()
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo eliminar.")
    } finally {
      setEliminandoId(null)
    }
  }

  function iniciarEdicion(id: string) {
    const registro = registros.find((r) => r.id === id)
    if (!registro) return
    setEditandoId(id)
    setForm(complementariaFormDesdeRegistro(registro, equipos))
    setErrorForm(null)
  }

  return (
    <section
      id="trabajos-complementarios"
      aria-labelledby="complementaria-title"
      className={printHidden ? "print:hidden scroll-mt-20" : "scroll-mt-20"}
    >
      <Card className="border-foreground/10">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80">
              <Wrench className="size-4 text-foreground/80" aria-hidden />
            </div>
            <div>
              <CardTitle id="complementaria-title" className="text-base sm:text-lg">
                Trabajos complementarios
              </CardTitle>
              <CardDescription className="mt-1 text-sm leading-relaxed">
                Jornadas de maquinaria fuera del contrato de desasolve (otros frentes o encargos). Se
                incluyen en el reporte consolidado impreso de esta página.
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
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="rounded-xl border border-foreground/10 bg-muted/20 p-4"
            >
              <p className="mb-3 text-sm font-medium">
                {editandoId ? "Editar registro" : "Nuevo registro"}
              </p>
              <RegistrarMaquinariaComplementariaFields
                proyectoId={proyectoId}
                idPrefix="maquinaria-complementaria"
                values={form}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                disabled={guardando}
              />
              {errorForm ? <p className="mt-2 text-sm text-destructive">{errorForm}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="submit" size="sm" disabled={guardando}>
                  {guardando ? "Guardando…" : editandoId ? "Actualizar" : "Registrar"}
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
              Solo el residente de obra puede registrar o editar trabajos complementarios. Usted puede
              consultar el historial y ver el impacto en el reporte impreso.
            </p>
          )}

          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando registros…</p>
          ) : registros.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay trabajos complementarios registrados.</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {registros.length} registro{registros.length === 1 ? "" : "s"}
                {kpis.totalHoras > 0 ? ` · ${formatearNumero(kpis.totalHoras, 1)} h en reporte` : ""}
              </p>
              <ul className="divide-y divide-foreground/10 rounded-xl border border-foreground/10">
                {registros.map((registro) => (
                  <li
                    key={registro.id}
                    className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 text-sm">
                      <p className="font-medium">{formatearFechaRegistro(registro.fecha)}</p>
                      <p className="mt-0.5 font-medium">
                        {nombreEquipoParaMostrar(registro, equiposPorId)}
                      </p>
                      <p className="text-foreground/90">{registro.descripcion_trabajo}</p>
                      {registro.ubicacion_referencia ? (
                        <p className="text-muted-foreground">
                          Ubicación: {registro.ubicacion_referencia}
                        </p>
                      ) : null}
                      {registro.duracion_horas != null ? (
                        <p className="font-mono tabular-nums text-muted-foreground">
                          {formatearNumero(registro.duracion_horas, 1)} h
                        </p>
                      ) : null}
                      {registro.observaciones ? (
                        <p className="mt-1 text-muted-foreground">{registro.observaciones}</p>
                      ) : null}
                    </div>
                    {isResident ? (
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => iniciarEdicion(registro.id)}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={eliminandoId === registro.id}
                          onClick={() => void handleEliminar(registro.id)}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                          {eliminandoId === registro.id ? "…" : "Eliminar"}
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
