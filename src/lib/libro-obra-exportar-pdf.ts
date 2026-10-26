import { prepararDocumentoClonadoParaPdf } from "@/src/lib/libro-obra-pdf-capture-styles"

async function esperarImagenesElemento(root: HTMLElement): Promise<void> {
  const imagenes = [...root.querySelectorAll("img")]
  await Promise.all(
    imagenes.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.addEventListener("load", () => resolve(), { once: true })
          img.addEventListener("error", () => resolve(), { once: true })
        })
    )
  )
}

export async function generarBlobPdfLibroObra(elemento: HTMLElement): Promise<Blob> {
  await esperarImagenesElemento(elemento)

  const html2pdf = (await import("html2pdf.js")).default

  return html2pdf()
    .set({
      margin: [6, 5, 6, 5],
      image: { type: "jpeg", quality: 0.94 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (doc) => {
          prepararDocumentoClonadoParaPdf(doc)
        },
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], after: ".libro-obra-hoja-epa" },
    })
    .from(elemento)
    .outputPdf("blob")
}

export async function entregarPdfLibroObra(blob: Blob, nombreArchivo: string): Promise<void> {
  const file = new File([blob], nombreArchivo, { type: "application/pdf" })

  if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "Libro de obra",
    })
    return
  }

  const url = URL.createObjectURL(blob)
  const enlace = document.createElement("a")
  enlace.href = url
  enlace.download = nombreArchivo
  enlace.rel = "noopener"
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

export function nombreArchivoLibroObra(desde: string, hasta: string): string {
  const d = desde || "periodo"
  const h = hasta || d
  return `libro-obra_${d}_${h}.pdf`.replace(/[^\w.-]+/g, "-")
}
