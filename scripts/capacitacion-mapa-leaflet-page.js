/** Código ejecutado dentro del navegador (page.evaluate). */
export function getMapScript() {
  function getMap() {
    if (window.__mapaTramosLeaflet) return window.__mapaTramosLeaflet
    const container = document.querySelector(".leaflet-container")
    if (!container || !window.L) return null
    let el = container
    while (el) {
      // @ts-expect-error leaflet internal
      if (el._leaflet_map) return el._leaflet_map
      el = el.parentElement
    }
    // @ts-expect-error leaflet internal registry
    const maps = window.L.Map?._instances
    if (maps) {
      const values = Object.values(maps)
      if (values.length === 1) return values[0]
    }
    return null
  }

  function countMinitramoLabels() {
    return document.querySelectorAll(".mapa-minitramo-distancia-etiqueta").length
  }

  function fitBoundsFromLayers(maxZoom = 14) {
    const map = getMap()
    if (!map || !window.L) return false
    const bounds = window.L.latLngBounds([])
    document.querySelectorAll(".leaflet-interactive").forEach((path) => {
      try {
        // @ts-expect-error svg path
        const bb = path.getBBox?.()
        if (!bb || bb.width === 0) return
        const sw = map.containerPointToLatLng([bb.x, bb.y + bb.height])
        const ne = map.containerPointToLatLng([bb.x + bb.width, bb.y])
        bounds.extend(sw)
        bounds.extend(ne)
      } catch {
        /* ignore */
      }
    })
    if (!bounds.isValid()) return false
    map.fitBounds(bounds, { padding: [24, 24], maxZoom })
    return true
  }

  return { getMap, countMinitramoLabels, fitBoundsFromLayers }
}
