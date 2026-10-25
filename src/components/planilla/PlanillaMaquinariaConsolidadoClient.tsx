"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { presupuestoRubrosPorProyecto } from "@/src/data/planilla/presupuesto-por-proyecto"
import type { PlanillaNumero, PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { cargarMedicionesRubrosPlanilla } from "@/src/lib/cargar-planilla-medicion-rubros"
import { useJornadasMaquinariaProyecto } from "@/src/hooks/use-jornadas-maquinaria-proyecto"
import {
  armarFilasConsolidadoMaquinariaPlanilla,
  filtrarJornadasMaquinariaEnPeriodo,
} from "@/src/lib/planilla-maquinaria-consolidado"
import {
  calcularHorasTeoricasAgregadasPlanilla,
  horasTeoricasPorEquipoMinimo,
  RENDIMIENTO_APU_M3_H,
} from "@/src/lib/planilla-maquinaria-teorico"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import { cargarEquiposMaquinariaProyecto } from "@/src/lib/proyecto-equipos-maquinaria"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import { createClient } from "@/src/lib/supabase/client"

type PlanillaMaquinariaConsolidadoClientProps = {
  config: ProyectoPlanillaConfig
  periodo: PlanillaPeriodo
  planillaNumero: PlanillaNumero
}

function fmtHoras(n: number | null): string {
  if (n == null) return "—"
  return `${formatearNumero(n, 1)} h`
}

function fmtDelta(n: number | null): string {
  if (n == null) return "—"
  const sign = n > 0 ? "+" : ""
  return `${sign}${formatearNumero(n, 1)} h`
}

export function PlanillaMaquinariaConsolidadoClient({
  config,
  periodo,
  planillaNumero,
}: PlanillaMaquinariaConsolidadoClientProps) {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const rubros = useMemo(() => presupuestoRubrosPorProyecto(proyectoId), [proyectoId])
  const { jornadas, loading: loadingJornadas, error: errorJornadas, recargar } =
    useJornadasMaquinariaProyecto()

  const [equipos, setEquipos] = useState<Awaited<ReturnType<typeof cargarEquiposMaquinariaProyecto>>>([])
  const [loadingExtras, setLoadingExtras] = useState(true)
  const [errorExtras, setErrorExtras] = useState<string | null>(null)

  const recargarExtras = useCallback(async () => {
    setLoadingExtras(true)
    setErrorExtras(null)
    try {
      const [eq] = await Promise.all([
        cargarEquiposMaquinariaProyecto(supabase, proyectoId),
      ])
      setEquipos(eq)
    } catch (err) {
      setErrorExtras(err instanceof Error ? err.message : "Error al cargar datos auxiliares.")
    } finally {
      setLoadingExtras(false)
    }
  }, [proyectoId, supabase])

  const [mediciones, setMediciones] = useState<
    Awaited<ReturnType<typeof cargarMedicionesRubrosPlanilla>>
  >([])

  const recargarMediciones = useCallback(async () => {
    try {
      const m = await cargarMedicionesRubrosPlanilla(supabase, proyectoId, planillaNumero)
      setMediciones(m)
    } catch {
      setMediciones([])
    }
  }, [planillaNumero, proyectoId, supabase])

  useEffect(() => {
    void recargarExtras()
    void recargarMediciones()
  }, [recargarExtras, recargarMediciones])

  const jornadasPeriodo = useMemo(
    () => filtrarJornadasMaquinariaEnPeriodo(jornadas, periodo.fecha_inicio, periodo.fecha_fin),
    [jornadas, periodo.fecha_inicio, periodo.fecha_fin]
  )

  const agregadas = useMemo(
    () =>
      calcularHorasTeoricasAgregadasPlanilla(
        rubros,
        config,
        periodo,
        planillaNumero,
        mediciones
      ),
    [rubros, config, periodo, planillaNumero, mediciones]
  )

  const filas = useMemo(() => {
    const teoricoMap = horasTeoricasPorEquipoMinimo(agregadas)
    return armarFilasConsolidadoMaquinariaPlanilla(teoricoMap, jornadasPeriodo, equipos)
  }, [agregadas, jornadasPeriodo, equipos])

  const totales = useMemo(() => {
    let teorico = 0
    let real = 0
    for (const f of filas) {
      real += f.horasReales
      if (f.horasTeoricas != null) teorico += f.horasTeoricas
    }
    return { teorico, real, delta: real - teorico }
  }, [filas])

  const loading = loadingJornadas || loadingExtras
  const error = errorJornadas ?? errorExtras

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Consolidado de maquinaria — {periodo.etiqueta}</h1>
        <p className="text-sm text-muted-foreground">
          Cruce entre equipo mínimo (arrendamiento), horas teóricas del periodo según medición APU
          (rubros 2–8) y horas reales desde jornadas del mapa ({periodo.fecha_inicio} —{" "}
          {periodo.fecha_fin}).
        </p>
        <p className="text-sm">
          <Link
            href={rutaObra(proyectoId, "maquinaria")}
            className="text-primary underline-offset-4 hover:underline"
          >
            Ver módulo maquinaria del proyecto
          </Link>
        </p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Referencia APU (m³/h máquina)</CardTitle>
          <CardDescription className="text-xs">
            Desazolve trasvase {RENDIMIENTO_APU_M3_H.desazolve_trasvase} · San Antonio{" "}
            {RENDIMIENTO_APU_M3_H.desazolve_san_antonio} · desalojo {RENDIMIENTO_APU_M3_H.desalojo}{" "}
            · tendido {RENDIMIENTO_APU_M3_H.tendido} por equipo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            Volumen periodo desazolve (rub. 2+6):{" "}
            <span className="font-medium tabular-nums">
              {formatearNumero(
                agregadas.volumenDesazolveTrasvaseM3 + agregadas.volumenDesazolveSanAntonioM3,
                0
              )}{" "}
              m³
            </span>
          </p>
          <p>
            Volumen periodo desalojo (rub. 3+7):{" "}
            <span className="font-medium tabular-nums">
              {formatearNumero(agregadas.volumenDesalojoM3, 0)} m³
            </span>
          </p>
          <p>
            Volumen periodo tendido (rub. 4+8):{" "}
            <span className="font-medium tabular-nums">
              {formatearNumero(agregadas.volumenTendidoM3, 0)} m³
            </span>
          </p>
          <p>
            Objetivo avance planilla:{" "}
            <span className="font-medium">
              {planillaNumero === 1
                ? `${config.porcentaje_avance_planilla_1} % acumulado`
                : "100 % acumulado"}
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => {
            void recargar()
            void recargarExtras()
            void recargarMediciones()
          }}
        >
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="mr-2 size-4" aria-hidden />
          )}
          Actualizar
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipo mínimo</TableHead>
              <TableHead>Arrendador</TableHead>
              <TableHead className="text-right">Teórico</TableHead>
              <TableHead className="text-right">Real (periodo)</TableHead>
              <TableHead className="text-right">Δ</TableHead>
              <TableHead className="text-right">Jornadas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((f) => (
              <TableRow key={f.equipo.id}>
                <TableCell className="max-w-[220px]">
                  <div className="font-medium">
                    {[f.equipo.marca, f.equipo.modelo].filter(Boolean).join(" ") || f.equipo.nombre}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {f.equipo.placa ? `Placa ${f.equipo.placa}` : f.equipo.nombre}
                    {f.notasTeorico ? ` · ${f.notasTeorico}` : null}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{f.equipo.arrendador}</TableCell>
                <TableCell className="text-right tabular-nums">{fmtHoras(f.horasTeoricas)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmtHoras(f.horasReales)}</TableCell>
                <TableCell
                  className={`text-right tabular-nums ${
                    f.deltaHoras != null && Math.abs(f.deltaHoras) > 50
                      ? "text-amber-700 dark:text-amber-400"
                      : ""
                  }`}
                >
                  {fmtDelta(f.deltaHoras)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{f.jornadas}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Totales operativos con APU: teórico {fmtHoras(totales.teorico)} · real {fmtHoras(totales.real)}{" "}
        · {fmtDelta(totales.delta)}. Las horas reales usan la misma regla que /maquinaria (minitramos
        terminados, sin doble conteo GPS).
      </p>
    </div>
  )
}
