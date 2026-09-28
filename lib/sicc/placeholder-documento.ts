/** Estilos compartidos para documentos con datos [[sustituir]]. */
export const ESTILOS_DOCUMENTO_CALIDAD = `
  .doc-calidad {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size: 12px;
    line-height: 1.45;
    color: #111;
    max-width: 52rem;
  }
  .doc-calidad h1 { font-size: 1.15rem; margin: 0 0 0.75rem; }
  .doc-calidad h2 { font-size: 1rem; margin: 1.25rem 0 0.5rem; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; }
  .doc-calidad p { margin: 0.4rem 0; }
  .doc-calidad .leyenda {
    background: #fef9c3;
    border: 1px solid #eab308;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 11px;
  }
  .doc-calidad .dato-sustituir {
    background-color: #fef08a;
    padding: 0 0.15em;
    border-radius: 2px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .doc-calidad table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.75rem 0;
    font-size: 11px;
  }
  .doc-calidad th, .doc-calidad td {
    border: 1px solid #bbb;
    padding: 0.35rem 0.5rem;
    text-align: left;
    vertical-align: top;
  }
  .doc-calidad th { background: #f4f4f5; }
  .doc-calidad .meta { color: #444; font-size: 11px; }
  .doc-calidad .seccion-doc {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 2px dashed #999;
  }
  @media print {
    .doc-calidad { font-size: 10px; }
    .doc-calidad .leyenda, .doc-calidad .dato-sustituir {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`

const PLACEHOLDER_RE = /\[\[([\s\S]*?)\]\]/g

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Convierte [[texto]] en <mark> amarillo conservando corchetes. */
export function aplicarMarcadoresPlaceholder(texto: string): string {
  let ultimo = 0
  let out = ""
  for (const match of texto.matchAll(PLACEHOLDER_RE)) {
    const index = match.index ?? 0
    out += escaparHtml(texto.slice(ultimo, index))
    const interior = match[1]
    out += `<mark class="dato-sustituir">[[${escaparHtml(interior)}]]</mark>`
    ultimo = index + match[0].length
  }
  out += escaparHtml(texto.slice(ultimo))
  return out.replace(/\n/g, "<br />")
}

export function leyendaPlaceholderHtml(): string {
  return `<p class="leyenda"><strong>Leyenda:</strong> el texto resaltado en <mark class="dato-sustituir">[[ amarillo ]]</mark> es un <em>ejemplo ficticio</em>. Reemplácelo con datos reales de campo, placas de identificación y certificados antes de enviar a fiscalización.</p>`
}

export function envolverDocumentoCalidad(titulo: string, bodyHtml: string): string {
  const tituloSeguro = escaparHtml(titulo)
  return `<article class="doc-calidad"><h1>${tituloSeguro}</h1>${leyendaPlaceholderHtml()}${bodyHtml}</article>`
}

/** Texto con [[...]] → párrafo HTML. */
export function parrafo(texto: string): string {
  return `<p>${aplicarMarcadoresPlaceholder(texto)}</p>`
}

export function filaTabla(celdas: string[]): string {
  return `<tr>${celdas.map((c) => `<td>${aplicarMarcadoresPlaceholder(c)}</td>`).join("")}</tr>`
}

export function encabezadoTabla(celdas: string[]): string {
  return `<tr>${celdas.map((c) => `<th>${escaparHtml(c)}</th>`).join("")}</tr>`
}
