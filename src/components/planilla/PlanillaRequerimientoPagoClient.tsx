"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Printer, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { presupuestoRubrosPorProyecto } from "@/src/data/planilla/presupuesto-por-proyecto"
import type { PlanillaNumero, PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  cargarMedicionesRubrosPlanilla,
  guardarMedicionesRubrosPlanilla,
} from "@/src/lib/cargar-planilla-medicion-rubros"
import {
  calcularRequerimientoPago,
  sugerirCantidadesPeriodo,
  type ResumenRequerimientoPago,
} from "@/src/lib/planilla-requerimiento-pago"
import { formatearCantidad, formatearUsd } from "@/lib/sicc/format"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import { createClient } from "@/src/lib/supabase/client"

type PlanillaRequerimientoPagoClientProps = {
  config: ProyectoPlanillaConfig
  periodo: PlanillaPeriodo
  planillaNumero: PlanillaNumero
}

type EdicionFila = {
  cantidadPeriodo: string
  cantidadAcumuladaAnterior: string
}

export function PlanillaRequerimientoPagoClient({
  config,
  periodo,
  planillaNumero,
}: PlanillaRequerimientoPagoClientProps) {
  const { proyectoId, proyectoActivo } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const rubros = useMemo(() => presupuestoRubrosPorProyecto(proyectoId), [proyectoId])

  const [ediciones, setEdiciones] = useState<Record<number, EdicionFila>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const aplicarSugeridas = useCallback(() => {
    const sug = sugerirCantidadesPeriodo(rubros, config, planillaNumero)
    const next: Record<number, EdicionFila> = {}
    for (const r of rubros) {
      const s = sug.get(r.id)
      next[r.id] = {
        cantidadPeriodo: s ? String(s.cantidadPeriodo) : "0",
        cantidadAcumuladaAnterior: s ? String(s.cantidadAcumuladaAnterior) : "0",
      }
    }
    setEdiciones(next)
  }, [config, planillaNumero, rubros])

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const mediciones = await cargarMedicionesRubrosPlanilla(supabase, proyectoId, planillaNumero)
      if (mediciones.length === 0) {
        aplicarSugeridas()
      } else {
        const next: Record<number, EdicionFila> = {}
        for (const m of mediciones) {
          next[m.rubro_id] = {
            cantidadPeriodo: String(m.cantidad_periodo),
            cantidadAcumuladaAnterior: String(m.cantidad_acumulada_anterior),
          }
        }
        for (const r of rubros) {
          if (!next[r.id]) {
            next[r.id] = { cantidadPeriodo: "0", cantidadAcumuladaAnterior: "0" }
          }
        }
        setEdiciones(next)
      }
    } catch (err) {
      aplicarSugeridas()
      setError(err instanceof Error ? err.message : "No se pudieron cargar mediciones guardadas.")
    } finally {
      setLoading(false)
    }
  }, [aplicarSugeridas, planillaNumero, proyectoId, rubros, supabase])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const medicionesParaCalculo = useMemo(() => {
    return rubros.map((r) => {
      const e = ediciones[r.id]
      return {
        rubro_id: r.id,
        cantidad_periodo: Number(e?.cantidadPeriodo.replace(",", ".") ?? 0) || 0,
        cantidad_acumulada_anterior:
          Number(e?.cantidadAcumuladaAnterior.replace(",", ".") ?? 0) || 0,
      }
    })
  }, [ediciones, rubros])

  const resumen: ResumenRequerimientoPago = useMemo(
    () =>
      calcularRequerimientoPago(rubros, config, periodo, planillaNumero, medicionesParaCalculo),
    [config, medicionesParaCalculo, periodo, planillaNumero, rubros]
  )

  async function guardar() {
    setSaving(true)
    setError(null)
    setMensaje(null)
    try {
      await guardarMedicionesRubrosPlanilla(
        supabase,
        medicionesParaCalculo.map((m) => ({
          proyecto_id: proyectoId,
          planilla_numero: planillaNumero,
          rubro_id: m.rubro_id,
          cantidad_periodo: m.cantidad_periodo,
          cantidad_acumulada_anterior: m.cantidad_acumulada_anterior,
        }))
      )
      setMensaje("Mediciones guardadas.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.")
    } finally {
      setSaving(false)
    }
  }

  const pdfHref = rutaObra(proyectoId, `planillas/${planillaNumero}/requerimiento-pago/pdf`)

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6 print:max-w-none">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div>
          <h1 className="text-lg font-semibold">Requerimiento de pago / medición</h1>
          <p className="text-sm text-muted-foreground">
            {periodo.etiqueta} · {proyectoActivo.numeroContrato}
          </p>
          <p className="text-xs text-muted-foreground">
            Avance acumulado objetivo: {resumen.pctAvanceAcumuladoObjetivo} % (Δ periodo{" "}
            {resumen.deltaAvancePeriodo.toFixed(2)} %)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => aplicarSugeridas()}>
            <RefreshCw className="mr-1 size-3.5" aria-hidden />
            Recalcular sugerido
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={saving} onClick={() => void guardar()}>
            {saving ? "Guardando…" : "Guardar mediciones"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1 size-3.5" aria-hidden />
            Imprimir
          </Button>
          <Button type="button" size="sm" asChild>
            <Link href={pdfHref} target="_blank" rel="noreferrer">
              PDF
            </Link>
          </Button>
        </div>
      </header>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground print:hidden">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Cargando rubros…
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-amber-700 dark:text-amber-300" role="status">
          {error}
        </p>
      ) : null}
      {mensaje ? <p className="text-sm text-green-700 dark:text-green-300">{mensaje}</p> : null}

      <Card className="border-foreground/10 print:border-0 print:shadow-none">
        <CardHeader className="print:px-0">
          <CardTitle className="text-base">Resumen financiero del periodo</CardTitle>
          <CardDescription>
            {periodo.fecha_inicio} — {periodo.fecha_fin}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4 print:px-0">
          <p>
            Monto contrato: <strong>{formatearUsd(resumen.montoContratoTotal)}</strong>
          </p>
          <p>
            Este periodo: <strong>{formatearUsd(resumen.montoPeriodo)}</strong>
          </p>
          <p>
            Acumulado: <strong>{formatearUsd(resumen.montoAcumulado)}</strong>
          </p>
          <p>
            Saldo: <strong>{formatearUsd(resumen.montoSaldoContrato)}</strong>
          </p>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-foreground/10 print:border print:border-black">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rubro</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead className="text-right">PU</TableHead>
              <TableHead className="text-right">Cant. contrato</TableHead>
              <TableHead className="text-right print:hidden">Acum. anterior</TableHead>
              <TableHead className="text-right print:hidden">Cant. periodo</TableHead>
              <TableHead className="text-right">Acumulado</TableHead>
              <TableHead className="text-right">Monto periodo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resumen.lineas.map((l) => (
              <TableRow key={l.rubroId}>
                <TableCell className="font-mono text-xs">{l.rubroId}</TableCell>
                <TableCell className="min-w-[200px] text-xs">
                  <span className="block text-muted-foreground">{l.categoria}</span>
                  {l.detalle}
                </TableCell>
                <TableCell className="text-right text-xs">{formatearUsd(l.precioUnitario)}</TableCell>
                <TableCell className="text-right text-xs">
                  {formatearCantidad(l.cantidadContrato)} {l.unidad}
                </TableCell>
                <TableCell className="text-right print:hidden">
                  <Input
                    className="ml-auto h-8 w-24 text-right text-xs"
                    inputMode="decimal"
                    value={ediciones[l.rubroId]?.cantidadAcumuladaAnterior ?? ""}
                    onChange={(e) =>
                      setEdiciones((prev) => ({
                        ...prev,
                        [l.rubroId]: {
                          cantidadPeriodo: prev[l.rubroId]?.cantidadPeriodo ?? "0",
                          cantidadAcumuladaAnterior: e.target.value,
                        },
                      }))
                    }
                  />
                </TableCell>
                <TableCell className="text-right print:hidden">
                  <Input
                    className="ml-auto h-8 w-24 text-right text-xs"
                    inputMode="decimal"
                    value={ediciones[l.rubroId]?.cantidadPeriodo ?? ""}
                    onChange={(e) =>
                      setEdiciones((prev) => ({
                        ...prev,
                        [l.rubroId]: {
                          cantidadAcumuladaAnterior:
                            prev[l.rubroId]?.cantidadAcumuladaAnterior ?? "0",
                          cantidadPeriodo: e.target.value,
                        },
                      }))
                    }
                  />
                </TableCell>
                <TableCell className="text-right text-xs">
                  {formatearCantidad(l.cantidadAcumulada)} {l.unidad}
                </TableCell>
                <TableCell className="text-right text-xs font-medium">
                  {formatearUsd(l.montoPeriodo)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7} className="text-right font-semibold">
                Total requerimiento del periodo
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatearUsd(resumen.montoPeriodo)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground print:mt-6">
        Firmas: Superintendente de Obra (Contratista) · Fiscalizador de Obra (EPA EP) ·
        Administrador del Contrato (EPA EP)
      </p>
    </div>
  )
}
