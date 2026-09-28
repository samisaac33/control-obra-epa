import {
  NOMBRE_ARCHIVO_GUIA_PRACTICA_PDF,
  renderGuiaPracticaPdfBuffer,
} from "@/lib/sicc/guia-practica-pdf/render-guia-practica-pdf"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const buffer = await renderGuiaPracticaPdfBuffer()
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${NOMBRE_ARCHIVO_GUIA_PRACTICA_PDF}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Error al generar PDF guía práctica:", error)
    return new Response("Error al generar el PDF", { status: 500 })
  }
}
