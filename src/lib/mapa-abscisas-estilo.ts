import type { PathOptions } from "leaflet"

import type { EstadoAbscisaCanal } from "@/src/data/auditoria/types"

export function estiloAbscisaEnMapa(estado: EstadoAbscisaCanal, seleccionada = false): PathOptions {
  const peso = seleccionada ? 6 : 4
  switch (estado) {
    case "pendiente":
      return { color: "#64748b", weight: peso, opacity: 0.85, lineCap: "round" }
    case "en_proceso":
      return { color: "#f59e0b", weight: peso, opacity: 0.95, lineCap: "round" }
    case "ejecutado":
    case "conciliado_fiscalizacion":
      return { color: "#16a34a", weight: peso, opacity: 0.95, lineCap: "round" }
    default:
      return { color: "#64748b", weight: peso, opacity: 0.85 }
  }
}
