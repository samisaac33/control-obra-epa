/** Estilos hex para html2canvas (Tailwind v4 usa lab/oklch, no soportado). */
export const CSS_CAPTURA_PDF_LIBRO_OBRA = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #ffffff; color: #0a0a0a; font-family: ui-sans-serif, system-ui, sans-serif; }
  .libro-obra-hoja-epa { background: #ffffff; color: #0a0a0a; width: 190mm; max-width: 190mm; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #171717; padding: 2px 4px; font-size: 9px; line-height: 1.2; vertical-align: middle; }
  th { background: #f5f5f5; font-weight: 600; text-transform: uppercase; font-size: 8px; }
  img { max-width: 100%; height: auto; object-fit: contain; display: block; }
  h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 0; color: #0a0a0a; }
  p { margin: 0 0 2px; color: #0a0a0a; }
  div { color: #0a0a0a; }
`

export function prepararDocumentoClonadoParaPdf(doc: Document): void {
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((n) => n.remove())
  doc.querySelectorAll("style").forEach((n) => n.remove())
  const style = doc.createElement("style")
  style.textContent = CSS_CAPTURA_PDF_LIBRO_OBRA
  doc.head.appendChild(style)
}
