import { PROYECTO } from "@/src/data/proyecto"

type MaquinariaDocumentoEncabezadoProps = {
  subtitulo: string
  rangoEtiqueta: string
  generadoEn: string
  etapaLabel?: string
}

export function MaquinariaDocumentoEncabezado({
  subtitulo,
  rangoEtiqueta,
  generadoEn,
  etapaLabel,
}: MaquinariaDocumentoEncabezadoProps) {
  const fechaGeneracion = new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(generadoEn))

  return (
    <header className="mb-4 border-b-2 border-neutral-900 pb-3 text-center print:mb-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
        {subtitulo}
      </p>
      <h1 className="mt-1 font-heading text-lg font-bold leading-tight sm:text-xl">
        {PROYECTO.nombreObra}
      </h1>
      <p className="mt-1 text-xs text-neutral-700">{PROYECTO.objeto}</p>
      <dl className="mt-2 grid gap-0.5 text-xs text-neutral-800 sm:grid-cols-2 sm:gap-x-4 sm:text-left">
        <div>
          <dt className="inline font-semibold">Contrato: </dt>
          <dd className="inline">{PROYECTO.numeroContrato}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Cliente: </dt>
          <dd className="inline">{PROYECTO.cliente}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Sistema: </dt>
          <dd className="inline">{PROYECTO.sistema}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Período del reporte: </dt>
          <dd className="inline">{rangoEtiqueta}</dd>
        </div>
        {etapaLabel ? (
          <div className="sm:col-span-2">
            <dt className="inline font-semibold">Etapa: </dt>
            <dd className="inline">{etapaLabel}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-2 text-[10px] text-neutral-500">Documento generado el {fechaGeneracion}</p>
    </header>
  )
}
