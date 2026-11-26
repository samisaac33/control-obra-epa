/** Fila para plantilla SRI «carga masiva de productos» (Facturador). */
export type SriProductoFacturacion = {
  codigoPrincipal: string
  codigoAuxiliar?: string
  descripcion: string
  informacionAdicional?: string
  /** Precio unitario sin IVA (USD). */
  precioUnitario: number
  /** Código tarifa IVA SRI (p. ej. 4 = 15 %). */
  tarifaIva: number
  gravaIce?: "SI" | "NO"
  codigoIce?: number
  turismo?: "Si" | "No"
}