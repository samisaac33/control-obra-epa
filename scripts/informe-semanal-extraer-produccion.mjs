/**
 * Extrae jornadas y KPIs desde producción (requiere CAPACITACION_PIN).
 * Uso: CAPACITACION_PIN=... node scripts/informe-semanal-extraer-produccion.mjs
 */
import { writeFileSync } from "node:fs"
import { chromium } from "playwright-core"

const PIN = process.env.CAPACITACION_PIN?.trim()
const BASE = process.env.BASE_URL?.trim() || "https://control-obra-epa.vercel.app"
const INICIO = process.env.INFORME_INICIO?.trim() || "2026-10-05"
const FIN = process.env.INFORME_FIN?.trim() || "2026-10-11"

const jornadasRaw = []
const tramosRaw = []
const puntosRaw = []

async function loginMapa(page) {
  await page.goto(`${BASE}/ingreso?next=${encodeURIComponent("/desasolve-canales/mapa")}`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  })
  if (!page.url().includes("/mapa")) {
    if (!PIN) throw new Error("Falta CAPACITACION_PIN")
    await page.locator('input[type="password"], input:not([type="hidden"])').first().fill(PIN)
    await page.getByRole("button", { name: /Entrar/i }).click()
    await page.waitForURL(/\/mapa/, { timeout: 90000 })
  }
  await page.waitForSelector(".leaflet-container", { timeout: 120000 })
  await page.waitForTimeout(4000)
}

function wireCapture(page) {
  page.on("response", async (res) => {
    const u = res.url()
    if (!u.includes("rest/v1/")) return
    try {
      const json = await res.json()
      if (!Array.isArray(json)) return
      if (u.includes("tramo_registros_maquinaria")) jornadasRaw.push(...json)
      if (u.includes("canal_tramos")) tramosRaw.push(...json)
      if (u.includes("tramo_puntos_avance")) puntosRaw.push(...json)
    } catch {
      /* ignore */
    }
  })
}

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  })
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  wireCapture(page)
  await loginMapa(page)
  await page.goto(`${BASE}/desasolve-canales/maquinaria`, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(8000)

  const kpisDom = await page.evaluate(() => {
    const text = document.body.innerText
    const pct = text.match(/(\d+[,.]?\d*)\s*%/)?.[1]
    const kmEj = text.match(/(\d+[,.]?\d*)\s*km\s*ejecutados/i) || text.match(/(\d+[,.]?\d*)\s*\/\s*(\d+[,.]?\d*)\s*km/)
    return { snippet: text.slice(0, 500), pct, kmEj }
  })

  await browser.close()

  const jornadasSemana = jornadasRaw.filter((j) => j.fecha >= INICIO && j.fecha <= FIN)
  let metrosSemana = 0
  let horasSemana = 0
  const fechas = new Set()
  const tramos = new Set()
  for (const j of jornadasSemana) {
    metrosSemana += Number(j.metros_desasolados) || 0
    if (j.duracion_horas != null) horasSemana += Number(j.duracion_horas) || 0
    fechas.add(j.fecha)
    tramos.add(j.tramo_id)
  }

  const out = {
    periodo: { inicio: INICIO, fin: FIN, etiqueta: "5–11 oct 2026" },
    semana: {
      jornadas: jornadasSemana.length,
      metros: metrosSemana,
      horas: horasSemana,
      diasConActividad: fechas.size,
      tramosConJornada: tramos.size,
      fechas: [...fechas].sort(),
    },
    captura: {
      jornadasTotal: jornadasRaw.length,
      tramosTotal: tramosRaw.length,
      puntosTotal: puntosRaw.length,
      kpisDom,
    },
    jornadasSemana,
  }

  const path = "/workspace/scripts/informe-semanal-2026-10-05.datos.json"
  writeFileSync(path, JSON.stringify(out, null, 2))
  console.log("Wrote", path)
  console.log(JSON.stringify({ semana: out.semana, captura: out.captura }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
