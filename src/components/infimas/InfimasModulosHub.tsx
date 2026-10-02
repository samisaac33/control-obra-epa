import { ArrowRight, FileArchive } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MODULOS_INFIMAS_HUB } from "@/src/data/infimas/modulos-hub"

export function InfimasModulosHub() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {MODULOS_INFIMAS_HUB.map((modulo) => (
        <Link key={modulo.id} href={modulo.href} className="group block h-full">
          <Card className="h-full transition-colors hover:border-foreground/20 hover:bg-muted/30">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80">
                  <FileArchive className="size-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">{modulo.badge}</p>
                  <CardTitle className="mt-1 text-base leading-snug">{modulo.titulo}</CardTitle>
                  <CardDescription className="mt-1">{modulo.subtitulo}</CardDescription>
                </div>
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                  aria-hidden
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-primary">Ingresar al módulo</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
