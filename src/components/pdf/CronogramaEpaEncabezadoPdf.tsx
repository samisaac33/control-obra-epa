import { Image, Text, View } from "@react-pdf/renderer"

import type { LogosCronogramaEpaPdf } from "@/lib/planilla/cronograma-epa-logos-pdf"
import {
  formatearFechaContratoEpa,
  montoContratoCeldasEpa,
} from "@/src/components/planilla/CronogramaEpaEncabezadoTabla"
import type { EncabezadoCronogramaEpa } from "@/src/lib/planilla-cronograma-epa"

import { CRONOGRAMA_EPA_COLORS, cronogramaEpaPdfStyles as styles } from "./cronogramaEpaPdfStyles"

type Props = {
  encabezado: EncabezadoCronogramaEpa
  logos: LogosCronogramaEpaPdf
}

function MetaCell({
  flex,
  children,
  bold,
  alignRight,
  last,
}: {
  flex: number
  children: string
  bold?: boolean
  alignRight?: boolean
  last?: boolean
}) {
  const cellStyle = [
    last ? styles.encCellLast : styles.encCell,
    { flex },
    ...(bold ? [{ fontFamily: "Helvetica-Bold" as const }] : []),
    ...(alignRight ? [{ textAlign: "right" as const }] : []),
  ]

  return (
    <View style={cellStyle}>
      <Text>{children}</Text>
    </View>
  )
}

function MetaRow4({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  rightMid,
  last,
}: {
  leftLabel: string
  leftValue: string
  rightLabel: string
  rightValue: string
  rightMid?: string
  last?: boolean
}) {
  return (
    <View style={last ? styles.encMetaRowLast : styles.encMetaRow}>
      <MetaCell flex={11} bold>
        {leftLabel}
      </MetaCell>
      <MetaCell flex={15}>{leftValue}</MetaCell>
      <MetaCell flex={16} bold>
        {rightLabel}
      </MetaCell>
      {rightMid !== undefined ? (
        <>
          <MetaCell flex={2}>{rightMid}</MetaCell>
          <MetaCell flex={12} alignRight last>
            {rightValue}
          </MetaCell>
        </>
      ) : (
        <MetaCell flex={14} last>
          {rightValue}
        </MetaCell>
      )}
    </View>
  )
}

export function CronogramaEpaEncabezadoPdf({ encabezado: e, logos }: Props) {
  const monto = montoContratoCeldasEpa(e.montoContratoUsd)

  return (
    <View style={styles.encabezadoWrap}>
      <View style={styles.encTitleRow}>
        <Text style={styles.encTituloDoc}>{e.tituloVertical}</Text>
      </View>
      <View style={styles.encTitleRow}>
        <Text style={styles.encObjeto}>{e.objeto}</Text>
      </View>

      <View style={styles.encMetaBlock}>
        <View style={styles.encLogoCol}>
          <Image src={logos.epa} style={styles.logoEpaEnc} />
        </View>
        <View style={styles.encMetaCenter}>
          <MetaRow4
            leftLabel="CONTRATISTA:"
            leftValue={e.contratista}
            rightLabel="Monto Contrato USD:"
            rightMid={monto.simbolo}
            rightValue={monto.valor}
          />
          <MetaRow4
            leftLabel="FISCALIZADOR:"
            leftValue={e.fiscalizador}
            rightLabel="N° de Contrato"
            rightValue={e.numeroContrato}
          />
          <MetaRow4
            leftLabel="ADMINISTRADOR:"
            leftValue={e.administrador}
            rightLabel="Fecha de Inicio de contrato"
            rightValue={formatearFechaContratoEpa(e.fechaInicioContrato)}
          />
          <MetaRow4
            leftLabel="PLANILLA N°"
            leftValue={e.planillaEtiqueta ?? ""}
            rightLabel="Fecha de Finalización de contrato"
            rightValue={formatearFechaContratoEpa(e.fechaFinContrato)}
            last
          />
        </View>
        <View style={styles.encLogoCol}>
          <Image src={logos.consorcio} style={styles.logoConsorcioEnc} />
        </View>
      </View>
    </View>
  )
}
