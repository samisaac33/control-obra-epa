"use client"

import Link from "next/link"
import { Camera, LayoutDashboard, Map, Truck } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { UltimasEvidencias } from "@/src/components/UltimasEvidencias"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapaTramosKpis } from "@/src/components/mapa/MapaTramosKpis"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"
import type { CanalTramo } from "@/src/data/tramos/types"
import { createClient } from "@/src/lib/supabase/client"
import { cargarPuntosAvancePorProyecto } from "@/src/lib/tramo-avance-coordenadas"
import { calcularKpisTramos } from "@/src/lib/tramos-avance"

const accesos = [
  {
    href: "/mapa",
    label: "Mapa de avance",
    descripcion: "Tramos de canal georreferenciados con estado y avance por longitud",
    icon: Map,
  },
  {
    href: "/fotos",
    label: "Evidencias fotográficas",
    descripcion: "Registro de campo georreferenciado por canal y frente",
    icon: Camera,
  },
  {
    href: "/maquinaria",
    label: "Maquinaria y transporte",
    descripcion: "Uso diario de excavadoras y equipos de apoyo",
    icon: Truck,
  },
] as const

export function HomeProyectoDesasolve() {
  const { proyectoActivo } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const [kpis, setKpis] = useState(calcularKpisTramos([]))

  const cargarKpis = useCallback(async () => {
    const [{ data }, puntos] = await Promise.all([
      supabase
        .from("canal_tramos")
        .select("id, longitud_m, metros_ejecutados, estado, codigo, canal, geometria, avance_pct")
        .eq("proyecto_id", PROYECTO_DESASOLVE_CANALES),
      cargarPuntosAvancePorProyecto(supabase, PROYECTO_DESASOLVE_CANALES),
    ])

    const tramos = (data ?? []).map(
      (row) =>
        ({
          id: String(row.id),
          proyecto_id: PROYECTO_DESASOLVE_CANALES,
          codigo: String(row.codigo),
          canal: String(row.canal),
          longitud_m: Number(row.longitud_m),
          geometria: row.geometria as CanalTramo["geometria"],
          estado: row.estado as CanalTramo["estado"],
          avance_pct: Number(row.avance_pct),
          metros_ejecutados: Number(row.metros_ejecutados),
          origen_extremo: null,
          fecha_inicio: null,
          fecha_fin: null,
          semana_programada: null,
          maquinaria_asignada: null,
          observaciones: null,
        }) satisfies CanalTramo
    )

    setKpis(calcularKpisTramos(tramos, puntos))
  }, [supabase])

  useEffect(() => {
    void cargarKpis()
  }, [cargarKpis])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
              <LayoutDashboard className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {proyectoActivo.nombreObra}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <Card className="border-primary/20 bg-primary/5 ring-1 ring-primary/10">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{proyectoActivo.nombreObra}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              <span className="block">Cliente: {proyectoActivo.cliente}</span>
              <span className="mt-1 block">Contrato: {proyectoActivo.numeroContrato}</span>
              <span className="mt-1 block">{proyectoActivo.objeto}</span>
            </CardDescription>
          </CardHeader>
        </Card>

        <section aria-labelledby="kpis-mapa-title">
          <h2 id="kpis-mapa-title" className="mb-3 text-base font-semibold tracking-tight">
            Avance del desasolve
          </h2>
          <MapaTramosKpis kpis={kpis} compact />
        </section>

        <section aria-labelledby="accesos-desasolve-title">
          <h2 id="accesos-desasolve-title" className="mb-3 text-base font-semibold tracking-tight">
            Accesos rápidos
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accesos.map(({ href, label, descripcion, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col rounded-xl border border-foreground/10 bg-card p-4 shadow-sm ring-1 ring-foreground/5 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden />
                </div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary">{label}</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{descripcion}</p>
                <span className="mt-3 text-xs font-medium text-primary">Ir a la sección →</span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="evidencias-desasolve-title">
          <Card className="border-foreground/10">
            <CardHeader>
              <CardTitle id="evidencias-desasolve-title" className="text-base sm:text-lg">
                Últimas evidencias fotográficas
              </CardTitle>
              <CardDescription>
                Registro de campo georreferenciado — proyecto desasolve de canales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UltimasEvidencias proyectoId={PROYECTO_DESASOLVE_CANALES} />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
