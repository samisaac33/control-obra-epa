/** Estilos RGB/hex para html2canvas (Tailwind v4 usa lab/oklch, no soportado). */
export const CSS_CAPTURA_PDF_LIBRO_OBRA = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #ffffff; color: #0a0a0a; font-family: ui-sans-serif, system-ui, sans-serif; }
  #libro-obra-documento { background: #ffffff; color: #0a0a0a; max-width: 210mm; }
  .libro-obra-hoja-epa { background: #ffffff; page-break-after: always; break-after: page; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #171717; padding: 2px 4px; font-size: 9px; line-height: 1.2; vertical-align: middle; }
  th { background: #f5f5f5; font-weight: 600; text-transform: uppercase; font-size: 8px; }
  img { max-width: 100%; height: auto; object-fit: contain; }
  h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 0; }
  p { margin: 0 0 2px; }
  .border-neutral-900 { border-color: #171717 !important; }
  .bg-white { background: #ffffff !important; }
  .bg-neutral-100 { background: #f5f5f5 !important; }
  .text-neutral-950 { color: #0a0a0a !important; }
`

export function prepararDocumentoClonadoParaPdf(doc: Document): void {
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((n) => n.remove())
  doc.querySelectorAll("style").forEach((n) => n.remove())
  const style = doc.createElement("style")
  style.textContent = CSS_CAPTURA_PDF_LIBRO_OBRA
  doc.head.appendChild(style)
}
