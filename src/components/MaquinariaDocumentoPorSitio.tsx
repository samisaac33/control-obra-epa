import { MaquinariaDocumentoEncabezado } from "@/src/components/MaquinariaDocumentoEncabezado"
import { ETAPAS_MAQUINARIA, type EtapaMaquinariaId } from "@/src/data/maquinaria-etapas"
import type { RegistroDia } from "@/src/data/registro-maquinaria"
import {
  construirReportePorSitio,
  etiquetaAccionistaJimmy,
  etiquetaAccionistaMauricio,
  etiquetaMaquinariaReporte,
  etiquetaViajesReporte,
  formatearFechaReporteSitio,
  type FilaReporteSitio,
  type SeccionReporteSitio,
} from "@/src/lib/maquinaria-reporte-sitio"

type MaquinariaDocumentoPorSitioProps = {
  dias: RegistroDia[]
  rangoEtiqueta: string
  generadoEn: string
  etapaId?: EtapaMaquinariaId
}

function TablaSitio({ seccion }: { seccion: SeccionReporteSitio }) {
  const mostrarViajes = seccion.frente !== "poza_honda"

  if (seccion.filas.length === 0) {
    return (
      <p className="text-xs text-neutral-600 italic">Sin registros en este sitio para el período.</p>
    )
  }

  return (
    <>
      <table className="w-full border-collapse text-[11px] print:text-[9px]">
        <thead>
          <tr className="bg-neutral-100">
            <th className="border border-neutral-300 px-2 py-1 text-left font-semibold">Fecha</th>
            <th className="border border-neutral-300 px-2 py-1 text-left font-semibold">Día</th>
            <th className="border border-neutral-300 px-2 py-1 text-left font-semibold">Maquinaria</th>
            {mostrarViajes ? (
              <>
                <th className="border border-neutral-300 px-2 py-1 text-right font-semibold">
                  Viajes {etiquetaAccionistaJimmy()}
                </th>
                <th className="border border-neutral-300 px-2 py-1 text-right font-semibold">
                  Viajes {etiquetaAccionistaMauricio()}
                </th>
              </>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {seccion.filas.map((fila) => (
            <FilaTablaSitio
              key={`${seccion.frente}-${fila.fecha}`}
              fila={fila}
              mostrarViajes={mostrarViajes}
            />
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[10px] text-neutral-600">
        Totales: {seccion.totales.diasConMaquinaria} día(s) con maquinaria
        {mostrarViajes ? (
          <>
            {" "}
            · {seccion.totales.viajesJimmy} viajes {etiquetaAccionistaJimmy()} ·{" "}
            {seccion.totales.viajesMauricio} viajes {etiquetaAccionistaMauricio()}
          </>
        ) : null}
      </p>
    </>
  )
}

function FilaTablaSitio({
  fila,
  mostrarViajes,
}: {
  fila: FilaReporteSitio
  mostrarViajes: boolean
}) {
  return (
    <tr className={fila.sinActividad ? "bg-neutral-50 text-neutral-500" : undefined}>
      <td className="border border-neutral-300 px-2 py-1 whitespace-nowrap">
        {formatearFechaReporteSitio(fila.fecha)}
      </td>
      <td className="border border-neutral-300 px-2 py-1 whitespace-nowrap">{fila.diaSemana}</td>
      <td className="border border-neutral-300 px-2 py-1">{etiquetaMaquinariaReporte(fila)}</td>
      {mostrarViajes ? (
        <>
          <td className="border border-neutral-300 px-2 py-1 text-right font-mono">
            {etiquetaViajesReporte(fila.viajesJimmy)}
          </td>
          <td className="border border-neutral-300 px-2 py-1 text-right font-mono">
            {etiquetaViajesReporte(fila.viajesMauricio)}
          </td>
        </>
      ) : null}
    </tr>
  )
}

export function MaquinariaDocumentoPorSitio({
  dias,
  rangoEtiqueta,
  generadoEn,
  etapaId = "",
}: MaquinariaDocumentoPorSitioProps) {
  const etapa = ETAPAS_MAQUINARIA[etapaId]
  const frentes = etapa.frentes ?? ["poza_honda", "pechiche", "las_penas"]
  const reporte = construirReportePorSitio(dias, frentes)
  const etapaLabel = etapaId ? etapa.label : undefined

  return (
    <div
      id="maquinaria-documento"
      className="maquinaria-documento-compacto mx-auto max-w-[210mm] bg-white px-6 py-8 text-neutral-950 shadow-sm ring-1 ring-neutral-200 print:mx-0 print:max-w-none print:px-0 print:py-0 print:shadow-none print:ring-0"
    >
      <MaquinariaDocumentoEncabezado
        subtitulo={
          etapaLabel
            ? `Reporte por sitio — ${etapaLabel}`
            : "Reporte por sitio — maquinaria y transporte"
        }
        rangoEtiqueta={rangoEtiqueta}
        generadoEn={generadoEn}
        etapaLabel={etapaLabel}
      />

      <section className="mb-4 print:mb-3">
        <h2 className="mb-2 border-b border-neutral-300 pb-0.5 text-sm font-bold text-neutral-950">
          Resumen del período
        </h2>
        <dl className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded border border-neutral-300 px-2 py-1.5">
            <dt className="text-[10px] text-neutral-600">Días con actividad</dt>
            <dd className="text-base font-semibold">{reporte.totalesGlobales.diasConActividad}</dd>
          </div>
          <div className="rounded border border-neutral-300 px-2 py-1.5">
            <dt className="text-[10px] text-neutral-600">
              Total viajes {etiquetaAccionistaJimmy()}
            </dt>
            <dd className="text-base font-semibold">{reporte.totalesGlobales.viajesJimmy}</dd>
          </div>
          <div className="rounded border border-neutral-300 px-2 py-1.5">
            <dt className="text-[10px] text-neutral-600">
              Total viajes {etiquetaAccionistaMauricio()}
            </dt>
            <dd className="text-base font-semibold">{reporte.totalesGlobales.viajesMauricio}</dd>
          </div>
        </dl>
        <p className="mt-2 text-[10px] text-neutral-600">
          La maquinaria registrada corresponde al equipo operado por {etiquetaAccionistaJimmy()}.
          Los viajes de material para vía se detallan por operador.
        </p>
      </section>

      {reporte.secciones.map((seccion) => (
        <section key={seccion.frente} className="mb-6 break-inside-avoid print:mb-4">
          <h2 className="mb-2 border-b border-neutral-400 pb-0.5 text-sm font-bold text-neutral-950">
            {seccion.label}
          </h2>
          <TablaSitio seccion={seccion} />
        </section>
      ))}

      <footer className="mt-4 border-t border-neutral-300 pt-2 text-center text-[10px] text-neutral-500 print:mt-3">
        <p>Registro operativo de maquinaria — JBS Consorcio</p>
        <p className="mt-0.5">Uso exclusivo para fiscalización interna. No sustituye firmas oficiales.</p>
      </footer>
    </div>
  )
}
