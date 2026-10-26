"use client"

import { Smartphone } from "lucide-react"

import { useEsDispositivoApple } from "@/src/hooks/useEsDispositivoApple"

export function LibroObraAyudaGuardarPdf() {
  const esApple = useEsDispositivoApple()

  return (
    <details
      className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950 print:hidden"
      aria-label="Cómo guardar PDF sin URL en el pie"
    >
      <summary className="flex cursor-pointer list-none items-center gap-1.5 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
        <Smartphone className="size-3.5 shrink-0" aria-hidden />
        Guardar PDF sin URL ni fecha en el pie
      </summary>
      <div className="mt-2 border-t border-amber-200/60 pt-2">
      {esApple ? (
        <ol className="mt-2 list-decimal space-y-1.5 pl-4">
          <li>
            Pulsa <span className="font-medium">Imprimir / Guardar PDF</span> (se abre la vista previa
            de impresión de Safari).
          </li>
          <li>
            Toca <span className="font-medium">Opciones</span> arriba a la derecha (o el ícono de
            ajustes en la hoja de impresión).
          </li>
          <li>
            Desactiva <span className="font-medium">Encabezados y pies de página</span> (así desaparecen
            la URL <code className="rounded bg-amber-100/80 px-0.5">obra-epa.vercel.app</code> y la
            fecha/hora del margen).
          </li>
          <li>
            Usa <span className="font-medium">Compartir</span> →{" "}
            <span className="font-medium">Guardar en Archivos</span> o imprimir a PDF.
          </li>
        </ol>
      ) : (
        <ol className="mt-2 list-decimal space-y-1.5 pl-4">
          <li>
            Pulsa <span className="font-medium">Imprimir / Guardar PDF</span> y abre{" "}
            <span className="font-medium">Más ajustes</span> o <span className="font-medium">Opciones</span>.
          </li>
          <li>
            Desmarca <span className="font-medium">Encabezados y pies de página</span> /{" "}
            <span className="font-medium">Headers and footers</span>.
          </li>
          <li>
            Elige destino <span className="font-medium">Guardar como PDF</span> o imprimir.
          </li>
        </ol>
      )}
      <p className="mt-2 text-[11px] text-amber-900/85">
        El navegador añade URL y fecha solo si esa opción sigue activa; la app no puede quitarlas por
        código en iPhone.
      </p>
      </div>
    </details>
  )
}
