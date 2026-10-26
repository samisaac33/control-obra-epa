import { readFileSync } from "node:fs"
import path from "node:path"

import {
  CRONOGRAMA_EJECUTADO_VIGENTE_MIME,
  CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH,
  nombreArchivoCronogramaEjecutadoVigente,
} from "@/src/data/planilla/cronograma-ejecutado-documento"

export function leerCronogramaEjecutadoVigenteArchivo(): Buffer {
  const rel = CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH.replace(/^\//, "")
  const filePath = path.join(process.cwd(), "public", rel)
  return readFileSync(filePath)
}

export function respuestaCronogramaEjecutadoVigenteDocumento(): Response {
  try {
    const buffer = leerCronogramaEjecutadoVigenteArchivo()
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": CRONOGRAMA_EJECUTADO_VIGENTE_MIME,
        "Content-Disposition": `attachment; filename="${nombreArchivoCronogramaEjecutadoVigente()}"`,
      },
    })
  } catch {
    return new Response("Cronograma ejecutado no disponible en el servidor.", { status: 404 })
  }
}
