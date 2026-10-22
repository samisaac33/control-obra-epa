import { WATERMARK_PROYECTO_LINEA } from "@/src/data/contrato-emergencia-severino-trasvase"

export type LineasWatermark = {
  lineaProyecto?: string
  frente: string
  abscisa: string
  lat: number | null
  lng: number | null
  fecha: Date
}

function formatearFechaWatermark(fecha: Date): string {
  return fecha.toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export async function aplicarWatermarkEnImagen(
  file: File,
  lineas: LineasWatermark
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement("canvas")
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("No se pudo preparar el canvas.")

  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  const coord =
    lineas.lat != null && lineas.lng != null
      ? `${lineas.lat.toFixed(6)}, ${lineas.lng.toFixed(6)}`
      : "S/GPS"

  const textos = [
    lineas.lineaProyecto ?? WATERMARK_PROYECTO_LINEA,
    `FRENTE: ${lineas.frente} | ABSCISA: ${lineas.abscisa}`,
    `COORD: ${coord} | FECHA: ${formatearFechaWatermark(lineas.fecha)}`,
  ]

  const padding = Math.max(8, Math.round(canvas.height * 0.012))
  const fontSize = Math.max(14, Math.round(canvas.width * 0.022))
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`
  const lineHeight = fontSize * 1.35
  const bandHeight = padding * 2 + lineHeight * textos.length

  ctx.fillStyle = "rgba(0, 0, 0, 0.55)"
  ctx.fillRect(0, canvas.height - bandHeight, canvas.width, bandHeight)

  ctx.fillStyle = "#ffffff"
  textos.forEach((t, i) => {
    ctx.fillText(t, padding, canvas.height - bandHeight + padding + fontSize + i * lineHeight)
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("No se pudo exportar la imagen."))
        else resolve(blob)
      },
      "image/jpeg",
      0.88
    )
  })
}
