/** Helpers ejecutados en page.evaluate (mapa Leaflet expuesto en window). */

export async function mapaTieneHook(page) {
  return page.evaluate(() => Boolean(window.__mapaTramosLeaflet))
}

export async function fitBoundsRed(page) {
  return page.evaluate(() => {
    if (typeof window.__mapaCapacitacionFitBoundsRed === "function") {
      return window.__mapaCapacitacionFitBoundsRed()
    }
    return false
  })
}

export async function flyToMinitramos(page, { lat, lng, zoom }) {
  return page.evaluate(
    ({ lat, lng, zoom }) => {
      const map = window.__mapaTramosLeaflet
      if (!map) return false
      map.flyTo([lat, lng], zoom, { duration: 0.85 })
      return true
    },
    { lat, lng, zoom }
  )
}

export async function countMinitramoLabels(page) {
  return page.evaluate(
    () => document.querySelectorAll(".mapa-minitramo-distancia-etiqueta").length
  )
}

export async function salirPantallaCompleta(page) {
  const salir = page.getByRole("button", { name: /Salir de pantalla completa/i })
  if (await salir.count()) {
    await salir.click()
    return true
  }
  return false
}

export async function expandirPantallaCompleta(page) {
  const expandir = page.getByRole("button", { name: /Expandir mapa a pantalla completa/i })
  if (await expandir.count()) {
    await expandir.click()
    return true
  }
  return false
}

export async function resetRedViaTogglePrimerLevantamiento(page) {
  await salirPantallaCompleta(page)
  await page.waitForTimeout(400)
  await page.evaluate(() => {
    const el = document.querySelector("#visitante-vista-tramos-1-24")
    if (!(el instanceof HTMLInputElement)) return
    if (!el.checked) el.click()
  })
  await page.waitForTimeout(650)
  await page.evaluate(() => {
    const el = document.querySelector("#visitante-vista-tramos-1-24")
    if (el instanceof HTMLInputElement && el.checked) el.click()
  })
  await page.waitForTimeout(900)
}

export async function mapBox(page) {
  const map = page.locator(".leaflet-container").first()
  if (!(await map.count())) return null
  return map.boundingBox()
}

export async function zoomInClicks(page, times) {
  const btn = page.locator(".leaflet-control-zoom-in").first()
  if (!(await btn.count())) return
  for (let i = 0; i < times; i++) {
    if (await btn.getAttribute("aria-disabled")) break
    await btn.click()
    await page.waitForTimeout(380)
  }
}

export async function zoomOutClicks(page, times) {
  const btn = page.locator(".leaflet-control-zoom-out").first()
  if (!(await btn.count())) return
  for (let i = 0; i < times; i++) {
    if (await btn.getAttribute("aria-disabled")) break
    await btn.click()
    await page.waitForTimeout(380)
  }
}

/** Restablece encuadre de red completa (hook o toggle visitante). */
export async function restablecerVistaRedCompleta(page) {
  const ok = await fitBoundsRed(page)
  if (ok) {
    await page.waitForTimeout(900)
    return
  }
  await resetRedViaTogglePrimerLevantamiento(page)
}

/** Acerca hasta etiquetas XXX m (flyTo calibrado o clics +). */
export async function acercarMinitramosTerminados(page, targets) {
  const fly = targets.flyToMinitramosTerminados
  const ui = targets.uiFallbackZoomInFromRed
  const flew = await flyToMinitramos(page, fly)
  if (flew) {
    await page.waitForTimeout(1200)
    return
  }
  await restablecerVistaRedCompleta(page)
  await zoomInClicks(page, ui?.zoomInClicks ?? 3)
  await page.waitForTimeout(800)
}

export async function alejarVistaRedCompleta(page, targets) {
  const ui = targets.uiFallbackZoomInFromRed
  const ok = await fitBoundsRed(page)
  if (ok) {
    await page.waitForTimeout(900)
    return
  }
  await zoomOutClicks(page, ui?.zoomOutClicks ?? 3)
  await page.waitForTimeout(600)
  await restablecerVistaRedCompleta(page)
}
