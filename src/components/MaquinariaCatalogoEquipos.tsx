"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEquiposMaquinariaProyecto } from "@/src/hooks/use-equipos-maquinaria-proyecto"
import { createClient } from "@/src/lib/supabase/client"
import { cn } from "@/lib/utils"

export function MaquinariaCatalogoEquipos() {
  const supabase = useMemo(() => createClient(), [])
  const residentEmail = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()
  const [isResident, setIsResident] = useState(false)
  const [nombreNuevo, setNombreNuevo] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nombreEdit, setNombreEdit] = useState("")

  const { equipos, loading, error, setError, agregarEquipo, cambiarActivo, renombrarEquipo } =
    useEquiposMaquinariaProyecto()

  useEffect(() => {
    async function checkResident() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsResident(Boolean(user?.email && user.email.toLowerCase() === residentEmail))
    }
    void checkResident()
  }, [supabase, residentEmail])

  const activos = equipos.filter((e) => e.activo)
  const inactivos = equipos.filter((e) => !e.activo)

  async function handleAgregar(event: FormEvent) {
    event.preventDefault()
    if (!isResident) return
    setGuardando(true)
    setError(null)
    try {
      await agregarEquipo(nombreNuevo)
      setNombreNuevo("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar el equipo.")
    } finally {
      setGuardando(false)
    }
  }

  async function handleGuardarNombre(equipoId: string) {
    if (!isResident) return
    setGuardando(true)
    setError(null)
    try {
      await renombrarEquipo(equipoId, nombreEdit)
      setEditandoId(null)
      setNombreEdit("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el nombre.")
    } finally {
      setGuardando(false)
    }
  }

  async function handleToggleActivo(equipoId: string, activo: boolean) {
    if (!isResident) return
    setGuardando(true)
    setError(null)
    try {
      await cambiarActivo(equipoId, activo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el equipo.")
    } finally {
      setGuardando(false)
    }
  }

  function renderFila(equipo: (typeof equipos)[number]) {
    const editando = editandoId === equipo.id
    return (
      <li
        key={equipo.id}
        className={cn(
          "flex flex-col gap-2 rounded-lg border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between",
          equipo.activo ? "border-foreground/10 bg-background" : "border-dashed border-foreground/15 bg-muted/20"
        )}
      >
        <div className="min-w-0 flex-1">
          {editando ? (
            <Input
              value={nombreEdit}
              onChange={(e) => setNombreEdit(e.target.value)}
              className="h-9"
              aria-label="Nuevo nombre del equipo"
            />
          ) : (
            <>
              <p className={cn("font-medium", !equipo.activo && "text-muted-foreground line-through")}>
                {equipo.nombre}
              </p>
              {!equipo.activo ? (
                <p className="text-xs text-muted-foreground">Inactivo — no aparece en el mapa</p>
              ) : null}
            </>
          )}
        </div>
        {isResident ? (
          <div className="flex flex-wrap gap-2">
            {editando ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  disabled={guardando}
                  onClick={() => void handleGuardarNombre(equipo.id)}
                >
                  Guardar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditandoId(null)
                    setNombreEdit("")
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={guardando}
                  onClick={() => {
                    setEditandoId(equipo.id)
                    setNombreEdit(equipo.nombre)
                  }}
                >
                  Renombrar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={equipo.activo ? "secondary" : "default"}
                  disabled={guardando}
                  onClick={() => void handleToggleActivo(equipo.id, !equipo.activo)}
                >
                  {equipo.activo ? "Desactivar" : "Reactivar"}
                </Button>
              </>
            )}
          </div>
        ) : null}
      </li>
    )
  }

  return (
    <section aria-labelledby="catalogo-equipos-title">
      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle id="catalogo-equipos-title" className="text-base sm:text-lg">
            Equipos registrados
          </CardTitle>
          <CardDescription>
            Catálogo usado al registrar jornadas en el{" "}
            <Link href="/mapa" className="font-medium text-primary underline-offset-4 hover:underline">
              mapa de tramos
            </Link>
            . {isResident ? "Agregue o desactive equipos aquí." : "Solo lectura."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando equipos…</p>
          ) : equipos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-foreground/15 bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground">
              {isResident
                ? "Aún no hay equipos. Agregue el primero para usarlo al registrar jornadas en el mapa."
                : "No hay equipos registrados en este proyecto."}
            </p>
          ) : (
            <div className="space-y-4">
              {activos.length > 0 ? (
                <ul className="space-y-2">{activos.map(renderFila)}</ul>
              ) : (
                <p className="text-sm text-muted-foreground">No hay equipos activos.</p>
              )}
              {inactivos.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Inactivos
                  </p>
                  <ul className="space-y-2">{inactivos.map(renderFila)}</ul>
                </div>
              ) : null}
            </div>
          )}

          {isResident ? (
            <form onSubmit={handleAgregar} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor="equipo-nuevo">Agregar equipo</Label>
                <Input
                  id="equipo-nuevo"
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  placeholder="Ej. Excavadora brazo largo"
                  required
                />
              </div>
              <Button type="submit" disabled={guardando || !nombreNuevo.trim()}>
                {guardando ? "Guardando…" : "Agregar"}
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
