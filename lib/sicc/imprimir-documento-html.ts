import { ESTILOS_DOCUMENTO_CALIDAD } from "@/lib/sicc/placeholder-documento"

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function construirHtmlImprimible(titulo: string, contenidoTextoPlano: string): string {
  const cuerpo = escaparHtml(contenidoTextoPlano)
  const tituloSeguro = escaparHtml(titulo)
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${tituloSeguro}</title>
    <style>
      body {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 11px;
        line-height: 1.5;
        padding: 1.25rem;
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: #111;
        background: #fff;
      }
      @media print {
        body { padding: 0.5rem; }
      }
    </style>
  </head>
  <body>${cuerpo}</body>
</html>`
}

function imprimirEnIframe(html: string): void {
  const iframe = document.createElement("iframe")
  iframe.setAttribute("title", "Vista de impresión")
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "0"
  iframe.style.opacity = "0"
  iframe.style.pointerEvents = "none"
  document.body.appendChild(iframe)

  const ventanaIframe = iframe.contentWindow
  const doc = iframe.contentDocument ?? ventanaIframe?.document
  if (!doc || !ventanaIframe) {
    iframe.remove()
    return
  }

  doc.open()
  doc.write(html)
  doc.close()

  const lanzarImpresion = () => {
    ventanaIframe.focus()
    ventanaIframe.print()
    window.setTimeout(() => iframe.remove(), 1000)
  }

  if (doc.readyState === "complete") {
    window.setTimeout(lanzarImpresion, 50)
  } else {
    iframe.onload = () => window.setTimeout(lanzarImpresion, 50)
  }
}

function usarImpresionEnPagina(): boolean {
  if (typeof window === "undefined") return false
  const pantallaPequena = window.matchMedia("(max-width: 768px)").matches
  const punteroTactil = window.matchMedia("(pointer: coarse)").matches
  return pantallaPequena || punteroTactil
}

function lanzarImpresionHtml(html: string): void {
  if (usarImpresionEnPagina()) {
    imprimirEnIframe(html)
    return
  }

  const blob = new Blob([html], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const ventana = window.open(url, "_blank")
  if (ventana) {
    const imprimirVentana = () => {
      try {
        ventana.focus()
        ventana.print()
      } catch {
        imprimirEnIframe(html)
      } finally {
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      }
    }
    window.setTimeout(imprimirVentana, 300)
    return
  }
  URL.revokeObjectURL(url)
  imprimirEnIframe(html)
}

/** Página HTML completa para documentos de calidad (tablas + marcadores amarillos). */
export function construirHtmlDocumentoCalidad(titulo: string, contenidoHtml: string): string {
  const tituloSeguro = escaparHtml(titulo)
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${tituloSeguro}</title>
    <style>
      body { margin: 0; padding: 1.25rem; background: #fff; }
      ${ESTILOS_DOCUMENTO_CALIDAD}
    </style>
  </head>
  <body>${contenidoHtml}</body>
</html>`
}

/** Imprime HTML ya formateado (p. ej. desde envolverDocumentoCalidad). */
export function imprimirDocumentoHtml(titulo: string, contenidoHtml: string): void {
  if (typeof window === "undefined") return
  lanzarImpresionHtml(construirHtmlDocumentoCalidad(titulo, contenidoHtml))
}

/**
 * Abre diálogo de impresión con texto plano preformateado.
 * Evita `window.open("", …, "noopener")` + `document.write`, que en Safari móvil
 * deja `about:blank` sin contenido.
 */
export function imprimirDocumentoTextoPlano(titulo: string, contenidoTextoPlano: string): void {
  if (typeof window === "undefined") return

  lanzarImpresionHtml(construirHtmlImprimible(titulo, contenidoTextoPlano))
}
