/**
 * Restablece avance GPS de tramos (puntos, origen, maquinaria, vínculo fotos).
 *
 * Uso:
 *   npx tsx scripts/reset-tramos-avance-gps.ts --proyecto desasolve-canales --codigos 1,8
 *   npx tsx scripts/reset-tramos-avance-gps.ts --proyecto desasolve-canales --codigos 1,8 --dry-run
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

/** Clave numérica/lógica del tramo para comparar códigos KMZ. */
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
  origen_extremo: string | null
  metros_ejecutados: number
  avance_pct: number
}

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run")
  const proyectoIdx = argv.indexOf("--proyecto")
  const codigosIdx = argv.indexOf("--codigos")
  const proyecto =
    proyectoIdx >= 0 ? argv[proyectoIdx + 1]?.trim() : "desasolve-canales"
  const codigosRaw = codigosIdx >= 0 ? argv[codigosIdx + 1]?.trim() : "1,8"
  const codigosClave = (codigosRaw ?? "1,8")
    .split(",")
    .map((c) => normalizarCodigoTramoClave(c))
    .filter(Boolean)

  if (!proyecto || codigosClave.length === 0) {
    throw new Error("Uso: --proyecto <id> --codigos 1,8 [--dry-run]")
  }

  return { dryRun, proyecto, codigosClave }
}

async function contarRelacionados(
  supabase: ReturnType<typeof createClient>,
  tramoIds: string[]
) {
  const [puntos, maquinaria, fotos] = await Promise.all([
    supabase.from("tramo_puntos_avance").select("id", { count: "exact", head: true }).in("tramo_id", tramoIds),
    supabase
      .from("tramo_registros_maquinaria")
      .select("id", { count: "exact", head: true })
      .in("tramo_id", tramoIds),
    supabase
      .from("registros_fotograficos")
      .select("id", { count: "exact", head: true })
      .in("tramo_id", tramoIds),
  ])

  return {
    puntos: puntos.count ?? 0,
    maquinaria: maquinaria.count ?? 0,
    fotos: fotos.count ?? 0,
    errors: [puntos.error, maquinaria.error, fotos.error].filter(Boolean),
  }
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
    .select("id, codigo, origen_extremo, metros_ejecutados, avance_pct")
    .eq("proyecto_id", proyecto)

  if (tramosError) throw new Error(tramosError.message)

  const objetivo = (tramos ?? []).filter((t) =>
    codigosClave.includes(normalizarCodigoTramoClave(String(t.codigo)))
  ) as TramoRow[]

  console.log(`Proyecto: ${proyecto}`)
  console.log(`Códigos buscados (clave): ${codigosClave.join(", ")}`)
  console.log(`Tramos encontrados: ${objetivo.length}`)

  for (const t of objetivo) {
    console.log(
      `  - ${t.codigo} (${t.id}) origen=${t.origen_extremo ?? "null"} metros=${t.metros_ejecutados} avance=${t.avance_pct}%`
    )
  }

  if (objetivo.length !== codigosClave.length) {
    const encontrados = new Set(objetivo.map((t) => normalizarCodigoTramoClave(t.codigo)))
    const faltantes = codigosClave.filter((c) => !encontrados.has(c))
    throw new Error(
      `Se esperaban ${codigosClave.length} tramos; faltan claves: ${faltantes.join(", ") || "?"}. Abortando.`
    )
  }

  const tramoIds = objetivo.map((t) => t.id)
  const antes = await contarRelacionados(supabase, tramoIds)
  if (antes.errors.length) {
    throw new Error(String(antes.errors[0]))
  }

  console.log("\nAntes del reset:")
  console.log(`  puntos avance: ${antes.puntos}`)
  console.log(`  jornadas maquinaria: ${antes.maquinaria}`)
  console.log(`  fotos vinculadas (tramo_id): ${antes.fotos}`)

  if (dryRun) {
    console.log("\n--dry-run: no se aplicaron cambios.")
    return
  }

  const { error: delMaquinaria } = await supabase
    .from("tramo_registros_maquinaria")
    .delete()
    .in("tramo_id", tramoIds)
  if (delMaquinaria) throw new Error(`maquinaria: ${delMaquinaria.message}`)

  const { error: delPuntos } = await supabase
    .from("tramo_puntos_avance")
    .delete()
    .in("tramo_id", tramoIds)
  if (delPuntos) throw new Error(`puntos: ${delPuntos.message}`)

  const { error: updFotos } = await supabase
    .from("registros_fotograficos")
    .update({ tramo_id: null })
    .in("tramo_id", tramoIds)
  if (updFotos) throw new Error(`fotos: ${updFotos.message}`)

  const { error: updTramos } = await supabase
    .from("canal_tramos")
    .update({
      origen_extremo: null,
      metros_ejecutados: 0,
      avance_pct: 0,
      updated_at: new Date().toISOString(),
    })
    .in("id", tramoIds)
  if (updTramos) throw new Error(`canal_tramos: ${updTramos.message}`)

  const despues = await contarRelacionados(supabase, tramoIds)
  console.log("\nDespués del reset:")
  console.log(`  puntos avance: ${despues.puntos}`)
  console.log(`  jornadas maquinaria: ${despues.maquinaria}`)
  console.log(`  fotos vinculadas (tramo_id): ${despues.fotos}`)

  const { data: verificacion } = await supabase
    .from("canal_tramos")
    .select("codigo, origen_extremo, metros_ejecutados, avance_pct")
    .in("id", tramoIds)

  console.log("\nEstado canal_tramos:")
  for (const row of verificacion ?? []) {
    console.log(
      `  ${row.codigo}: origen=${row.origen_extremo ?? "null"} metros=${row.metros_ejecutados} avance=${row.avance_pct}%`
    )
  }

  console.log("\nReset completado.")
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
