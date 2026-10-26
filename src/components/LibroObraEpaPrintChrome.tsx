import { LibroObraEpaBarraLogos } from "@/src/components/LibroObraEpaCabecera"

/** Una sola cabecera/máscara en impresión (evita páginas en blanco por N× fixed). */
export function LibroObraEpaPrintChrome() {
  return (
    <>
      <div className="libro-obra-epa-cabecera-print-global" aria-hidden>
        <LibroObraEpaBarraLogos />
      </div>
      <div className="libro-obra-epa-mascara-pie-global" aria-hidden />
    </>
  )
}
