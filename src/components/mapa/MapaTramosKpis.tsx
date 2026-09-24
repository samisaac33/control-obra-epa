import { KpiCard } from "@/src/components/KpiCard"
import type { KpisTramos } from "@/src/lib/tramos-avance"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"

type MapaTramosKpisProps = {
  kpis: KpisTramos
  compact?: boolean
}

export function MapaTramosKpis({ kpis, compact }: MapaTramosKpisProps) {
  return (
    <div className={compact ? "grid gap-3 sm:grid-cols-3" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"}>
      <KpiCard
        label="Km totales"
        valor={formatearNumero(kpis.kmTotales, 2)}
        detalle={`${kpis.totalTramos} tramos en el proyecto`}
      />
      <KpiCard
        label="Km ejecutados"
        valor={formatearNumero(kpis.kmEjecutados, 2)}
        detalle="Minitramos GPS en estado terminado"
      />
      <KpiCard
        label="Avance global"
        valor={`${formatearNumero(kpis.avanceGlobalPct, 1)}%`}
        detalle="Calculado por longitud, no por conteo de tramos"
      />
      {!compact ? (
        <KpiCard
          label="En ejecución"
          valor={String(kpis.tramosPorEstado.en_ejecucion)}
          detalle={`Terminados: ${kpis.tramosPorEstado.terminado} · Pendientes: ${kpis.tramosPorEstado.pendiente}`}
        />
      ) : null}
    </div>
  )
}
