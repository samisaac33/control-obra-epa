import Image from "next/image"

import {
  CONSORCIO_CONTRATISTA_RAZON,
  LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH,
  LOGO_EPA_PUBLIC_PATH,
} from "@/src/data/brand/logos-proyecto"

/** EPA + título + consorcio (formato planilla EPA). */
export function LibroObraEpaBarraLogos() {
  return (
    <div className="flex items-start justify-between gap-1 border-b border-neutral-900 pb-0.5 print:pb-0">
      <Image
        src={LOGO_EPA_PUBLIC_PATH}
        alt="Empresa Pública del Agua"
        width={118}
        height={40}
        className="h-8 w-auto object-contain print:h-7"
        priority
      />
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1">
        <h2 className="text-center text-sm font-bold uppercase tracking-wide text-neutral-950 print:text-[11px]">
          Libro de obra
        </h2>
      </div>
      <Image
        src={LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH}
        alt={CONSORCIO_CONTRATISTA_RAZON}
        width={88}
        height={48}
        className="h-9 w-auto object-contain print:h-8"
        priority
      />
    </div>
  )
}
