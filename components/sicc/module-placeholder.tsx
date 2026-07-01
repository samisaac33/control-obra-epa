import { Construction } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EstadoModuloBadge } from "@/components/sicc/estado-modulo-badge"
import type { ModuloSicc } from "@/lib/sicc/types"

export function ModulePlaceholder({ modulo }: { modulo: ModuloSicc }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <EstadoModuloBadge estado={modulo.estado} />
            <span className="text-xs text-muted-foreground">Fase {modulo.fase}</span>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {modulo.titulo}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{modulo.descripcion}</p>
        </div>
      </div>

      <Card className="border-dashed border-foreground/20 bg-muted/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-foreground/10 bg-background">
              <Construction className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Módulo en construcción</CardTitle>
              <CardDescription>
                Este módulo forma parte del roadmap del SICC y se habilitará en fases
                posteriores.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="text-sm font-medium">Funcionalidades planificadas</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {modulo.funcionalidades.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-foreground/10 bg-background/80 px-3 py-2 text-sm text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
