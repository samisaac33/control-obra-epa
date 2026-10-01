/**
 * Elimina tramos de canal (y dependencias en cascade) por número de código.
 *
 * Uso:
 *   npx tsx scripts/delete-tramos.ts --proyecto desasolve-canales --codigos 4,21
 *   npx tsx scripts/delete-tramos.ts --proyecto desasolve-canales --codigos 4,21 --dry-run
 *
 * Requiere:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import { createClient } from "@supabase/supabase-js"

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

function normalizarCodigoTramoClave(raw: string): string {
  let codigo = raw.trim().replace(/\s+/g, " ")
  if (/^tremo\s+/i.test(codigo)) {
    codigo = codigo.replace(/^tremo\s+/i, "tramo ")
  }
  if (/^tramo\s+/i.test(codigo)) {
    codigo = codigo.replace(/^tramo\s+/i, "")
  }
  return codigo.trim().toLowerCase()
}

type TramoRow = {
  id: string
  codigo: string
}

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run")
  const proyectoIdx = argv.indexOf("--proyecto")
  const codigosIdx = argv.indexOf("--codigos")
  const proyecto =
    proyectoIdx >= 0 ? argv[proyectoIdx + 1]?.trim() : "desasolve-canales"
  const codigosRaw = codigosIdx >= 0 ? argv[codigosIdx + 1]?.trim() : "4,21"
  const codigosClave = (codigosRaw ?? "4,21")
    .split(",")
    .map((c) => normalizarCodigoTramoClave(c))
    .filter(Boolean)

  if (!proyecto || codigosClave.length === 0) {
    throw new Error("Uso: --proyecto <id> --codigos 4,21 [--dry-run]")
  }

  return { dryRun, proyecto, codigosClave }
}

async function main() {
  loadEnvFromDotenv()
  const { dryRun, proyecto, codigosClave } = parseArgs(process.argv)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Configure NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local o el entorno."
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  const { data: tramos, error: tramosError } = await supabase
    .from("canal_tramos")
    .select("id, codigo")
    .eq("proyecto_id", proyecto)

  if (tramosError) throw new Error(tramosError.message)

  const objetivo = (tramos ?? []).filter((t) =>
    codigosClave.includes(normalizarCodigoTramoClave(String(t.codigo)))
  ) as TramoRow[]

  console.log(`Proyecto: ${proyecto}`)
  console.log(`Códigos buscados (clave): ${codigosClave.join(", ")}`)
  console.log(`Tramos encontrados: ${objetivo.length}`)

  for (const t of objetivo) {
    console.log(`  - ${t.codigo} (${t.id})`)
  }

  if (objetivo.length === 0) {
    console.log("Nada que eliminar.")
    return
  }

  const tramoIds = objetivo.map((t) => t.id)

  if (dryRun) {
    console.log("\n--dry-run: no se aplicaron cambios.")
    return
  }

  const { error: updFotos } = await supabase
    .from("registros_fotograficos")
    .update({ tramo_id: null })
    .in("tramo_id", tramoIds)
  if (updFotos) throw new Error(`fotos: ${updFotos.message}`)

  const { error: delTramos } = await supabase.from("canal_tramos").delete().in("id", tramoIds)
  if (delTramos) throw new Error(`canal_tramos: ${delTramos.message}`)

  console.log(`\nEliminados ${objetivo.length} tramo(s).`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
