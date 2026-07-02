const MAX_INFORME_DIMENSION = 960
const INFORME_JPEG_QUALITY = 0.55

const urlCache = new Map<string, string>()

async function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality)
  })
}

export async function comprimirBlobParaInforme(blob: Blob): Promise<Blob> {
  if (!blob.type.startsWith("image/")) {
    return blob
  }

  const imageBitmap = await createImageBitmap(blob)
  const { width, height } = imageBitmap
  const largestSide = Math.max(width, height)
  const scale =
    largestSide > MAX_INFORME_DIMENSION ? MAX_INFORME_DIMENSION / largestSide : 1
  const targetWidth = Math.max(1, Math.round(width * scale))
  const targetHeight = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = targetWidth
  canvas.height = targetHeight

  const context = canvas.getContext("2d")
  if (!context) {
    imageBitmap.close()
    return blob
  }

  context.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight)
  imageBitmap.close()

  const jpegBlob = await canvasToJpegBlob(canvas, INFORME_JPEG_QUALITY)
  return jpegBlob ?? blob
}

export async function obtenerUrlImagenComprimidaInforme(url: string): Promise<string> {
  const cached = urlCache.get(url)
  if (cached) return cached

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("No se pudo cargar la imagen para comprimir.")
  }

  const original = await response.blob()
  const comprimida = await comprimirBlobParaInforme(original)
  const objectUrl = URL.createObjectURL(comprimida)
  urlCache.set(url, objectUrl)
  return objectUrl
}

export function esperarImagenesInformeListas(timeoutMs = 90_000): Promise<void> {
  return new Promise((resolve) => {
    const inicio = Date.now()

    const verificar = () => {
      const imagenes = document.querySelectorAll<HTMLImageElement>(".libro-obra-imagen")
      if (imagenes.length === 0) {
        resolve()
        return
      }

      const todasListas = [...imagenes].every(
        (imagen) => imagen.dataset.informeImagenLista === "true" && imagen.complete
      )

      if (todasListas) {
        resolve()
        return
      }

      if (Date.now() - inicio >= timeoutMs) {
        resolve()
        return
      }

      window.setTimeout(verificar, 200)
    }

    verificar()
  })
}
