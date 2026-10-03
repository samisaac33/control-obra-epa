/**
 * Busca lat/lng/zoom para ver etiquetas de minitramo (producción o local con hook).
 * Fallback sin API Leaflet: barrido pan + clics en zoom-in.
 *
 * Uso: CAPACITACION_PIN=... node scripts/calibrar-mapa-targets.mjs
 *      BASE_URL=https://control-obra-epa.vercel.app (default)
 */
import { writeFileSync } from "node:fs"
import { chromium } from "playwright-core"

const PIN = process.env.CAPACITACION_PIN?.trim()
const BASE = process.env.BASE_URL?.trim() || "https://control-obra-epa.vercel.app"
const MAX_ZOOM = 14

const CANDIDATES = [
  { lat: -0.9124, lng: -80.4542, note: "Rocafuerte / Vía Portoviejo-Crucita (ref. imagen 2)" },
  { lat: -0.9158, lng: -80.4614, note: "demo tramo 8" },
  { lat: -0.9185, lng: -80.4663, note: "canal central" },
  { lat: -0.9206, lng: -80.4695, note: "Charapotó norte" },
  { lat: -0.914, lng: -80.458, note: "intermedio" },
]

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function countLabels(page) {
  return page.evaluate(() => document.querySelectorAll(".mapa-minitramo-distancia-etiqueta").length)
}

async function flyToCandidate(page, lat, lng) {
  return page.evaluate(
    ({ lat, lng, maxZoom }) => {
      const map = window.__mapaTramosLeaflet
      if (!map) return false
      map.flyTo([lat, lng], maxZoom, { duration: 0.6 })
      return true
    },
    { lat, lng, maxZoom: MAX_ZOOM }
  )
}

async function salirPantallaCompleta(page) {
  const salir = page.getByRole("button", { name: /Salir de pantalla completa/i })
  if (await salir.count()) {
    await salir.click()
    await sleep(1200)
  }
}

async function resetRedCompleta(page) {
  const ok = await page.evaluate(() => {
    if (typeof window.__mapaCapacitacionFitBoundsRed === "function") {
      window.__mapaCapacitacionFitBoundsRed()
      return true
    }
    return false
  })
  if (ok) {
    await sleep(900)
    return
  }
  await salirPantallaCompleta(page)
  await page.evaluate(() => {
    const el = document.querySelector("#visitante-vista-tramos-1-24")
    if (!(el instanceof HTMLInputElement)) return
    if (!el.checked) {
      el.click()
    }
  })
  await sleep(700)
  await page.evaluate(() => {
    const el = document.querySelector("#visitante-vista-tramos-1-24")
    if (el instanceof HTMLInputElement && el.checked) el.click()
  })
  await sleep(900)
  const expandir = page.getByRole("button", { name: /Expandir mapa a pantalla completa/i })
  if (await expandir.count()) await expandir.click()
  await sleep(1200)
}

async function mapBox(page) {
  const map = page.locator(".leaflet-container").first()
  if (!(await map.count())) return null
  return map.boundingBox()
}

async function panFraction(page, box, fx, fy) {
  const cx = box.x + box.width * 0.5
  const cy = box.y + box.height * 0.5
  const tx = box.x + box.width * fx
  const ty = box.y + box.height * fy
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(tx, ty, { steps: 12 })
  await page.mouse.up()
  await sleep(500)
}

async function zoomInClicks(page, times) {
  const btn = page.locator(".leaflet-control-zoom-in").first()
  if (!(await btn.count())) return
  for (let i = 0; i < times; i++) {
    if ((await btn.getAttribute("aria-disabled")) === "true") return
    await btn.click()
    await sleep(350)
  }
}

async function calibrarPorApi(page) {
  let best = null
  for (const c of CANDIDATES) {
    const flew = await flyToCandidate(page, c.lat, c.lng)
    if (!flew) return null
    await sleep(1200)
    const count = await countLabels(page)
    console.log("[api]", c.note, count, "labels")
    if (!best || count > best.labelCount) {
      best = { ...c, zoom: MAX_ZOOM, labelCount: count, method: "flyTo" }
    }
  }
  return best?.labelCount >= 2 ? best : null
}

async function zoomOutClicks(page, times) {
  const btn = page.locator(".leaflet-control-zoom-out").first()
  if (!(await btn.count())) return
  for (let i = 0; i < times; i++) {
    if ((await btn.getAttribute("aria-disabled")) === "true") return
    await btn.click()
    await sleep(350)
  }
}

async function calibrarPorUi(page) {
  let box = await mapBox(page)
  if (!box) return null

  const panGrid = [
    [0.52, 0.48],
    [0.58, 0.45],
    [0.48, 0.42],
    [0.62, 0.52],
    [0.45, 0.55],
    [0.55, 0.38],
  ]
  const zoomSteps = [0, 1, 2, 3, 4]

  let best = null
  for (const [fx, fy] of panGrid) {
    await zoomOutClicks(page, 8)
    await sleep(400)
    box = await mapBox(page)
    if (!box) continue
    await panFraction(page, box, fx, fy)
    for (const steps of zoomSteps) {
      await zoomInClicks(page, steps)
      await sleep(900)
      const count = await countLabels(page)
      console.log("[ui]", `pan ${fx},${fy}`, `zoom+${steps}`, count, "labels")
      if (!best || count > best.labelCount) {
        const center = await page.evaluate(() => {
          const map = window.__mapaTramosLeaflet
          if (!map) return null
          const c = map.getCenter()
          return { lat: c.lat, lng: c.lng, zoom: map.getZoom() }
        })
        best = {
          lat: center?.lat ?? -0.9124,
          lng: center?.lng ?? -80.4542,
          zoom: center?.zoom ?? MAX_ZOOM,
          labelCount: count,
          note: `UI pan ${fx},${fy} zoom+${steps}`,
          method: "ui",
          uiFallback: { panFraction: [fx, fy], zoomInClicks: steps },
        }
      }
      if (count >= 10) break
    }
    if (best?.labelCount >= 10) break
  }
  return best?.labelCount >= 2 ? best : best
}

async function loginMapa(page) {
  await page.goto(`${BASE}/ingreso?next=${encodeURIComponent("/desasolve-canales/mapa")}`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  })
  await sleep(800)
  if (!page.url().includes("/mapa")) {
    if (!PIN) throw new Error("Falta CAPACITACION_PIN")
    await page.locator('input[type="password"], input:not([type="hidden"])').first().fill(PIN)
    await page.getByRole("button", { name: /Entrar/i }).click()
    await page.waitForURL(/\/mapa/, { timeout: 90000 })
  }
  await page.waitForSelector(".leaflet-container", { timeout: 120000 })
  await sleep(3000)

  const primerLevant = page.locator("#visitante-vista-tramos-1-24")
  if (await primerLevant.isChecked()) await primerLevant.uncheck()
  await page.locator("#visitante-mostrar-puntos-avance").check().catch(() => {})

  const expandir = page.getByRole("button", { name: /Expandir mapa a pantalla completa/i })
  if (await expandir.count()) await expandir.click()
  await sleep(1500)
}

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  })
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await loginMapa(page)

  const hasHook = await page.evaluate(() => Boolean(window.__mapaTramosLeaflet))
  console.log("Hook __mapaTramosLeaflet:", hasHook)

  let best = hasHook ? await calibrarPorApi(page) : null
  if (!best || best.labelCount < 2) {
    console.log("Probando calibración UI…")
    best = await calibrarPorUi(page)
  }

  await browser.close()

  if (!best || best.labelCount < 2) {
    console.error("No se encontró tramo con etiquetas suficientes", best)
    process.exit(1)
  }

  const out = {
    flyToMinitramosTerminados: {
      lat: best.lat,
      lng: best.lng,
      zoom: best.zoom,
      labelCountAtCalibration: best.labelCount,
      note: best.note,
      method: best.method,
    },
    fitBounds: { padding: [24, 24], maxZoom: MAX_ZOOM },
  }
  if (best.uiFallback) out.uiFallbackZoomIn = best.uiFallback

  writeFileSync("/workspace/scripts/capacitacion-mapa-targets.json", JSON.stringify(out, null, 2))
  console.log("Wrote scripts/capacitacion-mapa-targets.json", out)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
