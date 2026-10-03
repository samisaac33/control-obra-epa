/**
 * Elimina uno o más registros de tramo_registros_maquinaria por criterios.
 *
 * Uso:
 *   npx tsx scripts/delete-jornada-maquinaria.ts --proyecto desasolve-canales --fecha 2025-09-29 --tramo 34 --metros 367
 *   npx tsx scripts/delete-jornada-maquinaria.ts --proyecto desasolve-canales --fecha 2025-09-29 --tramo 34 --metros 367 --dry-run
 *
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (.env.local o entorno).
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

function normalizarCodigoTramo(raw: string): string {
  return raw
    .trim()
    .replace(/^tramo\s+/i, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
}

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run")
  const get = (flag: string) => {
    const i = argv.indexOf(flag)
    return i >= 0 ? argv[i + 1]?.trim() : undefined
  }
  const proyecto = get("--proyecto") ?? "desasolve-canales"
  const fecha = get("--fecha")
  const tramo = get("--tramo")
  const metrosRaw = get("--metros")
  const metros = metrosRaw != null ? Number(metrosRaw.replace(",", ".")) : undefined
  const observacionContiene = get("--observacion-contiene")

  if (!fecha || !tramo) {
    throw new Error(
      "Uso: --proyecto <id> --fecha YYYY-MM-DD --tramo <número o código> [--metros N] [--observacion-contiene texto] [--dry-run]"
    )
  }

  return { dryRun, proyecto, fecha, tramo, metros, observacionContiene }
}

async function main() {
  loadEnvFromDotenv()
  const { dryRun, proyecto, fecha, tramo, metros, observacionContiene } = parseArgs(process.argv)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.")
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const tramoClave = normalizarCodigoTramo(tramo)

  const { data: tramos, error: errTramos } = await supabase
    .from("canal_tramos")
    .select("id, codigo")
    .eq("proyecto_id", proyecto)

  if (errTramos) throw new Error(errTramos.message)

  const tramoRow = (tramos ?? []).find((t) =>
    normalizarCodigoTramo(String(t.codigo)).includes(tramoClave)
  )
  if (!tramoRow) {
    console.log("No se encontró tramo para:", tramo)
    return
  }

  const { data: registros, error: errReg } = await supabase
    .from("tramo_registros_maquinaria")
    .select("*")
    .eq("tramo_id", tramoRow.id)
    .eq("fecha", fecha)

  if (errReg) throw new Error(errReg.message)

  let candidatos = (registros ?? []) as Record<string, unknown>[]
  if (metros != null && Number.isFinite(metros)) {
    candidatos = candidatos.filter((r) => Number(r.metros_desasolados) === metros)
  }
  if (observacionContiene) {
    const needle = observacionContiene.toLowerCase()
    candidatos = candidatos.filter((r) =>
      String(r.observaciones ?? "")
        .toLowerCase()
        .includes(needle)
    )
  }

  console.log(`Tramo: ${tramoRow.codigo} (${tramoRow.id})`)
  console.log(`Fecha: ${fecha}`)
  console.log(`Registros coincidentes: ${candidatos.length}`)

  for (const r of candidatos) {
    console.log(
      `  - id=${r.id} metros=${r.metros_desasolados} equipo=${r.equipo} obs=${r.observaciones ?? ""}`
    )
  }

  if (candidatos.length === 0) {
    console.log("Nada que eliminar.")
    return
  }

  if (dryRun) {
    console.log("\n--dry-run: no se eliminó nada.")
    return
  }

  const ids = candidatos.map((r) => String(r.id))
  const { error: delError } = await supabase.from("tramo_registros_maquinaria").delete().in("id", ids)
  if (delError) throw new Error(delError.message)

  console.log(`\nEliminados ${ids.length} registro(s).`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
