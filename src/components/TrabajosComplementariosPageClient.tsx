"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Truck, Wrench } from "lucide-react"
import { FormEvent, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { KpiCard } from "@/src/components/KpiCard"
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
import { useEsViewportMovil } from "@/src/hooks/useEsViewportMovil"
import { useMaquinariaComplementaria } from "@/src/hooks/use-maquinaria-complementaria"
import {
  agruparRegistrosComplementariosPorFecha,
  actualizarRegistroMaquinariaComplementaria,
  crearRegistroMaquinariaComplementaria,
  eliminarRegistroMaquinariaComplementaria,
  kpisMaquinariaComplementaria,
} from "@/src/lib/maquinaria-complementaria"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import { createClient } from "@/src/lib/supabase/client"
import {
  formatearFechaRegistro,
  mapaEquiposPorId,
  nombreEquipoParaMostrar,
} from "@/src/lib/tramo-maquinaria-historial"

export function TrabajosComplementariosPageClient() {
  const router = useRouter()
  const { proyectoActivo, proyectoId } = useProyecto()
  const esViewportMovil = useEsViewportMovil()
  const supabase = useMemo(() => createClient(), [])
  const residentEmail = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()

  const [authListo, setAuthListo] = useState(false)
  const [isResident, setIsResident] = useState(false)
  const [form, setForm] = useState<RegistrarComplementariaFormState>(() => estadoInicialComplementaria())
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)

  const { registros, periodo, loading, error, recargar } = useMaquinariaComplementaria()
  const { equipos } = useEquiposMaquinariaProyecto()
  const equiposPorId = useMemo(() => mapaEquiposPorId(equipos), [equipos])

  const loginNext = rutaObra(proyectoId, "trabajos-complementarios")
  const loginHref = `/login?next=${encodeURIComponent(loginNext)}`

  useEffect(() => {
    async function checkResident() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const ok = Boolean(user?.email && user.email.toLowerCase() === residentEmail)
      setIsResident(ok)
      setAuthListo(true)
      if (!ok) {
        router.replace(loginHref)
      }
    }
    void checkResident()
  }, [supabase, residentEmail, router, loginHref])

  const kpis = useMemo(() => kpisMaquinariaComplementaria(registros), [registros])
  const porFecha = useMemo(() => agruparRegistrosComplementariosPorFecha(registros), [registros])

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

  function handleEditar(registroId: string) {
    const registro = registros.find((r) => r.id === registroId)
    if (!registro) return
    setEditandoId(registroId)
    setForm(complementariaFormDesdeRegistro(registro, equipos))
    setErrorForm(null)
  }

  async function handleEliminar(registroId: string) {
    if (!isResident) return
    if (!window.confirm("¿Eliminar este registro de trabajo complementario?")) return
    setEliminandoId(registroId)
    try {
      await eliminarRegistroMaquinariaComplementaria(supabase, registroId)
      if (editandoId === registroId) resetFormulario()
      await recargar()
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo eliminar el registro.")
    } finally {
      setEliminandoId(null)
    }
  }

  if (!authListo || !isResident) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Verificando acceso…
      </div>
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
              <Wrench className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Trabajos complementarios
              </h1>
              <p className="text-sm text-muted-foreground">
                {proyectoActivo.nombreObra} — Maquinaria fuera del contrato de desasolve —{" "}
                {periodo.etiqueta}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <Card className="border-foreground/10 bg-card shadow-sm ring-1 ring-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Uso de esta ruta</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Registre aquí jornadas de equipos que no corresponden al avance contractual del mapa.
              No aparecen en{" "}
              <Link href={rutaObra(proyectoId, "maquinaria")} className="font-medium text-primary underline-offset-4 hover:underline">
                Maquinaria y transporte
              </Link>{" "}
              ni en los KPIs del mapa. Solo el residente autenticado puede ver y editar estos datos.
            </CardDescription>
          </CardHeader>
        </Card>

        <section aria-labelledby="form-complementaria-title">
          <h2 id="form-complementaria-title" className="mb-3 text-base font-semibold tracking-tight">
            {editandoId ? "Editar registro" : "Nuevo registro"}
          </h2>
          <Card className="border-foreground/10">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <RegistrarMaquinariaComplementariaFields
                  proyectoId={proyectoId}
                  idPrefix="complementaria"
                  values={form}
                  onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                  disabled={guardando}
                />
                {errorForm ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errorForm}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={guardando}>
                    {guardando ? "Guardando…" : editandoId ? "Actualizar" : "Registrar"}
                  </Button>
                  {editandoId ? (
                    <Button type="button" variant="outline" disabled={guardando} onClick={resetFormulario}>
                      Cancelar edición
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="kpis-complementaria-title">
          <h2 id="kpis-complementaria-title" className="mb-3 text-base font-semibold tracking-tight">
            Resumen
          </h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando registros…</p>
          ) : error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <KpiCard
                label="Registros"
                valor={String(kpis.totalRegistros)}
                detalle="Jornadas complementarias guardadas"
                compact={esViewportMovil}
              />
              <KpiCard
                label="Horas registradas"
                valor={formatearNumero(kpis.totalHoras, 1)}
                detalle="Suma cuando se indicó duración"
                compact={esViewportMovil}
              />
              <KpiCard
                label="Equipos distintos"
                valor={String(kpis.equiposDistintos)}
                detalle="Catálogo u otros nombres"
                compact={esViewportMovil}
              />
            </div>
          )}
        </section>

        {!loading && porFecha.length > 0 ? (
          <section aria-labelledby="lista-complementaria-title">
            <h2 id="lista-complementaria-title" className="mb-3 text-base font-semibold tracking-tight">
              Historial por fecha
            </h2>
            <Accordion type="multiple" className="space-y-2" defaultValue={[porFecha[0]?.fecha ?? ""]}>
              {porFecha.map(({ fecha, registros: delDia }) => (
                <AccordionItem
                  key={fecha}
                  value={fecha}
                  className="overflow-hidden rounded-xl border border-foreground/10 bg-card px-3 shadow-sm ring-1 ring-foreground/5"
                >
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Truck className="size-4 text-muted-foreground" aria-hidden />
                      {formatearFechaRegistro(fecha)}
                      <span className="text-muted-foreground">({delDia.length})</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <ul className="space-y-3">
                      {delDia.map((registro) => (
                        <li
                          key={registro.id}
                          className="rounded-lg border border-foreground/10 bg-muted/30 p-3 text-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="font-medium">
                                {nombreEquipoParaMostrar(registro, equiposPorId)}
                              </p>
                              <p className="text-foreground/90">{registro.descripcion_trabajo}</p>
                              {registro.ubicacion_referencia ? (
                                <p className="text-xs text-muted-foreground">
                                  Ubicación: {registro.ubicacion_referencia}
                                </p>
                              ) : null}
                              {registro.duracion_horas != null ? (
                                <p className="text-xs text-muted-foreground">
                                  Horas: {formatearNumero(registro.duracion_horas, 1)}
                                </p>
                              ) : null}
                              {registro.observaciones ? (
                                <p className="text-xs text-muted-foreground">{registro.observaciones}</p>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-8"
                                aria-label="Editar registro"
                                onClick={() => handleEditar(registro.id)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-8 text-destructive hover:text-destructive"
                                aria-label="Eliminar registro"
                                disabled={eliminandoId === registro.id}
                                onClick={() => void handleEliminar(registro.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}

        {!loading && registros.length === 0 && !error ? (
          <p className="text-sm text-muted-foreground">Aún no hay trabajos complementarios registrados.</p>
        ) : null}
      </main>
    </div>
  )
}
