"use client"

import { useCallback, useEffect, useState } from "react"
import { Shield, UserCog } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EstadoModuloBadge } from "@/components/sicc/estado-modulo-badge"
import { useSiccAuth } from "@/components/sicc/sicc-auth-provider"
import { useSiccData } from "@/components/sicc/sicc-data-provider"
import {
  actualizarNombrePerfil,
  actualizarRolPerfil,
  listarPerfilesObra,
} from "@/lib/supabase/admin"
import { etiquetaRol } from "@/lib/supabase/auth"
import { obtenerClienteSupabase } from "@/lib/supabase/client"
import { ROLES_ASIGNABLES, type PerfilSicc, type RolSicc } from "@/lib/sicc/types"
import { cn } from "@/lib/utils"

type PerfilConFecha = PerfilSicc & { creadoEn: string }

const ROL_ESTILOS: Record<RolSicc, string> = {
  residente: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  visitante: "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300",
  fiscalizador: "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-300",
  administrador: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
}

export function AdminPanel() {
  const { perfil: perfilActual, requiereAuth } = useSiccAuth()
  const { obra } = useSiccData()
  const [perfiles, setPerfiles] = useState<PerfilConFecha[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guardandoId, setGuardandoId] = useState<string | null>(null)
  const [ediciones, setEdiciones] = useState<
    Record<string, { nombre: string; rol: RolSicc }>
  >({})

  const cargarPerfiles = useCallback(async () => {
    const supabase = obtenerClienteSupabase()
    if (!supabase) return

    setCargando(true)
    setError(null)
    try {
      const lista = await listarPerfilesObra(supabase, obra.id)
      setPerfiles(lista)
      const mapa: Record<string, { nombre: string; rol: RolSicc }> = {}
      for (const p of lista) {
        mapa[p.id] = { nombre: p.nombre, rol: p.rol }
      }
      setEdiciones(mapa)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios")
    } finally {
      setCargando(false)
    }
  }, [obra.id])

  useEffect(() => {
    if (requiereAuth) void cargarPerfiles()
  }, [requiereAuth, cargarPerfiles])

  async function guardarPerfil(perfilId: string) {
    const supabase = obtenerClienteSupabase()
    const edicion = ediciones[perfilId]
    if (!supabase || !edicion) return

    const original = perfiles.find((p) => p.id === perfilId)
    if (!original) return

    setGuardandoId(perfilId)
    setError(null)

    try {
      if (edicion.nombre.trim() !== original.nombre) {
        await actualizarNombrePerfil(supabase, perfilId, edicion.nombre.trim())
      }
      if (edicion.rol !== original.rol) {
        if (perfilId === perfilActual?.id && edicion.rol !== "administrador") {
          throw new Error("No puede quitarse el rol de administrador a usted mismo")
        }
        await actualizarRolPerfil(supabase, perfilId, edicion.rol)
      }
      await cargarPerfiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cambios")
    } finally {
      setGuardandoId(null)
    }
  }

  function contarPorRol(rol: RolSicc): number {
    return perfiles.filter((p) => p.rol === rol).length
  }

  if (!requiereAuth) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          La administración de usuarios requiere Supabase y autenticación en la nube.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2">
          <EstadoModuloBadge estado="activo" />
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Administración de usuarios
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Asigne roles a residentes, visitantes y fiscalizadores de la obra. Solo los
          administradores pueden acceder a este panel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES_ASIGNABLES.map((rol) => (
          <Card key={rol} className="border-foreground/10">
            <CardContent className="pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {etiquetaRol(rol)}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {contarPorRol(rol)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCog className="size-4" />
            Usuarios de {obra.nombre}
          </CardTitle>
          <CardDescription>
            Cambios de rol aplican en el próximo inicio de sesión o de inmediato en la
            sesión activa al recargar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <p className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
              {error}
            </p>
          ) : null}
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="pl-4">Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead className="w-48">Rol</TableHead>
                  <TableHead className="w-28 pr-4 text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargando ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      Cargando usuarios…
                    </TableCell>
                  </TableRow>
                ) : perfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No hay usuarios registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  perfiles.map((p) => {
                    const edicion = ediciones[p.id]
                    const sinCambios =
                      edicion?.nombre === p.nombre && edicion?.rol === p.rol
                    const esYo = p.id === perfilActual?.id

                    return (
                      <TableRow key={p.id} className="border-foreground/10">
                        <TableCell className="pl-4">
                          <Input
                            value={edicion?.nombre ?? p.nombre}
                            onChange={(e) =>
                              setEdiciones((prev) => ({
                                ...prev,
                                [p.id]: {
                                  nombre: e.target.value,
                                  rol: prev[p.id]?.rol ?? p.rol,
                                },
                              }))
                            }
                            className="h-8 max-w-[14rem]"
                          />
                          {esYo ? (
                            <span className="mt-1 block text-xs text-muted-foreground">
                              Su cuenta
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {p.email}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={edicion?.rol ?? p.rol}
                            onValueChange={(v) =>
                              setEdiciones((prev) => ({
                                ...prev,
                                [p.id]: {
                                  nombre: prev[p.id]?.nombre ?? p.nombre,
                                  rol: v as RolSicc,
                                },
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES_ASIGNABLES.map((rol) => (
                                <SelectItem key={rol} value={rol}>
                                  {etiquetaRol(rol)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Badge
                            variant="outline"
                            className={cn(
                              "mt-1.5 font-normal",
                              ROL_ESTILOS[p.rol]
                            )}
                          >
                            Actual: {etiquetaRol(p.rol)}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <Button
                            type="button"
                            size="sm"
                            disabled={sinCambios || guardandoId === p.id}
                            onClick={() => void guardarPerfil(p.id)}
                          >
                            {guardandoId === p.id ? "Guardando…" : "Guardar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-foreground/10 bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4" />
            Primer administrador
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Si aún no hay administrador, ejecute en Supabase SQL Editor después de
            registrarse:
          </p>
          <pre className="mt-3 overflow-auto rounded-lg border border-foreground/10 bg-background p-3 font-mono text-xs">
            {`update public.sicc_perfiles\nset rol = 'administrador'\nwhere email = 'su-correo@empresa.com';`}
          </pre>
          <p className="mt-3">
            Luego cierre sesión y vuelva a entrar para acceder a este panel.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
