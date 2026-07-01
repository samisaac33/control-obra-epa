"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Plus, Ruler, Search } from "lucide-react"

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
import { Label } from "@/components/ui/label"
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
import { Textarea } from "@/components/ui/textarea"
import { EstadoModuloBadge } from "@/components/sicc/estado-modulo-badge"
import { KpiCard } from "@/components/sicc/kpi-card"
import { useSiccData } from "@/components/sicc/sicc-data-provider"
import { presupuestoData } from "@/data/presupuesto"
import { formatearCantidad, formatearFechaCorta, formatearUsd } from "@/lib/sicc/format"
import {
  calcularAvanceFisicoGlobal,
  rubrosConAvance,
  rubrosSobreEjecucion,
} from "@/lib/sicc/metrados"
import type { EstadoAvanceRubro } from "@/lib/sicc/types"
import { cn } from "@/lib/utils"

const FRENTES = [
  "Cárcamo EB Severino",
  "Compuerta Peniche",
  "Compuerta Ciénega",
  "Acceso Poza Honda",
  "Canal Inabronco",
  "Terrazamiento",
] as const

const ESTADO_ETIQUETAS: Record<EstadoAvanceRubro, string> = {
  sin_inicio: "Sin inicio",
  en_ejecucion: "En ejecución",
  completado: "Completado",
  sobre_ejecucion: "Sobre ejecución",
}

const ESTADO_ESTILOS: Record<EstadoAvanceRubro, string> = {
  sin_inicio: "border-foreground/15 bg-muted/50 text-muted-foreground",
  en_ejecucion: "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300",
  completado: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  sobre_ejecucion: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
}

function BarraAvance({ porcentaje, estado }: { porcentaje: number; estado: EstadoAvanceRubro }) {
  const ancho = Math.min(porcentaje, 100)
  return (
    <div className="flex min-w-[5rem] items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            estado === "sobre_ejecucion" && "bg-amber-500",
            estado === "completado" && "bg-emerald-500",
            estado === "en_ejecucion" && "bg-sky-500",
            estado === "sin_inicio" && "bg-muted-foreground/30"
          )}
          style={{ width: `${ancho}%` }}
        />
      </div>
      <span className="w-12 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {porcentaje.toFixed(1)}%
      </span>
    </div>
  )
}

export function MetradosPanel() {
  const { obra, metrados, agregarMetrado: registrarMetrado, resumenesMetrados } =
    useSiccData()
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<EstadoAvanceRubro | "todos">("todos")
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [rubroId, setRubroId] = useState<string>("")
  const [cantidad, setCantidad] = useState("")
  const [frente, setFrente] = useState<string>(FRENTES[0])
  const [observaciones, setObservaciones] = useState("")

  const resumenes = resumenesMetrados

  const avanceGlobal = useMemo(() => calcularAvanceFisicoGlobal(resumenes), [resumenes])

  const resumenesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    return resumenes.filter((r) => {
      const coincideBusqueda =
        !termino ||
        r.detalle.toLowerCase().includes(termino) ||
        r.categoria.toLowerCase().includes(termino) ||
        String(r.rubroId).includes(termino)
      const coincideEstado = filtroEstado === "todos" || r.estado === filtroEstado
      return coincideBusqueda && coincideEstado
    })
  }, [resumenes, busqueda, filtroEstado])

  const entradasRecientes = useMemo(
    () => [...metrados].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 6),
    [metrados]
  )

  const rubroSeleccionado = presupuestoData.find((r) => String(r.id) === rubroId)

  function onSubmitMetrado(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!rubroId || !cantidad) return

    const cantidadNum = Number(cantidad)
    if (cantidadNum <= 0) return

    registrarMetrado({
      rubroId: Number(rubroId),
      fecha,
      cantidad: cantidadNum,
      frente,
      observaciones: observaciones.trim() || undefined,
      registradoPor: obra.residente,
    })
    setCantidad("")
    setObservaciones("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2">
            <EstadoModuloBadge estado="activo" />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Metrados y avance
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Registre cantidades ejecutadas en campo vinculadas a los rubros del contrato y
            consulte el avance acumulado por partida.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          kpi={{
            etiqueta: "Avance físico global",
            valor: `${avanceGlobal.toFixed(1)}%`,
            detalle: "Ponderado por valor contractual",
            tendencia: "positiva",
          }}
        />
        <KpiCard
          kpi={{
            etiqueta: "Rubros con avance",
            valor: `${rubrosConAvance(resumenes)} / ${resumenes.length}`,
            detalle: "Partidas con metrado registrado",
            tendencia: "neutral",
          }}
        />
        <KpiCard
          kpi={{
            etiqueta: "Registros de metrado",
            valor: String(metrados.length),
            detalle: "Entradas diarias en el periodo",
            tendencia: "positiva",
          }}
        />
        <KpiCard
          kpi={{
            etiqueta: "Alertas",
            valor: String(rubrosSobreEjecucion(resumenes)),
            detalle: "Rubros en sobre ejecución",
            tendencia: rubrosSobreEjecucion(resumenes) > 0 ? "negativa" : "positiva",
          }}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="border-foreground/10 xl:sticky xl:top-4 xl:self-start">
          <CardHeader>
            <CardTitle className="text-base">Nuevo metrado</CardTitle>
            <CardDescription>
              Cantidad ejecutada del día por rubro y frente de trabajo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmitMetrado}>
              <div className="space-y-2">
                <Label htmlFor="met-fecha">Fecha</Label>
                <Input
                  id="met-fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="met-rubro">Rubro</Label>
                <Select value={rubroId} onValueChange={setRubroId} required>
                  <SelectTrigger id="met-rubro" className="w-full">
                    <SelectValue placeholder="Seleccione un rubro…" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {presupuestoData.map((rubro) => (
                      <SelectItem key={rubro.id} value={String(rubro.id)}>
                        <span className="font-mono text-xs">#{rubro.id}</span>
                        <span className="ml-2 truncate">{rubro.detalle}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {rubroSeleccionado ? (
                  <p className="text-xs text-muted-foreground">
                    Contratado: {formatearCantidad(rubroSeleccionado.cantidad)}{" "}
                    {rubroSeleccionado.unidad} ·{" "}
                    {formatearUsd(rubroSeleccionado.precioUnitario)} / {rubroSeleccionado.unidad}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="met-cantidad">Cantidad ejecutada</Label>
                <Input
                  id="met-cantidad"
                  type="number"
                  min={0}
                  step="any"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder={rubroSeleccionado ? rubroSeleccionado.unidad : "0"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="met-frente">Frente de trabajo</Label>
                <Select value={frente} onValueChange={setFrente}>
                  <SelectTrigger id="met-frente" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FRENTES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="met-obs">Observaciones (opcional)</Label>
                <Textarea
                  id="met-obs"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={2}
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="size-4" />
                Registrar metrado
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-foreground/10">
            <CardHeader className="gap-4 border-b border-foreground/10 bg-muted/20 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Ruler className="size-4" />
                  Avance por rubro
                </CardTitle>
                <CardDescription>
                  Comparativo ejecutado vs. contratado — {obra.numeroContrato}
                </CardDescription>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[20rem]">
                <div className="relative">
                  <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar rubro…"
                    className="pl-8"
                  />
                </div>
                <Select
                  value={filtroEstado}
                  onValueChange={(v) => setFiltroEstado(v as EstadoAvanceRubro | "todos")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="sin_inicio">Sin inicio</SelectItem>
                    <SelectItem value="en_ejecucion">En ejecución</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="sobre_ejecucion">Sobre ejecución</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[32rem] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-12 pl-4">Nº</TableHead>
                      <TableHead className="min-w-[14rem]">Detalle</TableHead>
                      <TableHead className="w-16 text-center">Unid.</TableHead>
                      <TableHead className="w-24 text-right">Contrat.</TableHead>
                      <TableHead className="w-24 text-right">Ejecut.</TableHead>
                      <TableHead className="min-w-[8rem]">Avance</TableHead>
                      <TableHead className="w-28 pr-4">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumenesFiltrados.map((r) => (
                      <TableRow key={r.rubroId} className="border-foreground/10">
                        <TableCell className="pl-4 font-mono text-sm tabular-nums">
                          {r.rubroId}
                        </TableCell>
                        <TableCell className="max-w-[18rem] whitespace-normal">
                          <p className="text-sm leading-snug">{r.detalle}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {r.categoria}
                          </p>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {r.unidad}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {formatearCantidad(r.cantidadContratada)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium tabular-nums">
                          {formatearCantidad(r.cantidadEjecutada)}
                        </TableCell>
                        <TableCell>
                          <BarraAvance porcentaje={r.avancePorcentaje} estado={r.estado} />
                        </TableCell>
                        <TableCell className="pr-4">
                          <Badge
                            variant="outline"
                            className={cn("font-normal", ESTADO_ESTILOS[r.estado])}
                          >
                            {r.estado === "sobre_ejecucion" ? (
                              <AlertTriangle className="mr-1 size-3" />
                            ) : null}
                            {ESTADO_ETIQUETAS[r.estado]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {resumenesFiltrados.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No hay rubros que coincidan con la búsqueda o el filtro seleccionado.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-foreground/10">
            <CardHeader>
              <CardTitle className="text-base">Últimos metrados</CardTitle>
              <CardDescription>Registros recientes de campo</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {entradasRecientes.map((entrada) => {
                const rubro = presupuestoData.find((r) => r.id === entrada.rubroId)
                return (
                  <div
                    key={entrada.id}
                    className="rounded-lg border border-foreground/10 bg-muted/20 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {formatearFechaCorta(entrada.fecha)} · {entrada.frente}
                      </p>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        #{entrada.rubroId}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {formatearCantidad(entrada.cantidad)} {rubro?.unidad ?? ""}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {rubro?.detalle}
                    </p>
                    {entrada.observaciones ? (
                      <p className="mt-1 text-xs text-muted-foreground italic">
                        {entrada.observaciones}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
