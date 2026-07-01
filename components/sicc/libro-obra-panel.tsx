"use client"

import { useMemo, useState } from "react"
import { BookOpen, Plus, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EstadoModuloBadge } from "@/components/sicc/estado-modulo-badge"
import { useSiccAuth } from "@/components/sicc/sicc-auth-provider"
import { useSiccData } from "@/components/sicc/sicc-data-provider"
import { formatearFechaCorta } from "@/lib/sicc/format"
import { generarTextoLibroObra } from "@/lib/sicc/libro-obra"

export function LibroObraPanel() {
  const { puedeEditar } = useSiccAuth()
  const { obra, libroObra, agregarLibroObra: registrarLibroObra } = useSiccData()
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [clima, setClima] = useState("Soleado")
  const [temperatura, setTemperatura] = useState("")
  const [personal, setPersonal] = useState("20")
  const [actividades, setActividades] = useState("")
  const [materiales, setMateriales] = useState("")
  const [equipos, setEquipos] = useState("")
  const [incidencias, setIncidencias] = useState("")
  const [observaciones, setObservaciones] = useState("")

  const textoGenerado = useMemo(
    () => generarTextoLibroObra(obra, libroObra),
    [obra, libroObra]
  )

  function onSubmitEntrada(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!actividades.trim()) return

    void registrarLibroObra({
      fecha,
      clima,
      temperatura: temperatura || undefined,
      personal: Number(personal) || 0,
      actividades: actividades.trim(),
      materiales: materiales.trim() || undefined,
      equipos: equipos.trim() || undefined,
      incidencias: incidencias.trim() || undefined,
      observaciones: observaciones.trim() || undefined,
      residente: obra.residente,
    }).then(() => {
      setActividades("")
      setMateriales("")
      setEquipos("")
      setIncidencias("")
      setObservaciones("")
    })
  }

  function imprimirLibro() {
    const ventana = window.open("", "_blank", "noopener,noreferrer")
    if (!ventana) return

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Libro de obra — ${obra.nombre}</title>
          <style>
            body { font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.5; padding: 2rem; white-space: pre-wrap; }
          </style>
        </head>
        <body>${textoGenerado.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body>
      </html>
    `)
    ventana.document.close()
    ventana.focus()
    ventana.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2">
            <EstadoModuloBadge estado="activo" />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Libro de obra
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Registre el parte diario y genere automáticamente la bitácora formal de la
            obra.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={imprimirLibro}>
          <Printer className="size-4" />
          Imprimir libro
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle className="text-base">Nuevo parte diario</CardTitle>
            <CardDescription>
              {puedeEditar
                ? `Los datos ingresados alimentan el libro de obra de ${obra.nombre}.`
                : "Modo consulta: solo el residente registra partes diarios."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {puedeEditar ? (
            <form className="space-y-4" onSubmit={onSubmitEntrada}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personal">Personal en obra</Label>
                  <Input
                    id="personal"
                    type="number"
                    min={0}
                    value={personal}
                    onChange={(e) => setPersonal(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clima">Clima</Label>
                  <Input
                    id="clima"
                    value={clima}
                    onChange={(e) => setClima(e.target.value)}
                    placeholder="Soleado, nublado, lluvia…"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperatura">Temperatura (opcional)</Label>
                  <Input
                    id="temperatura"
                    value={temperatura}
                    onChange={(e) => setTemperatura(e.target.value)}
                    placeholder="28 °C"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="actividades">Actividades ejecutadas</Label>
                <Textarea
                  id="actividades"
                  value={actividades}
                  onChange={(e) => setActividades(e.target.value)}
                  placeholder="Describa las actividades del día por frente de trabajo…"
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="materiales">Materiales (opcional)</Label>
                  <Textarea
                    id="materiales"
                    value={materiales}
                    onChange={(e) => setMateriales(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipos">Equipos (opcional)</Label>
                  <Textarea
                    id="equipos"
                    value={equipos}
                    onChange={(e) => setEquipos(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incidencias">Incidencias (opcional)</Label>
                <Textarea
                  id="incidencias"
                  value={incidencias}
                  onChange={(e) => setIncidencias(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={2}
                />
              </div>

              <Button type="submit">
                <Plus className="size-4" />
                Agregar al libro de obra
              </Button>
            </form>
            ) : (
              <p className="rounded-lg border border-dashed border-foreground/20 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                Puede consultar e imprimir el libro de obra. El residente es quien registra
                los partes diarios en campo.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-foreground/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4" />
                Registros ({libroObra.length})
              </CardTitle>
              <CardDescription>Historial de partes diarios de la obra</CardDescription>
            </CardHeader>
            <CardContent className="max-h-56 space-y-2 overflow-auto">
              {[...libroObra]
                .sort((a, b) => b.fecha.localeCompare(a.fecha))
                .map((entrada, index) => (
                  <div
                    key={entrada.id}
                    className="rounded-lg border border-foreground/10 bg-muted/20 px-3 py-2"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatearFechaCorta(entrada.fecha)} · {entrada.clima} ·{" "}
                      {entrada.personal} pers.
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm">{entrada.actividades}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Registro #{libroObra.length - index}
                    </p>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card className="border-foreground/10">
            <CardHeader>
              <CardTitle className="text-base">Vista previa del libro</CardTitle>
              <CardDescription>
                Documento generado automáticamente a partir de los partes diarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[28rem] overflow-auto rounded-lg border border-foreground/10 bg-muted/30 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {textoGenerado}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
