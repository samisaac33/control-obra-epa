/**
 * Importa escombreras (botaderos) desde KML/KMZ con polígonos → Supabase (proyecto_botaderos).
 *
 * Flujo recomendado:
 *   1. En Google Earth Pro dibuje un polígono por escombrera y nombre el placemark (ej. "Escombrera Norte").
 *   2. Exporte la carpeta como KML o KMZ.
 *   3. Guarde el archivo en data/kmz/ (p. ej. data/kmz/escombreras.kml).
 *   4. Ejecute:
 *        npm run import:escombreras -- data/kmz/escombreras.kml
 *        npm run import:escombreras:dry-run -- data/kmz/escombreras.kml
 *        npm run import:escombreras:sql -- data/kmz/escombreras.kml
 *
 * Requiere migración 20251030_proyecto_botaderos_poligono.sql aplicada en Supabase.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"

import { kml } from "@tmcw/togeojson"
import { DOMParser } from "@xmldom/xmldom"
import JSZip from "jszip"
import { createClient } from "@supabase/supabase-js"

import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import type { GeoJsonPolygon } from "../src/data/tramos/types"
import { areaPoligonoM2, centroidePoligono } from "../src/lib/geojson-poligono"

const KMZ_DEFAULT = resolve(process.cwd(), "data/kmz/escombreras.kml")

const PROPERTY_ALIASES = {
  nombre: ["nombre", "Nombre", "NOMBRE", "Name", "name", "title"],
}

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
    const actual = process.env[key]?.trim()
    if (value && !actual) process.env[key] = value
  }
}

function pickProperty(props: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const v = props[key]
    if (v != null && String(v).trim()) return String(v).trim()
  }
  return undefined
}

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''")
}

function normalizarNombre(raw: string, index: number): string {
  const trimmed = raw.trim()
  if (trimmed) return trimmed
  return `Escombrera ${index + 1}`
}

async function readGeospatialFileAsKml(filePath: string): Promise<string> {
  if (filePath.toLowerCase().endsWith(".kml")) {
    return readFileSync(filePath, "utf8")
  }
  const buffer = readFileSync(filePath)
  const zip = await JSZip.loadAsync(buffer)
  const kmlEntry =
    Object.keys(zip.files).find((name) => name.toLowerCase().endsWith(".kml")) ??
    Object.keys(zip.files)[0]
  if (!kmlEntry) {
    throw new Error("El KMZ no contiene archivos KML.")
  }
  return zip.file(kmlEntry)!.async("string")
}

function polygonDesdeFeature(geometry: { type?: string; coordinates?: unknown } | null | undefined): GeoJsonPolygon | null {
  if (!geometry) return null
  if (geometry.type === "Polygon") {
    return geometry as GeoJsonPolygon
  }
  if (geometry.type === "MultiPolygon") {
    const polys = geometry.coordinates as [number, number][][][]
    const largest = polys.reduce(
      (best, ring) => (ring[0]?.length ?? 0) > (best[0]?.length ?? 0) ? ring : best,
      polys[0] ?? []
    )
    if (!largest.length) return null
    return { type: "Polygon", coordinates: largest }
  }
  return null
}

type RowEscombrera = {
  proyecto_id: string
  nombre: string
  lat: number
  lng: number
  geom_geojson: GeoJsonPolygon
  area_m2: number
  activo: boolean
}

function rowsToSql(rows: RowEscombrera[]): string {
  const statements = rows.map((row) => {
    const geom = JSON.stringify(row.geom_geojson)
    const pid = escapeSqlString(row.proyecto_id)
    const nom = escapeSqlString(row.nombre)
    return `-- ${row.nombre}
update public.proyecto_botaderos
set
  lat = ${row.lat},
  lng = ${row.lng},
  geom_geojson = '${escapeSqlString(geom)}'::jsonb,
  area_m2 = ${row.area_m2},
  activo = ${row.activo},
  updated_at = now()
where proyecto_id = '${pid}' and lower(nombre) = lower('${nom}');

insert into public.proyecto_botaderos (proyecto_id, nombre, lat, lng, geom_geojson, area_m2, activo)
select '${pid}', '${nom}', ${row.lat}, ${row.lng}, '${escapeSqlString(geom)}'::jsonb, ${row.area_m2}, ${row.activo}
where not exists (
  select 1 from public.proyecto_botaderos b
  where b.proyecto_id = '${pid}' and lower(b.nombre) = lower('${nom}')
);`
  })

  return `-- Escombreras importadas desde KML — ejecutar en Supabase SQL Editor
-- Requiere migración 20251030_proyecto_botaderos_poligono.sql.

${statements.join("\n\n")}
`
}

function parseArgs(argv: string[]): { filePath: string; dryRun: boolean; sqlOut?: string } {
  const dryRun = argv.includes("--dry-run")
  const sqlOutIndex = argv.indexOf("--sql-out")
  const sqlOut = sqlOutIndex >= 0 ? argv[sqlOutIndex + 1] : undefined
  const pathArg = argv.slice(2).find((arg, index, args) => {
    if (arg === "--dry-run" || arg === "--sql-out") return false
    if (index > 0 && args[index - 1] === "--sql-out") return false
    if (arg.startsWith("-")) return false
    const lower = arg.toLowerCase()
    return lower.endsWith(".kmz") || lower.endsWith(".kml")
  })
  return {
    filePath: resolve(process.cwd(), pathArg ?? KMZ_DEFAULT),
    dryRun,
    sqlOut: sqlOut ? resolve(process.cwd(), sqlOut) : undefined,
  }
}

async function upsertEscombrera(
  supabase: ReturnType<typeof createClient>,
  row: RowEscombrera
): Promise<void> {
  const { data: existente, error: selErr } = await supabase
    .from("proyecto_botaderos")
    .select("id")
    .eq("proyecto_id", row.proyecto_id)
    .ilike("nombre", row.nombre)
    .maybeSingle()
  if (selErr) throw new Error(selErr.message)

  if (existente?.id) {
    const { error } = await supabase
      .from("proyecto_botaderos")
      .update({
        lat: row.lat,
        lng: row.lng,
        geom_geojson: row.geom_geojson,
        area_m2: row.area_m2,
        activo: row.activo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existente.id)
    if (error) throw new Error(error.message)
    return
  }

  const { error } = await supabase.from("proyecto_botaderos").insert(row)
  if (error) throw new Error(error.message)
}

async function main() {
  loadEnvFromDotenv()
  const { filePath, dryRun, sqlOut } = parseArgs(process.argv)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim()

  if (!dryRun && !sqlOut && (!supabaseUrl || !serviceKey)) {
    throw new Error(
      "Configure NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o ANON_KEY) en .env.local"
    )
  }

  if (!existsSync(filePath)) {
    throw new Error(
      `No se encontró ${filePath}. Exporte polígonos desde Google Earth a data/kmz/escombreras.kml`
    )
  }

  const kmlText = await readGeospatialFileAsKml(filePath)
  const dom = new DOMParser().parseFromString(kmlText, "text/xml")
  const geojson = kml(dom)

  const polygonFeatures = geojson.features.filter((feature) => {
    const t = feature.geometry?.type
    return t === "Polygon" || t === "MultiPolygon"
  })

  if (polygonFeatures.length === 0) {
    throw new Error("El archivo no contiene geometrías Polygon (dibuje polígonos en Google Earth).")
  }

  const rows: RowEscombrera[] = []

  for (const [index, feature] of polygonFeatures.entries()) {
    const props = (feature.properties ?? {}) as Record<string, unknown>
    const nombreRaw =
      pickProperty(props, PROPERTY_ALIASES.nombre) ??
      pickProperty(props, ["description", "Description"]) ??
      ""
    const nombre = normalizarNombre(nombreRaw, index)
    const geom = polygonDesdeFeature(feature.geometry)
    if (!geom || geom.coordinates[0]?.length < 4) continue

    const { lat, lng } = centroidePoligono(geom)
    const area_m2 = Math.round(areaPoligonoM2(geom) * 100) / 100

    rows.push({
      proyecto_id: PROYECTO_DESASOLVE_CANALES,
      nombre,
      lat: Math.round(lat * 1e6) / 1e6,
      lng: Math.round(lng * 1e6) / 1e6,
      geom_geojson: geom,
      area_m2,
      activo: true,
    })
  }

  if (rows.length === 0) {
    throw new Error("Ningún polígono válido (mínimo 3 vértices).")
  }

  if (sqlOut) {
    mkdirSync(dirname(sqlOut), { recursive: true })
    writeFileSync(sqlOut, rowsToSql(rows), "utf8")
    console.log(`SQL generado: ${sqlOut}`)
  }

  if (dryRun) {
    console.log(`[dry-run] ${rows.length} escombrera(s) desde ${filePath}`)
  } else if (!sqlOut) {
    console.log(`Importando ${rows.length} escombrera(s) desde ${filePath}...`)
    const supabase = createClient(supabaseUrl!, serviceKey!)
    for (const row of rows) {
      await upsertEscombrera(supabase, row)
    }
  } else {
    console.log("Modo --sql-out: no se ejecutó upsert remoto.")
  }

  console.log(`Listo: ${rows.length} escombrera(s).`)
  for (const row of rows) {
    console.log(
      `  - ${row.nombre}: centro (${row.lat.toFixed(5)}, ${row.lng.toFixed(5)}), ~${row.area_m2.toLocaleString("es-EC")} m²`
    )
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
