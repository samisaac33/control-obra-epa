import type { RegistroFotoBase } from "@/src/lib/evidencias-grupo"

function slugifyNombreArchivo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 100)
}

function extensionDesdeRuta(imagePath: string): string {
  const extension = imagePath.split(".").pop()?.toLowerCase()
  if (extension && /^[a-z0-9]{2,5}$/.test(extension)) {
    return extension
  }
  return "jpg"
}

export function nombreArchivoEvidencia(
  imagen: Pick<RegistroFotoBase, "image_path" | "actividad_especifica">,
  indice: number,
  sector: string,
  totalImagenes = 1
): string {
  const extension = extensionDesdeRuta(imagen.image_path)
  const actividad = imagen.actividad_especifica?.trim()

  const base =
    (actividad ? slugifyNombreArchivo(actividad) : "") ||
    slugifyNombreArchivo(sector) ||
    "evidencia-obra"

  const sufijo = totalImagenes > 1 ? `-foto-${indice + 1}` : ""

  return `${base}${sufijo}.${extension}`
}

export async function descargarImagenEvidencia(
  imageUrl: string,
  nombreArchivo: string
): Promise<void> {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error("No se pudo descargar la imagen.")
  }

  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  const enlace = document.createElement("a")
  enlace.href = blobUrl
  enlace.download = nombreArchivo
  enlace.rel = "noopener"
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(blobUrl)
}
