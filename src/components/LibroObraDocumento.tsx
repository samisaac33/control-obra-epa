import { InformeImagenComprimida } from "@/src/components/InformeImagenComprimida"
import { EstadoHitoBadge } from "@/src/components/EstadoHitoBadge"
import { ESTADOS_HITO, etiquetaEstadoHito } from "@/src/data/estados-hito"
import { PROYECTO } from "@/src/data/proyecto"
import {
  formatearFechaLibroObra,
  formatearHoraCaptura,
  type LibroObraEntradaDia,
} from "@/src/lib/libro-obra"
import type { EvidenciaGrupo } from "@/src/lib/evidencias-grupo"

type LibroObraDocumentoProps = {
  entradas: LibroObraEntradaDia[]
  generadoEn: string
  rangoEtiqueta: string
}

function CampoDocumento({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null

  return (
    <p className="text-[13px] leading-snug text-neutral-800">
      <span className="font-semibold text-neutral-950">{label}: </span>
      {value}
    </p>
  )
}

function CampoEstadoHito({ valor }: { valor?: string | null }) {
  const label = etiquetaEstadoHito(valor)
  if (!label) return null

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-snug text-neutral-800">
      <span className="font-semibold text-neutral-950">Estado del hito: </span>
      <EstadoHitoBadge
        estadoHito={valor}
        className="informe-estado-hito px-2 py-0.5 text-xs"
      />
    </p>
  )
}

function EvidenciaBloque({ grupo, indice }: { grupo: EvidenciaGrupo; indice: number }) {
  const { representante, imagenes } = grupo

  return (
    <article className="rounded-lg border border-neutral-300 bg-neutral-50 p-3 print:break-inside-avoid">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-200 pb-2">
        <h4 className="text-sm font-semibold text-neutral-950">
          Evidencia {indice + 1} — {representante.sector}
        </h4>
        <time className="text-xs text-neutral-600" dateTime={representante.fecha_captura}>
          {formatearHoraCaptura(representante.fecha_captura)}
        </time>
      </div>

      <div className="space-y-1">
        <CampoEstadoHito valor={representante.estado_hito} />
        <CampoDocumento label="Número de rubro" value={representante.numero_rubro} />
        <CampoDocumento label="Ubicación" value={representante.ubicacion_abscisa} />
        <CampoDocumento label="Actividad específica" value={representante.actividad_especifica} />
        <CampoDocumento label="Maquinaria utilizada" value={representante.maquinaria_utilizada} />
        <CampoDocumento label="Observación" value={representante.descripcion} />
        <CampoDocumento label="Observación técnica" value={representante.observacion_tecnica} />
        {representante.lat != null && representante.lng != null ? (
          <CampoDocumento
            label="Coordenadas"
            value={`${representante.lat}, ${representante.lng}`}
          />
        ) : null}
      </div>

      {imagenes.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 print:grid-cols-2">
          {imagenes.map((imagen) => (
            <figure key={imagen.id} className="overflow-hidden rounded border border-neutral-300 bg-white">
              {imagen.image_url ? (
                <InformeImagenComprimida
                  src={imagen.image_url}
                  alt={representante.actividad_especifica ?? representante.sector}
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100 text-xs text-neutral-500">
                  Imagen no disponible
                </div>
              )}
            </figure>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function EntradaDia({ entrada, numero }: { entrada: LibroObraEntradaDia; numero: number }) {
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
        {entrada.evidencias.map((grupo, index) => (
          <EvidenciaBloque key={grupo.grupoId} grupo={grupo} indice={index} />
        ))}
      </div>
    </section>
  )
}

export function LibroObraDocumento({ entradas, generadoEn, rangoEtiqueta }: LibroObraDocumentoProps) {
  const fechaGeneracion = new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(generadoEn))

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
          {PROYECTO.nombreObra}
        </h1>
        <p className="mt-2 text-sm text-neutral-700">{PROYECTO.objeto}</p>
        <dl className="mt-4 grid gap-1 text-sm text-neutral-800 sm:grid-cols-2 sm:gap-x-6 sm:text-left">
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
          <EntradaDia key={entrada.fecha} entrada={entrada} numero={index + 1} />
        ))
      )}

      <footer className="mt-8 border-t border-neutral-300 pt-4 text-center text-xs text-neutral-500 print:mt-6">
        <p>
          Consolidado automático a partir del registro fotográfico — JBS Consorcio
        </p>
        <p className="mt-1">Uso exclusivo para fiscalización interna. No sustituye firmas oficiales.</p>
      </footer>
    </div>
  )
}
