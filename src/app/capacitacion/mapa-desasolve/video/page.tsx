import Link from "next/link"
import { Download, Map } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"
import { rutaObra } from "@/src/lib/rutas-proyecto"

export const dynamic = "force-static"

const VIDEO_SRC = "/capacitacion/mapa-desasolve.mp4"
const VIDEO_DOWNLOAD = "/capacitacion/mapa-desasolve.mp4"

export default function CapacitacionMapaDesasolveVideoPage() {
  const mapaProduccion = rutaObra(PROYECTO_DESASOLVE_CANALES, "mapa")

  return (
    <div className="min-h-dvh bg-[oklch(0.98_0.002_264)] p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Video: interpretación del mapa Desasolve
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Capacitación para técnicos contratistas (vista visitante): KPIs, primer levantamiento
              topográfico versus red operativa, minitramos con etiquetas en metros y frente de
              maquinaria. Duración aproximada 2 min 34 s (v4).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <video
              className="aspect-video w-full rounded-lg border border-foreground/10 bg-black shadow-sm"
              controls
              preload="metadata"
              playsInline
              src={VIDEO_SRC}
            >
              <track kind="captions" />
              Su navegador no reproduce video HTML5. Use el enlace de descarga.
            </video>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="default">
                <a href={VIDEO_DOWNLOAD} download>
                  <Download className="size-4" aria-hidden />
                  Descargar MP4
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/capacitacion/mapa-desasolve">Demo interactiva del mapa</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={mapaProduccion}>
                  <Map className="size-4" aria-hidden />
                  Mapa en producción
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              El mapa en producción requiere ingreso visitante (PIN) cuando está configurado en la
              obra. Esta página y el video son públicos bajo{" "}
              <code className="rounded bg-muted px-1">/capacitacion/</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
