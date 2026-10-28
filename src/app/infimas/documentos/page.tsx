import type { Metadata } from "next"
import { FileArchive } from "lucide-react"

import { InfimasDocumentosSection } from "@/src/components/infimas/InfimasDocumentosSection"
import { InfimasHubNav } from "@/src/components/infimas/InfimasHubNav"
import { DOCUMENTOS_PERSONALES_INFIMAS } from "@/src/data/infimas/documentos"

export const metadata: Metadata = {
  title: "Ínfimas — Documentos",
  robots: { index: false, follow: false },
}

export default function InfimasDocumentosPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
              <FileArchive className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Ínfimas Cuantía
              </h1>
              <p className="text-sm text-muted-foreground">
                Documentos personales y archivos de apoyo
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <InfimasHubNav />
        <InfimasDocumentosSection documentos={DOCUMENTOS_PERSONALES_INFIMAS} />
      </main>
    </div>
  )
}
