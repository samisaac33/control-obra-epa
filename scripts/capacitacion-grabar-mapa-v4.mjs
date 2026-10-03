/**
 * Grabación sincronizada v4: Primer levantamiento, zoom preciso (flyTo / UI fallback), VTT v4.
 */
import { readFileSync } from "node:fs"
import { chromium } from "playwright-core"

import {
  acercarMinitramosTerminados,
  alejarVistaRedCompleta,
  countMinitramoLabels,
  expandirPantallaCompleta,
  mapBox,
  restablecerVistaRedCompleta,
  salirPantallaCompleta,
} from "./capacitacion-mapa-leaflet-helpers.mjs"

const PIN = process.env.CAPACITACION_PIN?.trim()
const BASE = process.env.BASE_URL?.trim() || "https://control-obra-epa.vercel.app"
const NARRATION_MS = 153_816

const targets = JSON.parse(
  readFileSync(new URL("./capacitacion-mapa-targets.json", import.meta.url), "utf8")
)

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function elapsed(start) {
  return Date.now() - start
}

async function waitUntil(start, targetMs) {
  const left = targetMs - elapsed(start)
  if (left > 0) await sleep(left)
}

async function microPan(page, mapBoxRect) {
  if (!mapBoxRect) return
  const cx = mapBoxRect.x + mapBoxRect.width * 0.5
  const cy = mapBoxRect.y + mapBoxRect.height * 0.5
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx - 25, cy - 12, { steps: 8 })
  await page.mouse.up()
}

async function main() {
  if (!PIN) {
    console.error("Falta CAPACITACION_PIN")
    process.exit(1)
  }

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--start-maximized",
      "--disable-features=TranslateUI",
      "--lang=es-MX",
    ],
  })

  const context = await browser.newContext({
    locale: "es-MX",
    viewport: null,
  })
  const page = await context.newPage()

  const t0 = Date.now()

  await page.goto(`${BASE}/ingreso?next=${encodeURIComponent("/desasolve-canales/mapa")}`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  })
  await sleep(800)

  if (!page.url().includes("/mapa")) {
    await page.locator('input[type="password"], input:not([type="hidden"])').first().fill(PIN)
    await page.getByRole("button", { name: /Entrar/i }).click()
    await page.waitForURL(/\/desasolve-canales\/mapa/, { timeout: 90000 })
  }

  await page.waitForSelector(".leaflet-container", { timeout: 120000 })
  await sleep(3500)

  const dismissTranslate = page.locator("button", {
    hasText: /never translate|nunca traducir|no gracias|cerrar/i,
  })
  if (await dismissTranslate.count()) {
    await dismissTranslate.first().click().catch(() => {})
  }

  const syncStart = Date.now()
  console.log(`Mapa listo. Sincronización en t=${elapsed(t0)}ms`)

  const vista124 = page.locator("#visitante-vista-tramos-1-24")
  const puntos = page.locator("#visitante-mostrar-puntos-avance")

  // --- 0:00–0:29 KPIs (VTT) ---
  await waitUntil(syncStart, 0)
  await page.mouse.move(720, 200, { steps: 12 })
  await sleep(1200)
  await page.mouse.move(920, 240, { steps: 10 })
  await waitUntil(syncStart, 29_681)

  // --- 0:33–0:43 residente ---
  await page.mouse.move(480, 380, { steps: 10 })
  await waitUntil(syncStart, 43_635)

  // --- 0:43–0:48 filtro Tramos ---
  const tramoTrigger = page.locator("#filtro-tramo-visitante-inline")
  if (await tramoTrigger.count()) {
    await tramoTrigger.click()
    await sleep(2800)
    await page.keyboard.press("Escape")
  }
  await waitUntil(syncStart, 48_915)

  // --- 0:48–1:10 Primer levantamiento ON + narración técnica ---
  if (await vista124.count()) {
    if (!(await vista124.isChecked())) await vista124.check()
    let box = await mapBox(page)
    await microPan(page, box)
    await sleep(2500)
  }
  await waitUntil(syncStart, 70_561)

  // --- 1:10–1:29 Primer levantamiento OFF + red operativa ---
  if (await vista124.count()) {
    if (await vista124.isChecked()) await vista124.uncheck()
    await sleep(2000)
  }
  await page.mouse.move(850, 200, { steps: 8 })
  await waitUntil(syncStart, 89_668)

  // --- 1:29–1:35 KPI 31 tramos / 65,33 km ---
  await page.mouse.move(780, 210, { steps: 8 })
  await waitUntil(syncStart, 95_765)

  // --- 1:35–1:42 leyenda ---
  await page.mouse.move(380, 340, { steps: 8 })
  await sleep(1500)
  await waitUntil(syncStart, 102_704)

  // --- 1:42–1:58 zoom minitramos (etiquetas m) en vista normal ---
  if (await puntos.count()) await puntos.check()
  await restablecerVistaRedCompleta(page)
  await acercarMinitramosTerminados(page, targets)
  const labels1 = await countMinitramoLabels(page)
  console.log(`Etiquetas minitramo (vista página): ${labels1}`)
  await sleep(4500)
  await waitUntil(syncStart, 118_278)

  // --- 1:58–2:06 frente naranja parpadeante ---
  let box = await mapBox(page)
  if (box) {
    await page.mouse.move(box.x + box.width * 0.48, box.y + box.height * 0.42, { steps: 15 })
    await sleep(4500)
  }
  await waitUntil(syncStart, 126_071)

  // --- 2:06–2:16 pantalla completa + zoom in/out acotado ---
  await alejarVistaRedCompleta(page, targets)
  await expandirPantallaCompleta(page)
  await sleep(1800)
  await acercarMinitramosTerminados(page, targets)
  await sleep(3500)
  await alejarVistaRedCompleta(page, targets)
  await sleep(2000)
  await waitUntil(syncStart, 136_326)

  // --- 2:16–2:20 salir FS + clic tramo ---
  await salirPantallaCompleta(page)
  await sleep(1500)
  box = await mapBox(page)
  if (box) {
    await page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.4)
    await sleep(2200)
    const cerrar = page.getByRole("button", { name: /Cerrar/i })
    if (await cerrar.count()) await cerrar.click()
  }
  await waitUntil(syncStart, 140_306)

  // --- 2:20–2:33 cierre ---
  await restablecerVistaRedCompleta(page)
  await page.mouse.move(700, 220, { steps: 10 })
  await waitUntil(syncStart, NARRATION_MS)

  while (elapsed(t0) < NARRATION_MS + 2000) {
    box = await mapBox(page)
    await microPan(page, box)
    await sleep(800)
  }

  console.log(`Finalizado en ${elapsed(t0)}ms`)
  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
