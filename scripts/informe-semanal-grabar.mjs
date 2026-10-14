/**
 * Graba player HTML 16:9 + opcional flash mapa. Requiere narración ya generada.
 * Uso: CAPACITACION_PIN=… DISPLAY=:1 node scripts/informe-semanal-grabar.mjs
 */
import { pathToFileURL } from "node:url"
import { chromium } from "playwright-core"

const PLAYER = `${pathToFileURL("/workspace/public/informe-semanal/2026-10-05/player.html").href}?autostart=1`
const NARRATION_MS = Number(process.env.INFORME_NARRATION_MS) || 59_000

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--start-maximized", "--lang=es-MX"],
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: "es-MX",
  })

  const page = await context.newPage()
  const t0 = Date.now()

  await page.goto(PLAYER, { waitUntil: "load" })
  await page.waitForFunction(() => window.__informeReady === true)
  await sleep(400)
  const syncStart = Date.now()
  console.log(`Player listo. Sincronización en t=${syncStart - t0}ms`)

  await sleep(NARRATION_MS)

  await page.close()
  await context.close()
  await browser.close()

  console.log(`Finalizado en ${Date.now() - t0}ms`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
