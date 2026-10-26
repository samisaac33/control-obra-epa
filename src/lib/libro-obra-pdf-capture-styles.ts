/** Estilos hex-only: html2canvas no soporta lab/oklch (Safari/Tailwind v4). */
export const CSS_CAPTURA_PDF_LIBRO_OBRA = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #ffffff; color: #0a0a0a; font-family: ui-sans-serif, system-ui, sans-serif; }
  .libro-obra-hoja-epa {
    background: #ffffff;
    color: #0a0a0a;
    width: 100%;
    max-width: 190mm;
  }
  table { border-collapse: collapse; width: 100%; }
  th, td {
    border: 1px solid #171717;
    padding: 2px 4px;
    font-size: 9px;
    line-height: 1.2;
    vertical-align: middle;
    color: #0a0a0a;
    background: #ffffff;
  }
  th {
    background: #f5f5f5;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 8px;
  }
  img { max-width: 100%; height: auto; object-fit: contain; display: block; }
  h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 0; color: #0a0a0a; }
  p { margin: 0 0 2px; color: #0a0a0a; }
  div { color: #0a0a0a; }
  span { color: inherit; }
`

const PROPIEDADES_LAYOUT = [
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
] as const

const PROPIEDADES_COLOR = [
  "color",
  "backgroundColor",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
] as const

const PROPIEDADES_BORDE = [
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderWidth",
  "borderStyle",
] as const

const COLOR_MODERNO = /(oklch|oklab|lab|lch|color)\(/i

function camelAKebab(prop: string): string {
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

/** Safari a menudo entrega lab(); el canvas del navegador lo convierte a rgb/hex. */
export function colorCssARgb(valor: string): string {
  const limpio = valor.trim()
  if (!limpio || limpio === "transparent" || limpio === "rgba(0, 0, 0, 0)") {
    return "transparent"
  }
  if (!COLOR_MODERNO.test(limpio) && !limpio.startsWith("color(")) {
    return limpio
  }
  try {
    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext("2d")
    if (!ctx) return "#0a0a0a"
    ctx.fillStyle = "#0a0a0a"
    ctx.fillStyle = limpio
    return String(ctx.fillStyle)
  } catch {
    return "#0a0a0a"
  }
}

function extraerFuncionesColor(valor: string): { start: number; end: number; text: string }[] {
  const partes: { start: number; end: number; text: string }[] = []
  const re = /(oklch|oklab|lab|lch|color)\(/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(valor)) !== null) {
    const start = match.index
    let depth = 0
    let i = start
    for (; i < valor.length; i++) {
      const ch = valor[i]
      if (ch === "(") depth++
      else if (ch === ")") {
        depth--
        if (depth === 0) {
          i++
          break
        }
      }
    }
    partes.push({ start, end: i, text: valor.slice(start, i) })
    re.lastIndex = i
  }
  return partes
}

export function sanitizarValorCss(valor: string): string {
  if (!COLOR_MODERNO.test(valor)) return valor
  let out = valor
  const partes = extraerFuncionesColor(valor)
  for (let p = partes.length - 1; p >= 0; p--) {
    const { start, end, text } = partes[p]
    out = `${out.slice(0, start)}${colorCssARgb(text)}${out.slice(end)}`
  }
  return out
}

function setEstilo(el: HTMLElement, prop: string, valor: string): void {
  el.style.setProperty(camelAKebab(prop), valor)
}

/** Copia layout del DOM real; colores solo en rgb/hex (nunca lab/oklch). */
export function aplicarEstilosCalculadosAlClon(origen: HTMLElement, clon: HTMLElement): void {
  const cs = window.getComputedStyle(origen)

  for (const prop of PROPIEDADES_LAYOUT) {
    const valor = cs[prop as keyof CSSStyleDeclaration]
    if (typeof valor === "string" && valor) {
      setEstilo(clon, prop, sanitizarValorCss(valor))
    }
  }

  for (const prop of PROPIEDADES_BORDE) {
    const valor = cs[prop as keyof CSSStyleDeclaration]
    if (typeof valor === "string" && valor) {
      setEstilo(clon, prop, sanitizarValorCss(valor))
    }
  }

  for (const prop of PROPIEDADES_COLOR) {
    const valor = cs[prop as keyof CSSStyleDeclaration]
    if (typeof valor === "string" && valor) {
      setEstilo(clon, prop, colorCssARgb(valor))
    }
  }

  const origenHijos = [...origen.children].filter((n): n is HTMLElement => n instanceof HTMLElement)
  const clonHijos = [...clon.children].filter((n): n is HTMLElement => n instanceof HTMLElement)

  for (let i = 0; i < Math.min(origenHijos.length, clonHijos.length); i++) {
    aplicarEstilosCalculadosAlClon(origenHijos[i], clonHijos[i])
  }
}

/** Último pase: elimina cualquier lab/oklch residual en style="" del clon. */
export function sanitizarColoresEnClon(root: HTMLElement): void {
  const nodos: HTMLElement[] = [root, ...root.querySelectorAll<HTMLElement>("*")]
  for (const el of nodos) {
    if (!el.style || el.style.length === 0) continue
    for (let i = el.style.length - 1; i >= 0; i--) {
      const name = el.style.item(i)
      if (!name) continue
      const val = el.style.getPropertyValue(name)
      if (COLOR_MODERNO.test(val)) {
        el.style.setProperty(name, sanitizarValorCss(val), el.style.getPropertyPriority(name))
      }
    }
  }
}

export function prepararDocumentoClonadoParaPdf(doc: Document): void {
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((n) => n.remove())
  doc.querySelectorAll("style").forEach((n) => n.remove())
  const style = doc.createElement("style")
  style.textContent = CSS_CAPTURA_PDF_LIBRO_OBRA
  doc.head.appendChild(style)
}
