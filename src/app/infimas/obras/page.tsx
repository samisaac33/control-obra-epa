import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, FileArchive } from "lucide-react"

import { InfimasDocumentoLista } from "@/src/components/infimas/InfimasDocumentoLista"
import { DOCUMENTOS_INFIMAS } from "@/src/data/infimas/catalog"

export const metadata: Metadata = {
  title: "Ínfimas — Obras",
  robots: { index: false, follow: false },
}

export default function InfimasObrasPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/infimas"
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Ínfimas Cuantía
          </Link>
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
              <FileArchive className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Informes de ínfima cuantía (obras)
              </h1>
              <p className="text-sm text-muted-foreground">
                Informes técnicos puntuales y documentos asociados a órdenes de compra
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <InfimasDocumentoLista documentos={DOCUMENTOS_INFIMAS} />
      </main>
    </div>
  )
}
