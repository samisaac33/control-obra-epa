import { InformeImagenComprimida } from "@/src/components/InformeImagenComprimida"
import { EstadoHitoBadge } from "@/src/components/EstadoHitoBadge"
import { etiquetaEstadoHito } from "@/src/data/estados-hito"
import type { EvidenciaGrupo } from "@/src/lib/evidencias-grupo"
import { formatearHoraCaptura } from "@/src/lib/libro-obra"

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
      <EstadoHitoBadge estadoHito={valor} className="informe-estado-hito px-2 py-0.5 text-xs" />
    </p>
  )
}

export function EvidenciaBloque({ grupo, indice }: { grupo: EvidenciaGrupo; indice: number }) {
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
          <CampoDocumento label="Coordenadas" value={`${representante.lat}, ${representante.lng}`} />
        ) : null}
      </div>

      {imagenes.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 print:grid-cols-2">
          {imagenes.map((imagen) => (
            <figure key={imagen.id} className="flex justify-center rounded border border-neutral-300 bg-white">
              {imagen.image_url ? (
                <InformeImagenComprimida
                  src={imagen.image_url}
                  alt={representante.actividad_especifica ?? representante.sector}
                />
              ) : (
                <div className="flex min-h-[120px] w-full items-center justify-center bg-neutral-100 text-xs text-neutral-500">
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
