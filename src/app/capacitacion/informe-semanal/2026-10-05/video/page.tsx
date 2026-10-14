import Link from "next/link"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"
import { rutaObra } from "@/src/lib/rutas-proyecto"

export const dynamic = "force-static"

const VIDEO_SRC = "/capacitacion/informe-semanal-desasolve-2026-10-05.mp4"

export default function InformeSemanal20261005VideoPage() {
  return (
    <div className="min-h-dvh bg-[oklch(0.98_0.002_264)] p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Informe semanal · Desasolve canales (5–11 oct 2026)
            </CardTitle>
            <CardDescription>
              Resumen ejecutivo en video 16:9 (~57 s): jornadas de maquinaria, metros de la semana y
              avance global del mapa al cierre del periodo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <video
              className="aspect-video w-full rounded-lg border border-foreground/10 bg-black shadow-sm"
              controls
              preload="metadata"
              playsInline
              src={VIDEO_SRC}
            />
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={VIDEO_SRC} download>
                  <Download className="size-4" aria-hidden />
                  Descargar MP4
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href={rutaObra(PROYECTO_DESASOLVE_CANALES, "mapa")}>Mapa de avance</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={rutaObra(PROYECTO_DESASOLVE_CANALES, "maquinaria")}>
                  Maquinaria y jornadas
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
