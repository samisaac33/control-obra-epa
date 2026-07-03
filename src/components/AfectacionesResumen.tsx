import type { Afectacion } from "@/src/data/informe-afectacion"

type AfectacionesResumenProps = {
  afectaciones: Afectacion[]
  variant?: "resumen" | "detalle"
}

export function AfectacionesResumen({ afectaciones, variant = "resumen" }: AfectacionesResumenProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {afectaciones.map((item) => (
        <article
          key={item.id}
          className="rounded-xl border border-foreground/10 bg-card p-4 shadow-sm ring-1 ring-foreground/5"
        >
          <h3 className="text-sm font-semibold text-foreground">{item.titulo}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {variant === "detalle" ? item.detalle : item.resumen}
          </p>
        </article>
      ))}
    </div>
  )
}
