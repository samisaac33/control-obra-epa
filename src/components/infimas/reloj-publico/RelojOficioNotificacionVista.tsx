import type { RelojPublicoCartaData } from "@/src/data/infimas/reloj-publico-types"

type Props = {
  data: RelojPublicoCartaData
}

export function RelojOficioNotificacionVista({ data }: Props) {
  const { contrato, periodo, fechaCarta } = data

  return (
    <article className="mx-auto max-w-[210mm] bg-white px-[2.54cm] py-[2.54cm] font-serif text-[12pt] leading-normal text-black shadow-sm ring-1 ring-neutral-200">
      <p className="mb-6">{fechaCarta}</p>
      <p className="mb-6 whitespace-pre-line font-bold leading-snug">
        {contrato.administrador.nombre}
        {"\n"}
        {contrato.administrador.cargoLineas.join("\n")}
      </p>
      <p className="mb-6">Ciudad.-</p>
      <p className="mb-4 text-justify">De mi consideración:</p>
      <p className="mb-4 text-justify">
        Por medio del presente documento notifico que procederé a ejecutar las actividades de
        mantenimiento preventivo y correctivo del reloj público, correspondientes al periodo{" "}
        {periodo.fechasTexto.periodoLargo}, en el marco de la orden de compra {contrato.codigo}. Informo
        que, una vez culminado dicho periodo, remitiré la documentación respectiva solicitando
        que se reciba el servicio entregado a conformidad.
      </p>
      <p className="mb-4 text-justify">Atentamente,</p>
      <div className="mt-12">
        <p className="font-bold">{contrato.proveedor.nombre}</p>
        <p>{contrato.proveedor.ruc}</p>
      </div>
    </article>
  )
}
