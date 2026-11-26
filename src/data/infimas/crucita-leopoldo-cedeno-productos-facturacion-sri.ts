import type { SriProductoFacturacion } from "@/src/data/infimas/sri-producto-facturacion-types"

/**
 * Productos para carga masiva en el Facturador SRI — O/C IC-EPA EP-052-2026.
 * Se completa a partir del PDF de la orden de compra / proforma CPC.
 */
export const PRODUCTOS_FACTURACION_SRI_CRUCITA_LEOPOLDO_CEDENO: SriProductoFacturacion[] =
  []

export const ARCHIVO_CARGA_MASIVA_PRODUCTOS_SRI_CRUCITA =
  "carga-masiva-productos-compuerta-leopoldo-cedeno-ic-epa-ep-052-2026.xls"

export const RUTA_PUBLICA_CARGA_MASIVA_PRODUCTOS_SRI_CRUCITA = `/infimas/${ARCHIVO_CARGA_MASIVA_PRODUCTOS_SRI_CRUCITA}`