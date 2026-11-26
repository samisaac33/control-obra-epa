import productosJson from "../../../data/infimas/crucita-leopoldo-cedeno-productos-sri.json"
import type { SriProductoFacturacion } from "@/src/data/infimas/sri-producto-facturacion-types"

export const PRODUCTOS_FACTURACION_SRI_CRUCITA_LEOPOLDO_CEDENO: SriProductoFacturacion[] =
  productosJson as SriProductoFacturacion[]

export const ARCHIVO_CARGA_MASIVA_PRODUCTOS_SRI_CRUCITA =
  "carga-masiva-productos-compuerta-leopoldo-cedeno-ic-epa-ep-052-2026.xls"

export const RUTA_PUBLICA_CARGA_MASIVA_PRODUCTOS_SRI_CRUCITA = `/infimas/${ARCHIVO_CARGA_MASIVA_PRODUCTOS_SRI_CRUCITA}`