/**
 * Genera registros canal_abscisas (segmentos 20 m) desde canal_tramos.
 *
 *   npx tsx scripts/generate-canal-abscisas.ts --proyecto desasolve-canales
 *   npx tsx scripts/generate-canal-abscisas.ts --dry-run
 */

import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import { createClient } from "@supabase/supabase-js"

import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import type { CanalTramo, GeoJsonLineString } from "../src/data/tramos/types"
import { generarSegmentosAbscisaDesdeTramo } from "../src/lib/canal-abscisas-geometria"

function loadEnvFromDotenv() {
  const envPath = resolve(process.cwd(), ".env.local")
  if (!existsSync(envPath)) return
  const content = readFileSync(envPath, "utf8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
    if (value && !process.env[key]?.trim()) process.env[key] = value
  }
}

function normalizarTramo(row: Record<string, unknown>): CanalTramo {
  return {
    id: String(row.id),
    proyecto_id: String(row.proyecto_id),
    codigo: String(row.codigo),
    canal: String(row.canal),
    longitud_m: Number(row.longitud_m),
    geometria: row.geometria as GeoJsonLineString,
    origen_extremo:
      row.origen_extremo === "geometria_fin" || row.origen_extremo === "geometria_inicio"
        ? row.origen_extremo
        : null,
    estado: row.estado as CanalTramo["estado"],
    avance_pct: Number(row.avance_pct),
    metros_ejecutados: Number(row.metros_ejecutados),
    fecha_inicio: row.fecha_inicio != null ? String(row.fecha_inicio) : null,
    fecha_fin: row.fecha_fin != null ? String(row.fecha_fin) : null,
    semana_programada: row.semana_programada != null ? String(row.semana_programada) : null,
    maquinaria_asignada: row.maquinaria_asignada != null ? String(row.maquinaria_asignada) : null,
    observaciones: row.observaciones != null ? String(row.observaciones) : null,
  }
}

async function main() {
  loadEnvFromDotenv()
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const proyectoIdx = args.indexOf("--proyecto")
  const proyectoId =
    proyectoIdx >= 0 && args[proyectoIdx + 1]
      ? args[proyectoIdx + 1]!
      : PROYECTO_DESASOLVE_CANALES

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL y clave Supabase.")
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const { data: tramosRaw, error } = await supabase
    .from("canal_tramos")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("codigo")

  if (error) {
    console.error(error.message)
    process.exit(1)
  }

  const tramos = (tramosRaw ?? []).map((r) => normalizarTramo(r as Record<string, unknown>))
  const rows = tramos.flatMap((t) =>
    generarSegmentosAbscisaDesdeTramo(t).map((s) => ({
      proyecto_id: proyectoId,
      tramo_id: s.tramo_id,
      sector_nombre: s.sector_nombre,
      abscisa_inicio: s.abscisa_inicio,
      abscisa_fin: s.abscisa_fin,
      codigo_estacion: s.codigo_estacion,
      geom_geojson: s.geom_geojson,
      estado: "pendiente",
    }))
  )

  console.log(`Tramos: ${tramos.length} → segmentos abscisa: ${rows.length} (${proyectoId})`)

  if (dryRun) {
    console.log("Dry-run: no se escribió en Supabase.")
    if (rows[0]) console.log("Ejemplo:", rows[0].codigo_estacion, rows[0].sector_nombre)
    return
  }

  const chunkSize = 200
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error: upsertError } = await supabase.from("canal_abscisas").upsert(chunk, {
      onConflict: "proyecto_id,sector_nombre,abscisa_inicio,abscisa_fin",
      ignoreDuplicates: false,
    })
    if (upsertError) {
      console.error(upsertError.message)
      process.exit(1)
    }
    console.log(`Upsert ${Math.min(i + chunkSize, rows.length)} / ${rows.length}`)
  }

  console.log("Listo.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
