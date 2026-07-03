import { ObservacionTecnicaCampo } from "@/src/components/ObservacionTecnicaCampo"
import { EstadoHitoBadge } from "@/src/components/EstadoHitoBadge"

type RegistroFotoDetalleProps = {
  sector: string
  fechaCaptura: string
  lat?: number | null
  lng?: number | null
  descripcion?: string | null
  numeroRubro?: string | null
  ubicacionAbscisa?: string | null
  actividadEspecifica?: string | null
  maquinariaUtilizada?: string | null
  estadoHito?: string | null
  observacionTecnica?: string | null
  showMapLink?: boolean
}

function CampoOpcional({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null
  return (
    <p className="text-sm">
      <span className="font-medium text-foreground">{label}: </span>
      <span className="text-muted-foreground">{value}</span>
    </p>
  )
}

export function RegistroFotoDetalle({
  sector,
  fechaCaptura,
  lat,
  lng,
  descripcion,
  numeroRubro,
  ubicacionAbscisa,
  actividadEspecifica,
  maquinariaUtilizada,
  estadoHito,
  observacionTecnica,
  showMapLink = true,
}: RegistroFotoDetalleProps) {
  const tieneCoordenadas = lat != null && lng != null
  const mapsUrl = tieneCoordenadas ? `https://www.google.com/maps?q=${lat},${lng}` : null

  return (
    <div className="space-y-1.5 text-sm">
      <div className="space-y-2">
        <p className="font-medium leading-snug text-foreground">{sector}</p>
        {estadoHito?.trim() ? <EstadoHitoBadge estadoHito={estadoHito} /> : null}
      </div>
      <p className="text-muted-foreground">
        {new Date(fechaCaptura).toLocaleString("es-EC", {
          timeZone: "America/Guayaquil",
        })}
      </p>
      {tieneCoordenadas ? (
        <p className="text-xs text-muted-foreground">
          {lat}, {lng}
        </p>
      ) : null}
      {numeroRubro?.trim() ? (
        <p className="text-sm">
          <span className="font-medium text-foreground">Número de rubro: </span>
          <span className="text-muted-foreground">{numeroRubro}</span>
        </p>
      ) : null}
      <CampoOpcional label="Ubicación" value={ubicacionAbscisa} />
      <CampoOpcional label="Actividad específica" value={actividadEspecifica} />
      <CampoOpcional label="Maquinaria utilizada" value={maquinariaUtilizada} />
      <CampoOpcional label="Observación" value={descripcion} />
      <ObservacionTecnicaCampo value={observacionTecnica} />
      {showMapLink && mapsUrl ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-xs font-medium text-primary hover:underline"
        >
          Ver en mapa
        </a>
      ) : null}
    </div>
  )
}
