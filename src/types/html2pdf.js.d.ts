declare module "html2pdf.js" {
  export default function html2pdf(): unknown
}

declare module "html2canvas" {
  interface Html2CanvasOptions {
    scale?: number
    useCORS?: boolean
    logging?: boolean
    backgroundColor?: string
    onclone?: (document: Document, element: HTMLElement) => void
  }

  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>
  export default html2canvas
}
