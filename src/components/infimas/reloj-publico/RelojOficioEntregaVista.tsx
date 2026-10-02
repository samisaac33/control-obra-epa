import type { RelojPublicoCartaData } from "@/src/data/infimas/reloj-publico-types"

type Props = {
  data: RelojPublicoCartaData
}

export function RelojOficioEntregaVista({ data }: Props) {
  const { contrato, periodo, fechaCarta } = data
  const destinatarioCargo = contrato.administrador.cargoLineas.join(" ")

  return (
    <article className="mx-auto max-w-[210mm] bg-white px-[2.54cm] py-[2.54cm] font-serif text-[12pt] leading-normal text-black shadow-sm ring-1 ring-neutral-200">
      <p className="mb-6">{fechaCarta}</p>
      <p className="mb-6 whitespace-pre-line font-bold leading-snug">
        {contrato.administrador.nombre}
        {"\n"}
        {destinatarioCargo}
      </p>
      <p className="mb-4 text-justify">
        Por medio de la presente hago la entrega del informe de los servicios de mantenimiento
        preventivo y correctivo durante el periodo {periodo.fechasTexto.periodoLargo},
        correspondiente al {contrato.objetoContractual}.
      </p>
      <p className="mb-4 text-justify">Atentamente,</p>
      <div className="mt-12">
        <p className="font-bold">{contrato.proveedor.nombre}</p>
        <p>{contrato.proveedor.ruc}</p>
      </div>
    </article>
  )
}
