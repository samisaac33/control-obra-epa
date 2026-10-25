"use client"

import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MEMBRETE_EPA, RESOLUCION_EMERGENCIA } from "@/src/data/contrato-emergencia-severino-trasvase"
import {
  lineaFirmaPersonal,
  residentesObraCivil,
  superintendenteObra,
} from "@/src/data/planilla/personal-tecnico-contratista"
import type { PlanillaPeriodo } from "@/src/data/planilla/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"

type PlanillaMemorandoDocumentProps = {
  periodo: PlanillaPeriodo
}

export function PlanillaMemorandoDocument({ periodo }: PlanillaMemorandoDocumentProps) {
  const { proyectoActivo, proyectoId } = useProyecto()
  const superintendente = superintendenteObra(proyectoId)
  const residentes = residentesObraCivil(proyectoId)
  const hoy = new Date().toLocaleDateString("es-EC", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6 flex justify-end print:hidden">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 size-4" aria-hidden />
          Imprimir / PDF
        </Button>
      </div>
      <article className="space-y-4 rounded-xl border border-foreground/10 bg-card p-6 text-sm leading-relaxed shadow-sm print:border-0 print:shadow-none">
        <header className="text-center">
          <p className="font-semibold">{MEMBRETE_EPA}</p>
          <p className="text-xs text-muted-foreground">{RESOLUCION_EMERGENCIA}</p>
        </header>
        <p className="text-right text-muted-foreground">{hoy}</p>
        <p>
          <strong>Señor(a)</strong>
          <br />
          Fiscalizador de Obra
          <br />
          Empresa Pública del Agua — EPA EP
        </p>
        <p>
          <strong>Asunto:</strong> Presentación de {periodo.etiqueta} — periodo {periodo.fecha_inicio}{" "}
          al {periodo.fecha_fin}
        </p>
        <p>De mi consideración:</p>
        <p>
          En cumplimiento del contrato de emergencia <strong>{proyectoActivo.numeroContrato}</strong>{" "}
          ({proyectoActivo.objeto}), me permito hacer entrega de la documentación de soporte
          correspondiente a la {periodo.etiqueta.toLowerCase()}, con avance físico programado del{" "}
          <strong>{periodo.porcentaje_avance_objetivo} %</strong>, conforme libro de obra, informes,
          reportes de conciliación y anexos generados desde el sistema de control de obra.
        </p>
        <p>
          Adjunto el paquete documental disponible en la plataforma para revisión del Administrador
          del Contrato y trámite de pago correspondiente.
        </p>
        <p>Atentamente,</p>
        {residentes.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Residentes de obra civil:{" "}
            {residentes.map((r) => `${r.titulo} ${r.nombres} ${r.apellidos}`).join(" · ")}
          </p>
        ) : null}
        <div className="pt-12">
          <div className="border-t border-foreground/30 pt-2">
            {superintendente
              ? lineaFirmaPersonal(superintendente, "Superintendente de Obra (Contratista)")
              : "Superintendente de Obra (Contratista)"}
          </div>
        </div>
      </article>
    </div>
  )
}
