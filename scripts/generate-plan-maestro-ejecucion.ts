/**
 * Genera docs/plan-maestro-ejecucion-desasolve-2026.md
 * npx tsx scripts/generate-plan-maestro-ejecucion.ts
 */
import fs from "node:fs"
import path from "node:path"

import { valoresPorDefectoPlanilla } from "../src/data/planilla/planilla-defaults-ejecucion"
import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import type { ProyectoPlanillaConfig } from "../src/data/planilla/types"
import { lineasMarkdownPlanMaestro } from "../src/lib/plan-maestro-ejecucion-markdown"

function main() {
  const defs = valoresPorDefectoPlanilla(PROYECTO_DESASOLVE_CANALES)
  if (!defs) throw new Error("Sin defaults planilla")
  const config: ProyectoPlanillaConfig = {
    ...defs,
    proyecto_id: PROYECTO_DESASOLVE_CANALES,
    registrado_por: null,
    created_at: "",
    updated_at: "",
  }

  const lines = lineasMarkdownPlanMaestro(config)
  lines.push("---")
  lines.push("")
  lines.push(
    "*Regenerar: npx tsx scripts/generate-plan-maestro-ejecucion.ts · Fuente: src/data/planilla/plan-maestro-ejecucion-desasolve.ts*"
  )
  lines.push("")

  const out = path.join(process.cwd(), "docs/plan-maestro-ejecucion-desasolve-2026.md")
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, lines.join("\n"), "utf8")
  console.log("Wrote", out, "lines", lines.length)
}

main()
