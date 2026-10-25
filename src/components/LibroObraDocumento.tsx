import { EstadoHitoBadge } from "@/src/components/EstadoHitoBadge"
import { EvidenciaBloque } from "@/src/components/LibroObraDocumentoEvidencia"
import { LibroObraHojaEpa } from "@/src/components/LibroObraHojaEpa"
import { CONSORCIO_CONTRATISTA_RAZON } from "@/src/data/brand/logos-proyecto"
import { ESTADOS_HITO } from "@/src/data/estados-hito"
import { PROYECTO } from "@/src/data/proyecto"
import type { ProyectoConfig } from "@/src/data/proyectos/catalog"
import {
  formatearFechaLibroObra,
  type LibroObraEntradaDia,
} from "@/src/lib/libro-obra"

type LibroObraDocumentoProps = {
  entradas: LibroObraEntradaDia[]
  generadoEn: string
  rangoEtiqueta: string
  variant?: "evidencias" | "planilla"
  proyecto?: ProyectoConfig
}

function EntradaDiaEvidencias({
  entrada,
  numero,
}: {
  entrada: LibroObraEntradaDia
  numero: number
}) {
  return (
    <section className="libro-obra-dia mb-8 break-inside-avoid-page scroll-mt-4 print:mb-6">
      <header className="mb-3 border-b-2 border-neutral-900 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Entrada {numero}
        </p>
        <h3 className="text-lg font-bold text-neutral-950">{formatearFechaLibroObra(entrada.fecha)}</h3>
      </header>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
          Registro fotográfico ({entrada.evidencias.length}{" "}
          {entrada.evidencias.length === 1 ? "grupo" : "grupos"})
        </h4>
        {entrada.evidencias.length === 0 ? (
          <p className="rounded border border-dashed border-neutral-400 bg-neutral-50 px-3 py-4 text-center text-[13px] text-neutral-600">
            Sin evidencias fotográficas este día.
          </p>
        ) : (
          entrada.evidencias.map((grupo, index) => (
            <EvidenciaBloque key={grupo.grupoId} grupo={grupo} indice={index} />
          ))
        )}
      </div>
    </section>
  )
}

export function LibroObraDocumento({
  entradas,
  generadoEn,
  rangoEtiqueta,
  variant = "evidencias",
  proyecto = PROYECTO,
}: LibroObraDocumentoProps) {
  const fechaGeneracion = new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(generadoEn))

  if (variant === "planilla") {
    return (
      <div
        id="libro-obra-documento"
        className="mx-auto max-w-[210mm] bg-white px-2 py-4 text-neutral-950 shadow-sm ring-1 ring-neutral-200 print:mx-0 print:max-w-none print:px-0 print:py-0 print:shadow-none print:ring-0"
      >
        <p className="mb-4 text-center text-[10px] text-neutral-500 print:hidden">
          Período {rangoEtiqueta} — generado {fechaGeneracion}
        </p>
        {entradas.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-600">
            No hay días en el rango seleccionado para el libro de obra.
          </p>
        ) : (
          entradas.map((entrada, index) => (
            <LibroObraHojaEpa
              key={entrada.fecha}
              entrada={entrada}
              proyecto={proyecto}
              numeroEntrada={index + 1}
            />
          ))
        )}
      </div>
    )
  }

  return (
    <div
      id="libro-obra-documento"
      className="mx-auto max-w-[210mm] bg-white px-6 py-8 text-neutral-950 shadow-sm ring-1 ring-neutral-200 print:mx-0 print:max-w-none print:px-0 print:py-0 print:shadow-none print:ring-0"
    >
      <header className="mb-8 border-b-2 border-neutral-900 pb-4 text-center print:mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Informe de evidencias de obra — fiscalización interna
        </p>
        <h1 className="mt-2 font-heading text-xl font-bold leading-tight sm:text-2xl">
          {proyecto.nombreObra}
        </h1>
        <p className="mt-2 text-sm text-neutral-700">{proyecto.objeto}</p>
        <dl className="mt-4 grid gap-1 text-sm text-neutral-800 sm:grid-cols-2 sm:gap-x-6 sm:text-left">
          <div>
            <dt className="inline font-semibold">Contrato: </dt>
            <dd className="inline">{proyecto.numeroContrato}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Cliente: </dt>
            <dd className="inline">{proyecto.cliente}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Sistema: </dt>
            <dd className="inline">{proyecto.sistema}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Período consolidado: </dt>
            <dd className="inline">{rangoEtiqueta}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-neutral-500">Documento generado el {fechaGeneracion}</p>
        <div className="mt-4 border-t border-neutral-200 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">
            Leyenda — estado del hito
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {ESTADOS_HITO.map((estado) => (
              <EstadoHitoBadge
                key={estado.id}
                estadoHito={estado.id}
                className="informe-estado-hito px-2 py-0.5 text-xs"
              />
            ))}
          </div>
        </div>
      </header>

      {entradas.length === 0 ? (
        <p className="py-12 text-center text-sm text-neutral-600">
          No hay evidencias fotográficas para el rango seleccionado.
        </p>
      ) : (
        entradas.map((entrada, index) => (
          <EntradaDiaEvidencias key={entrada.fecha} entrada={entrada} numero={index + 1} />
        ))
      )}

      <footer className="mt-8 border-t border-neutral-300 pt-4 text-center text-xs text-neutral-500 print:mt-6">
        <p>
          Consolidado automático a partir del registro fotográfico — {CONSORCIO_CONTRATISTA_RAZON}
        </p>
        <p className="mt-1">Uso exclusivo para fiscalización interna. No sustituye firmas oficiales.</p>
      </footer>
    </div>
  )
}
