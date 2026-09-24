import type { InfimaInformeData, InfimaSeccion } from "@/src/data/infimas/types"

type InfimaInformeVistaProps = {
  informe: InfimaInformeData
}

function SeccionVista({ seccion, numero }: { seccion: InfimaSeccion; numero: number }) {
  return (
    <section className="space-y-3">
      <h2 className="text-center text-sm font-bold">
        {numero}. {seccion.titulo}
      </h2>
      {seccion.parrafos?.map((parrafo, index) => (
        <p key={index} className="text-justify">
          {parrafo}
        </p>
      ))}
      {seccion.items ? (
        <ul className="list-disc space-y-2 pl-8">
          {seccion.items.map((item, index) => (
            <li key={index} className="text-justify">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      {seccion.subsecciones?.map((sub, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-sm font-bold italic">
            {numero}.{index + 1}. {sub.titulo}
          </h3>
          {sub.parrafos?.map((parrafo, pIndex) => (
            <p key={pIndex} className="text-justify">
              {parrafo}
            </p>
          ))}
          {sub.items ? (
            <ul className="list-disc space-y-2 pl-8">
              {sub.items.map((item, iIndex) => (
                <li key={iIndex} className="text-justify">
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </section>
  )
}

export function InfimaInformeVista({ informe }: InfimaInformeVistaProps) {
  return (
    <article className="infima-informe-vista mx-auto max-w-[210mm] bg-white px-[2.54cm] py-[2.54cm] font-serif text-[12pt] leading-[2] text-black shadow-sm ring-1 ring-neutral-200">
      <h1 className="mb-6 text-center text-sm font-bold">{informe.titulo}</h1>

      <dl className="mb-6 space-y-1">
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-bold">FECHA:</dt>
          <dd>{informe.fecha}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-bold">PARA:</dt>
          <dd>{informe.para}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-bold">DE:</dt>
          <dd>{informe.de}</dd>
        </div>
        <div className="space-y-1">
          <dt className="font-bold">ASUNTO:</dt>
          <dd className="text-justify leading-normal">{informe.asunto}</dd>
        </div>
      </dl>

      <section className="mb-6 space-y-3">
        <h2 className="text-center text-sm font-bold">1. DATOS GENERALES DEL PROYECTO</h2>
        <table className="w-full border-collapse border border-neutral-300 text-[11pt] leading-normal">
          <tbody>
            {informe.datosGenerales.map((dato) => (
              <tr key={dato.etiqueta} className="border-b border-neutral-300 last:border-b-0">
                <th className="w-[38%] border-r border-neutral-300 bg-neutral-50 px-2 py-1.5 text-left align-top font-bold">
                  {dato.etiqueta}
                </th>
                <td className="px-2 py-1.5 text-justify align-top">{dato.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {informe.secciones.map((seccion, index) => (
        <SeccionVista key={seccion.titulo} seccion={seccion} numero={index + 2} />
      ))}

      {informe.anexosFotograficos.length > 0 ? (
        <section className="mt-8 space-y-6">
          <h2 className="text-center text-sm font-bold">7. ANEXO: REGISTRO FOTOGRÁFICO</h2>
          <p className="text-justify">
            A continuación, se presenta el registro fotográfico de las actividades ejecutadas
            durante la rehabilitación integral de la compuerta Leopoldo Cedeño.
          </p>
          <div className="space-y-8">
            {informe.anexosFotograficos.map((anexo) => (
              <figure key={anexo.numero} className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={anexo.archivo}
                  alt={`Figura ${anexo.numero}. ${anexo.descripcion}`}
                  className="mx-auto max-h-[480px] w-full max-w-full object-contain"
                />
                <figcaption className="text-center text-[11pt] leading-snug">
                  Figura {anexo.numero}. {anexo.descripcion}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="mt-10 space-y-1 break-before-page">
        <p>Atentamente,</p>
        <p className="pt-10">{informe.firma.nombre}</p>
        <p>{informe.firma.ruc}</p>
        <p>{informe.firma.cargo}</p>
      </footer>
    </article>
  )
}
