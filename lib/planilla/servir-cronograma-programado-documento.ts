import { readFileSync } from "node:fs"
import path from "node:path"

import {
  CRONOGRAMA_PROGRAMADO_PDF_MIME,
  CRONOGRAMA_PROGRAMADO_PDF_PUBLIC_PATH,
  nombreArchivoCronogramaProgramadoPdf,
} from "@/src/data/planilla/cronograma-programado-documento"

export function leerCronogramaProgramadoPdfArchivo(): Buffer {
  const rel = CRONOGRAMA_PROGRAMADO_PDF_PUBLIC_PATH.replace(/^\//, "")
  const filePath = path.join(process.cwd(), "public", rel)
  return readFileSync(filePath)
}

export function respuestaCronogramaProgramadoPdfDocumento(): Response {
  try {
    const buffer = leerCronogramaProgramadoPdfArchivo()
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": CRONOGRAMA_PROGRAMADO_PDF_MIME,
        "Content-Disposition": `inline; filename="${nombreArchivoCronogramaProgramadoPdf()}"`,
      },
    })
  } catch {
    return new Response("Cronograma valorado programado no disponible.", { status: 404 })
  }
}
