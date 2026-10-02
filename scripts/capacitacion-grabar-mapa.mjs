/**
 * Automatización lenta del mapa en producción para screencast de capacitación.
 * PIN: pasar por env CAPACITACION_PIN (no commitear).
 */
import { chromium } from "playwright-core"

const PIN = process.env.CAPACITACION_PIN?.trim()
const BASE = "https://control-obra-epa.vercel.app"
const MAP_URL = `${BASE}/desasolve-canales/mapa`

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  if (!PIN) {
    console.error("Falta CAPACITACION_PIN en el entorno")
    process.exit(1)
  }

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--window-size=1400,900"],
  })
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } })
  const page = await context.newPage()

  await page.setViewportSize({ width: 1400, height: 900 })

  await page.goto(`${BASE}/ingreso?next=${encodeURIComponent("/desasolve-canales/mapa")}`, {
    waitUntil: "networkidle",
    timeout: 120000,
  })
  await sleep(1500)

  const onMap = page.url().includes("/mapa")
  if (!onMap) {
    await page.getByLabel(/PIN de acceso/i).fill(PIN)
    await page.getByRole("button", { name: /Entrar/i }).click()
    await page.waitForURL(/\/desasolve-canales\/mapa/, { timeout: 60000 })
  }

  await page.waitForSelector(".leaflet-container", { timeout: 90000 })
  await sleep(4000)

  // KPIs
  await page.mouse.move(700, 180)
  await sleep(3500)

  // Tramos dropdown
  const tramoTrigger = page.locator("#filtro-tramo-visitante-inline")
  if (await tramoTrigger.count()) {
    await tramoTrigger.click()
    await sleep(3000)
    await page.keyboard.press("Escape")
    await sleep(1500)
  }

  // Vista 1-24
  const vista124 = page.locator("#visitante-vista-tramos-1-24")
  if (await vista124.count()) {
    await vista124.check()
    await sleep(3500)
    await vista124.uncheck()
    await sleep(3500)
  }

  // Leyenda
  await page.mouse.move(400, 320)
  await sleep(2500)

  // No consolidado
  const noConsolidado = page.locator("#visitante-consolidado")
  if (await noConsolidado.count()) {
    await noConsolidado.check()
    await sleep(4000)
  }

  const puntos = page.locator("#visitante-mostrar-puntos-avance")
  if (await puntos.count()) {
    await puntos.check()
    await sleep(2000)
  }

  // Zoom on map center + wheel
  const map = page.locator(".leaflet-container")
  const box = await map.boundingBox()
  if (box) {
    const cx = box.x + box.width * 0.55
    const cy = box.y + box.height * 0.5
    await page.mouse.move(cx, cy)
    await sleep(1000)
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, -400)
      await sleep(800)
    }
    await sleep(5000)
  }

  // Click map for modal
  if (box) {
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.45)
    await sleep(2500)
    const cerrar = page.getByRole("button", { name: /Cerrar/i })
    if (await cerrar.count()) {
      await cerrar.click()
      await sleep(1500)
    }
  }

  // Fullscreen if present
  const fsBtn = page.getByRole("button", { name: /pantalla completa|expandir/i })
  if (await fsBtn.count()) {
    await fsBtn.first().click()
    await sleep(2500)
  }

  await page.mouse.move(700, 200)
  await sleep(3000)

  console.log("Demo automation finished")
  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
