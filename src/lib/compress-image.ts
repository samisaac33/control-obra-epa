const MAX_IMAGE_DIMENSION = 1280
const WEBP_QUALITY = 0.65
const JPEG_QUALITY = 0.68

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/webp" | "image/jpeg",
  quality: number
): Promise<Blob | null> {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })
}

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file
  }

  const imageBitmap = await createImageBitmap(file)
  const { width, height } = imageBitmap
  const largestSide = Math.max(width, height)
  const scale = largestSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / largestSide : 1
  const targetWidth = Math.max(1, Math.round(width * scale))
  const targetHeight = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = targetWidth
  canvas.height = targetHeight

  const context = canvas.getContext("2d")
  if (!context) {
    return file
  }

  context.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight)
  imageBitmap.close()

  const webpBlob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY)
  const jpegBlob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY)

  const selectedBlob = [webpBlob, jpegBlob]
    .filter((item): item is Blob => Boolean(item))
    .sort((a, b) => a.size - b.size)[0]

  if (!selectedBlob) {
    return file
  }

  const outputExtension = selectedBlob.type === "image/webp" ? ".webp" : ".jpg"
  const compressedName = file.name.replace(/\.[^.]+$/, "") + outputExtension

  return new File([selectedBlob], compressedName, {
    type: selectedBlob.type,
    lastModified: Date.now(),
  })
}
