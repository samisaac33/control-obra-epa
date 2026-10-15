import type { RelojPublicoInformeData } from "@/src/data/infimas/reloj-publico-types"

type Props = {
  data: RelojPublicoInformeData
}

export function RelojInformeActividadesVista({ data }: Props) {
  const { contrato, periodo, fechaCarta } = data

  return (
    <article className="mx-auto max-w-[210mm] bg-white px-[2.54cm] py-[2.54cm] font-serif text-[12pt] leading-normal text-black shadow-sm ring-1 ring-neutral-200">
      <p className="mb-6">{fechaCarta}</p>
      <p className="mb-6 whitespace-pre-line font-bold leading-snug">
        {contrato.administrador.nombre}
        {"\n"}
        Administrador del contrato
        {"\n"}
        Gobierno Provincial de Manabí
      </p>
      <p className="mb-6 text-justify">
        Por medio del presente, hago entrega de los informes del {contrato.objetoContractual}{" "}
        {periodo.fechasTexto.periodoLargo}.
      </p>

      <table className="mb-8 w-full border-collapse border border-black text-[10pt] leading-snug">
        <thead>
          <tr className="bg-neutral-100">
            <th className="border border-black p-1 text-left font-bold">SEMANA</th>
            <th className="border border-black p-1 font-bold">AÑO</th>
            <th className="border border-black p-1 text-left font-bold">ACTIVIDAD</th>
            <th className="border border-black p-1 text-left font-bold">OBSERVACIÓN</th>
          </tr>
        </thead>
        <tbody>
          {periodo.filasInforme.map((fila) => (
            <tr key={fila.semanaLabel}>
              <td className="border border-black p-1 align-top">{fila.semanaLabel}</td>
              <td className="border border-black p-1 text-center align-top">{fila.anio}</td>
              <td className="whitespace-pre-line border border-black p-1 align-top">{fila.actividad}</td>
              <td className="whitespace-pre-line border border-black p-1 align-top">{fila.observacion}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-4 font-bold">ATENTAMENTE</p>
      <div className="mt-8">
        <p className="font-bold">{contrato.proveedor.nombre}</p>
        <p>{contrato.proveedor.ruc}</p>
      </div>
    </article>
  )
}
