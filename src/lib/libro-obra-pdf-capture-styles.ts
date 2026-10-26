/** Respaldo mínimo si falla algún estilo inline. */
export const CSS_CAPTURA_PDF_LIBRO_OBRA = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #ffffff; }
  .libro-obra-hoja-epa { background: #ffffff; }
  table { border-collapse: collapse; }
  img { max-width: 100%; height: auto; object-fit: contain; }
`

const PROPIEDADES_CAPTURA = [
  "display",
  "flexDirection",
  "flexWrap",
  "alignItems",
  "justifyContent",
  "alignSelf",
  "flex",
  "flexShrink",
  "flexGrow",
  "gap",
  "gridTemplateColumns",
  "gridColumn",
  "width",
  "height",
  "minHeight",
  "maxWidth",
  "margin",
  "marginTop",
  "marginBottom",
  "padding",
  "paddingTop",
  "paddingBottom",
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderCollapse",
  "fontSize",
  "fontWeight",
  "fontFamily",
  "lineHeight",
  "textAlign",
  "textTransform",
  "letterSpacing",
  "whiteSpace",
  "verticalAlign",
  "objectFit",
  "overflow",
  "position",
  "top",
  "left",
  "color",
  "backgroundColor",
  "borderColor",
] as const

/** Copia layout/colores resueltos (rgb) al clon; evita depender de Tailwind lab/oklch en el clon. */
export function aplicarEstilosCalculadosAlClon(origen: HTMLElement, clon: HTMLElement): void {
  const cs = window.getComputedStyle(origen)

  for (const prop of PROPIEDADES_CAPTURA) {
    const valor = cs[prop as keyof CSSStyleDeclaration]
    if (typeof valor === "string" && valor) {
      clon.style.setProperty(
        prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
        valor
      )
    }
  }

  const origenHijos = [...origen.children].filter((n): n is HTMLElement => n instanceof HTMLElement)
  const clonHijos = [...clon.children].filter((n): n is HTMLElement => n instanceof HTMLElement)

  for (let i = 0; i < Math.min(origenHijos.length, clonHijos.length); i++) {
    aplicarEstilosCalculadosAlClon(origenHijos[i], clonHijos[i])
  }
}

export function prepararDocumentoClonadoParaPdf(doc: Document): void {
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((n) => n.remove())
  doc.querySelectorAll("style").forEach((n) => n.remove())
  const style = doc.createElement("style")
  style.textContent = CSS_CAPTURA_PDF_LIBRO_OBRA
  doc.head.appendChild(style)
}
