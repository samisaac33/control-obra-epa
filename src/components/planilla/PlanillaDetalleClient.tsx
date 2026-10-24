"use client"

import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DOCUMENTOS_PLANILLA_CATALOGO } from "@/src/data/planilla/documentos-catalog"
import { slugDesdeTipoDocumento } from "@/src/lib/planilla-documento-slug"
import type { PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import { cn } from "@/lib/utils"

type PlanillaDetalleClientProps = {
  config: ProyectoPlanillaConfig
  periodo: PlanillaPeriodo
}

export function PlanillaDetalleClient({ config, periodo }: PlanillaDetalleClientProps) {
  const { proyectoId } = useProyecto()
  const basePlanilla = rutaObra(proyectoId, `planillas/${periodo.numero}`)

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <Link
          href={rutaObra(proyectoId, "planillas")}
          className="mt-1 inline-flex size-9 items-center justify-center rounded-lg border border-foreground/10 bg-muted/50 text-foreground hover:bg-muted"
          aria-label="Volver a planillas"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{periodo.etiqueta}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Periodo {periodo.fecha_inicio} — {periodo.fecha_fin} · avance objetivo{" "}
            {periodo.porcentaje_avance_objetivo} %
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Inicio de plazo registrado: {config.fecha_inicio_plazo}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {DOCUMENTOS_PLANILLA_CATALOGO.map((doc) => {
          const disponible = doc.estado === "disponible" && doc.rutaGenerador
          const href = disponible
            ? `${basePlanilla}/documentos/${slugDesdeTipoDocumento(doc.id)}`
            : undefined

          const inner = (
            <Card
              className={cn(
                "h-full border-foreground/10 transition-colors",
                disponible && "hover:border-primary/30 hover:bg-primary/5"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="size-4 shrink-0 text-primary" aria-hidden />
                    {doc.titulo}
                  </CardTitle>
                  <Badge variant={disponible ? "secondary" : "outline"}>
                    {disponible ? "Generar" : "Próximamente"}
                  </Badge>
                </div>
                <CardDescription>{doc.descripcion}</CardDescription>
              </CardHeader>
              {disponible ? (
                <CardContent>
                  <span className="text-xs font-medium text-primary">Abrir sección →</span>
                </CardContent>
              ) : null}
            </Card>
          )

          if (!href) {
            return (
              <div key={doc.id} className="opacity-70">
                {inner}
              </div>
            )
          }

          return (
            <Link key={doc.id} href={href} className="block">
              {inner}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
