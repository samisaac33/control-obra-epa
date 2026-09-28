"use client"

import Link from "next/link"
import { ArrowRight, Droplets, FileWarning } from "lucide-react"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PROYECTO_DESASOLVE_CANALES,
  PROYECTO_EMERGENCIA_MANABI,
  PROYECTOS,
} from "@/src/data/proyectos/catalog"
import { rutaObra } from "@/src/lib/rutas-proyecto"

const obras = [
  {
    id: PROYECTO_EMERGENCIA_MANABI,
    icon: FileWarning,
    descripcion:
      "Informe de afectación, presupuesto contractual, maquinaria, evidencias fotográficas e informe de obra.",
  },
  {
    id: PROYECTO_DESASOLVE_CANALES,
    icon: Droplets,
    descripcion: "Mapa de avance por tramos, registro de maquinaria y evidencias fotográficas georreferenciadas.",
  },
] as const

export function SeleccionObraPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="border-b border-foreground/10 bg-card/80 px-4 py-6 shadow-sm sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Control de Obra
        </p>
        <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          JBS Consorcio
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Elija la obra a consultar. Cada contrato tiene su propio panel; no es necesario cambiar de
          proyecto dentro del sistema.
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8 sm:px-6">
        {obras.map(({ id, icon: Icon, descripcion }) => {
          const proyecto = PROYECTOS[id]
          return (
            <Link key={id} href={rutaObra(id)} className="group block">
              <Card className="transition-colors hover:border-primary/40 hover:bg-primary/5">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80 group-hover:border-primary/30 group-hover:text-primary">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base leading-snug sm:text-lg">{proyecto.nombreObra}</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-relaxed">{descripcion}</CardDescription>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Entrar al panel
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </main>
    </div>
  )
}
