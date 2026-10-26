import { readFileSync } from "node:fs"
import path from "node:path"

import {
  LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH,
  LOGO_EPA_PUBLIC_PATH,
} from "@/src/data/brand/logos-proyecto"

export type LogosCronogramaEpaPdf = {
  epa: string
  consorcio: string
}

function logoComoDataUrl(publicPath: string): string {
  const filePath = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""))
  const data = readFileSync(filePath)
  return `data:image/jpeg;base64,${data.toString("base64")}`
}

export function cargarLogosCronogramaEpaPdf(): LogosCronogramaEpaPdf {
  return {
    epa: logoComoDataUrl(LOGO_EPA_PUBLIC_PATH),
    consorcio: logoComoDataUrl(LOGO_CONSORCIO_STH_MANABI_PUBLIC_PATH),
  }
}
