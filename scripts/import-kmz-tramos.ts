/**
 * Importa tramos de canal desde KMZ → Supabase (canal_tramos).
 *
 * Uso:
 *   npm run import:kmz
 *   npm run import:kmz -- data/kmz/mi-archivo.kmz
 *   npm run import:kmz -- data/kmz/mi-archivo.kml
 *
 * Requiere en .env.local (o variables de entorno):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (recomendado para upsert sin RLS)
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"

import { kml } from "@tmcw/togeojson"
import { DOMParser } from "@xmldom/xmldom"
import JSZip from "jszip"
import { createClient } from "@supabase/supabase-js"

import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import { longitudDesdeGeometria } from "../src/lib/tramos-avance"
import type { GeoJsonLineString } from "../src/data/tramos/types"

const KMZ_DEFAULT = resolve(process.cwd(), "data/kmz/desasolve-canales.kmz")
const CANAL_DEFAULT = "Puntos levantados"

/** Ajuste de nombres de propiedades del KML del topógrafo. */
const PROPERTY_ALIASES = {
  codigo: ["codigo", "Código", "CODIGO", "code", "Name", "name", "id", "ID"],
  canal: ["canal", "Canal", "CANAL", "nombre_canal", "layer"],
  longitud_m: ["longitud_m", "longitud", "Longitud", "LONGITUD", "length", "LENGTH", "metros"],
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

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''")
}

function rowsToSql(rows: Record<string, unknown>[]): string {
  const inserts = rows.map((row) => {
    const geometria = JSON.stringify(row.geometria)
    return `  (
    '${escapeSqlString(String(row.proyecto_id))}',
    '${escapeSqlString(String(row.codigo))}',
    '${escapeSqlString(String(row.canal))}',
    ${Number(row.longitud_m)},
    '${escapeSqlString(geometria)}'::jsonb,
    '${row.estado}',
    ${Number(row.avance_pct)},
    ${Number(row.metros_ejecutados)}
  )`
  })

  return `-- Seed generado desde KMZ — ejecutar en Supabase SQL Editor
-- Requiere migración 20250917_proyectos_multi_obra.sql aplicada previamente.

insert into public.canal_tramos (
  proyecto_id, codigo, canal, longitud_m, geometria, estado, avance_pct, metros_ejecutados
)
values
${inserts.join(",\n")}
on conflict (proyecto_id, codigo) do update set
  canal = excluded.canal,
  longitud_m = excluded.longitud_m,
  geometria = excluded.geometria,
  updated_at = now();
`
}

function pickProperty(props: Record<string, unknown>, aliases: string[]): string | undefined {
  for (const key of aliases) {
    const value = props[key]
    if (value != null && String(value).trim()) return String(value).trim()
  }
  for (const [key, value] of Object.entries(props)) {
    if (aliases.some((alias) => alias.toLowerCase() === key.toLowerCase()) && value != null) {
      return String(value).trim()
    }
  }
  return undefined
}

function pickNumber(props: Record<string, unknown>, aliases: string[]): number | undefined {
  const raw = pickProperty(props, aliases)
  if (!raw) return undefined
  const num = Number(String(raw).replace(",", "."))
  return Number.isFinite(num) ? num : undefined
}

/** Normaliza el `<name>` del KML a código de tramo (corrige typos del topógrafo). */
function normalizarCodigoTramo(raw: string): string {
  let codigo = raw.trim().replace(/\s+/g, " ")
  if (/^tremo\s+/i.test(codigo)) {
    codigo = codigo.replace(/^tremo\s+/i, "tramo ")
  }
  if (/^tramo\s+/i.test(codigo)) {
    codigo = codigo.replace(/^tramo\s+/i, "tramo ")
  }
  return codigo
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
      `No se encontró el archivo en ${filePath}. Coloque el KMZ/KML en data/kmz/ (p. ej. desasolve-canales.kmz).`
    )
  }

  const kmlText = await readGeospatialFileAsKml(filePath)
  const dom = new DOMParser().parseFromString(kmlText, "text/xml")
  const geojson = kml(dom)

  const lineFeatures = geojson.features.filter(
    (feature) => feature.geometry?.type === "LineString" || feature.geometry?.type === "MultiLineString"
  )

  if (lineFeatures.length === 0) {
    throw new Error("El archivo no contiene geometrías LineString.")
  }

  const rows: Record<string, unknown>[] = []

  for (const [index, feature] of lineFeatures.entries()) {
    const props = (feature.properties ?? {}) as Record<string, unknown>
    const codigoRaw =
      pickProperty(props, PROPERTY_ALIASES.codigo) ??
      pickProperty(props, ["Name", "name"]) ??
      `TR-${String(index + 1).padStart(3, "0")}`
    const codigo = normalizarCodigoTramo(codigoRaw)
    const canal = pickProperty(props, PROPERTY_ALIASES.canal) ?? CANAL_DEFAULT

    let geometria: GeoJsonLineString | null = null

    if (feature.geometry?.type === "LineString") {
      geometria = feature.geometry as GeoJsonLineString
    } else if (feature.geometry?.type === "MultiLineString") {
      const lines = feature.geometry.coordinates as [number, number][][]
      const longest = lines.reduce((a, b) => (a.length >= b.length ? a : b), lines[0] ?? [])
      geometria = { type: "LineString", coordinates: longest }
    }

    if (!geometria || geometria.coordinates.length < 2) continue

    const longitudProp = pickNumber(props, PROPERTY_ALIASES.longitud_m)
    const longitud_m = longitudProp && longitudProp > 0 ? longitudProp : longitudDesdeGeometria(geometria)

    rows.push({
      proyecto_id: PROYECTO_DESASOLVE_CANALES,
      codigo,
      canal,
      longitud_m: Math.round(longitud_m * 100) / 100,
      geometria,
      estado: "pendiente",
      avance_pct: 0,
      metros_ejecutados: 0,
    })
  }

  const kmTotales = rows.reduce((sum, row) => sum + Number(row.longitud_m), 0) / 1000

  if (sqlOut) {
    mkdirSync(dirname(sqlOut), { recursive: true })
    writeFileSync(sqlOut, rowsToSql(rows), "utf8")
    console.log(`SQL generado: ${sqlOut}`)
  }

  if (dryRun) {
    console.log(`[dry-run] ${rows.length} tramos parseados desde ${filePath}`)
  } else if (!sqlOut) {
    console.log(`Importando ${rows.length} tramos desde ${filePath}...`)
    const supabase = createClient(supabaseUrl!, serviceKey!)
    const { error } = await supabase.from("canal_tramos").upsert(rows, {
      onConflict: "proyecto_id,codigo",
    })

    if (error) {
      throw new Error(error.message)
    }
  } else if (sqlOut) {
    console.log("Modo --sql-out: no se ejecutó upsert remoto.")
  }
  const codigos = rows.map((row) => String(row.codigo)).sort((a, b) => a.localeCompare(b, "es"))

  console.log(`Listo: ${rows.length} tramos (${kmTotales.toFixed(2)} km totales).`)
  console.log(`Canal asignado: ${CANAL_DEFAULT}`)
  console.log("Códigos importados:")
  for (const codigo of codigos) {
    const fila = rows.find((row) => row.codigo === codigo)
    console.log(`  - ${codigo} (${Number(fila?.longitud_m).toFixed(1)} m)`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
