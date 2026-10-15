/**
 * Grabación sincronizada v3: una sola ventana maximizada, mapa a pantalla completa,
 * zoom in/out, duración alineada a narracion-es-v3 (~153 s tras login).
 */
import { chromium } from "playwright-core"

const PIN = process.env.CAPACITACION_PIN?.trim()
const BASE = "https://control-obra-epa.vercel.app"
const PRE_ROLL_MS = 18_000
const NARRATION_MS = 153_500

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

async function microPan(page, mapBox) {
  if (!mapBox) return
  const cx = mapBox.x + mapBox.width * 0.5
  const cy = mapBox.y + mapBox.height * 0.5
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx - 25, cy - 12, { steps: 8 })
  await page.mouse.up()
}

async function zoomWheel(page, mapBox, direction, times = 3) {
  if (!mapBox) return
  const cx = mapBox.x + mapBox.width * 0.52
  const cy = mapBox.y + mapBox.height * 0.48
  await page.mouse.move(cx, cy)
  for (let i = 0; i < times; i++) {
    await page.mouse.wheel(0, direction * 350)
    await sleep(450)
  }
}

async function mapBox(page) {
  const map = page.locator(".leaflet-container").first()
  if (!(await map.count())) return null
  return map.boundingBox()
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
  await sleep(2500)

  // Cerrar banner traducción si aparece
  const dismissTranslate = page.locator("button", { hasText: /never translate|nunca traducir|no gracias|cerrar/i })
  if (await dismissTranslate.count()) {
    await dismissTranslate.first().click().catch(() => {})
  }

  const syncStart = Date.now()
  console.log(`Mapa listo. Sincronización en t=${elapsed(t0)}ms`)

  // --- 0:00 narración: bienvenida + KPIs (VTT ~0–31s) ---
  await waitUntil(syncStart, 0)
  await page.mouse.move(720, 200, { steps: 12 })
  await sleep(1200)
  await page.mouse.move(920, 240, { steps: 10 })
  await waitUntil(syncStart, 31_000)

  // --- ~31–48s residente visitante ---
  await page.mouse.move(480, 380, { steps: 10 })
  await waitUntil(syncStart, 48_000)

  // --- ~48–55s filtro Tramos ---
  const tramoTrigger = page.locator("#filtro-tramo-visitante-inline")
  if (await tramoTrigger.count()) {
    await tramoTrigger.click()
    await sleep(2800)
    await page.keyboard.press("Escape")
  }
  await waitUntil(syncStart, 55_000)

  // --- ~55–63s Vista 1-24 ON ---
  const vista124 = page.locator("#visitante-vista-tramos-1-24")
  if (await vista124.count()) {
    await vista124.check()
    let box = await mapBox(page)
    await microPan(page, box)
    await sleep(2000)
  }
  await waitUntil(syncStart, 63_500)

  // --- ~63–74s Vista 1-24 OFF + KPI 31 tramos ---
  if (await vista124.count()) {
    await vista124.uncheck()
    await sleep(1500)
  }
  await page.mouse.move(850, 200, { steps: 8 })
  await waitUntil(syncStart, 74_000)

  // --- Leyenda + No consolidado (~74–95s) ---
  await page.mouse.move(380, 340, { steps: 8 })
  await sleep(1500)
  const noConsolidado = page.locator("#visitante-consolidado")
  if (await noConsolidado.count()) {
    await noConsolidado.check()
    await sleep(2500)
  }
  await waitUntil(syncStart, 95_000)

  // --- Minitramos: puntos + pantalla completa + zoom (~95–125s) ---
  const puntos = page.locator("#visitante-mostrar-puntos-avance")
  if (await puntos.count()) await puntos.check()

  const expandir = page.getByRole("button", { name: /Expandir mapa a pantalla completa/i })
  if (await expandir.count()) {
    await expandir.click()
    await sleep(2000)
  }

  let box = await mapBox(page)
  await zoomWheel(page, box, -1, 6)
  await sleep(2000)
  await zoomWheel(page, box, 1, 4)
  await sleep(2000)
  await zoomWheel(page, box, -1, 5)
  await microPan(page, box)
  await waitUntil(syncStart, 125_000)

  // --- Parpadeo naranja (~125–135s) ---
  box = await mapBox(page)
  if (box) {
    await page.mouse.move(box.x + box.width * 0.48, box.y + box.height * 0.42, { steps: 15 })
    await sleep(4500)
  }
  await waitUntil(syncStart, 135_000)

  // --- Salir pantalla completa (~135–140s) ---
  const salirFs = page.getByRole("button", { name: /Salir de pantalla completa/i })
  if (await salirFs.count()) {
    await salirFs.click()
    await sleep(2000)
  } else {
    await page.keyboard.press("Escape")
    await sleep(1500)
  }

  // --- Modal tramo (~140–148s) ---
  box = await mapBox(page)
  if (box) {
    await page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.4)
    await sleep(2200)
    const cerrar = page.getByRole("button", { name: /Cerrar/i })
    if (await cerrar.count()) await cerrar.click()
  }
  await waitUntil(syncStart, 148_000)

  // --- Cierre: vista general (~148–153s) ---
  box = await mapBox(page)
  await zoomWheel(page, box, 1, 3)
  await page.mouse.move(700, 220, { steps: 10 })
  await waitUntil(syncStart, NARRATION_MS)

  // Mantener movimiento hasta fin del pre-roll+narration total si grabación empezó antes
  const totalTarget = PRE_ROLL_MS + NARRATION_MS
  while (elapsed(t0) < totalTarget) {
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
