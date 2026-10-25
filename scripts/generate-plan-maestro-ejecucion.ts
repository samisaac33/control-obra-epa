/**
 * Genera docs/plan-maestro-ejecucion-desasolve-2026.md
 * npx tsx scripts/generate-plan-maestro-ejecucion.ts
 */
import fs from "node:fs"
import path from "node:path"

import {
  FECHA_INICIO_PLAZO_EJECUCION,
  FECHA_PAGO_ANTICIPO,
  PLAZO_CALENDARIO_DIAS,
  PORCENTAJE_ANTICIPO_CONTRATO,
  PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION,
  RADIO_DESALOJO_MAX_KM,
  RESOLUCION_EMERGENCIA,
} from "../src/data/contrato-emergencia-severino-trasvase"
import { PRESUPUESTO_OFERTA_SIN_IVA_USD } from "../src/data/planilla/presupuesto-desasolve-emergencia"
import { valoresPorDefectoPlanilla } from "../src/data/planilla/planilla-defaults-ejecucion"
import { PROYECTO_DESASOLVE_CANALES } from "../src/data/proyectos/catalog"
import { calcularPeriodosPlanilla } from "../src/lib/planilla-calculo"

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function diaSemana(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-EC", { weekday: "short" })
}

type DiaPlan = {
  fecha: string
  diaObra: number
  planilla: 1 | 2
  foco: string
  trasvase: string[]
  sanAntonio: string[]
  severino: string[]
  transversal: string[]
}

function tareasPorFase(diaObra: number): Omit<DiaPlan, "fecha" | "diaObra" | "planilla"> {
  if (diaObra <= 3) {
    return {
      foco: "Movilización y arranque formal",
      trasvase: [
        "Confirmar frentes prioritarios en mapa (tramos semana 1).",
        "Replanteo/nivelación km 0 en tramos de arranque (rub. 1).",
        "Excavadora DOOSAN + VOLVO: prueba de jornada, horómetro base.",
        "Volqueta MACK: ruta botadero ≤ 5 km, registro ticket piloto.",
      ],
      sanAntonio: [
        "Recorrido canal San Antonio con Amén; definir accesos y seguridad.",
        "Replanteo tramo inicial (rub. 5).",
      ],
      severino: [
        "Carvajal: inspección visual, permisos de ingreso EPA, plan de pruebas.",
        "Verificar arribo TTR/Megger (arrendamiento Portotrans/Electric-Transformer).",
      ],
      transversal: [
        "Acta de inicio / comunicación EPA (Macías).",
        "Cargar botaderos en sistema (tabla proyecto_botaderos).",
        "Capacitación residentes: GPS, jornadas, tickets desalojo, reporte CGE.",
      ],
    }
  }
  if (diaObra <= 10) {
    return {
      foco: "Ritmo de producción + cadena desazolve → desalojo → tendido",
      trasvase: [
        "Desazolve minitramos (rub. 2); confirmar puntos GPS terminados.",
        "Volqueta(s): tickets V₂ por abscisa; placa y botadero en cada viaje.",
        "Tractor D7G + moto 120G: tendido material (rub. 4) en tramos cerrados.",
        "Vélez: libro de obra, evidencias, cuadro avance vs 60,13 % acumulado.",
      ],
      sanAntonio: [
        "Desazolve mayores (rub. 6) según acceso; coordinación con Amén.",
        "Desalojo rub. 7 y tendido rub. 8 en mismo ciclo que Trasvase.",
      ],
      severino: [
        "Pruebas eléctricas iniciales (rub. 9) si aceite/condiciones lo permiten.",
        "Muestreo aceite (rub. 10–11) según ventanas del laboratorio.",
      ],
      transversal: [
        "Reporte diario CGE (conciliación V₁/V₂/V₃).",
        "Revisión consolidado maquinaria planilla vs horómetros.",
        "Evaluar flota volqueta: ¿suficiente 1 unidad? Ajustar arrendamiento.",
      ],
    }
  }
  if (diaObra <= 20) {
    return {
      foco: "Pico Planilla 1 — sostenibilidad logística",
      trasvase: [
        "Secuenciar 2 excavadoras en tramos no solapados (evitar doble jornada GPS).",
        "Programar refuerzo volqueta si V₂ < V₁ (triangulación antiglosa).",
        "Topografía Chancay: control cubicación y replanteo continuo.",
      ],
      sanAntonio: [
        "Avance mayores donde replanteo lo habilite; fotos y minitramos.",
      ],
      severino: [
        "Termovacío/filtrado aceite (rub. 12) ventana según cronograma Severino.",
        "Apertura tapa transformador (rub. 13) solo con prerequisitos cumplidos.",
      ],
      transversal: [
        "Salva-plazos si paralización/lluvia (registro eventos).",
        "Preparar medición rubros planilla 1 (requerimiento de pago).",
      ],
    }
  }
  if (diaObra <= 30) {
    return {
      foco: "Cierre Planilla 1 (meta 60,13 % acumulado)",
      trasvase: [
        "Cerrar minitramos abiertos; no dejar tramos en ejecución sin evidencia.",
        "Conciliación final V₁/V₂/V₃ del periodo 26-oct – 24-nov.",
      ],
      sanAntonio: [
        "Cierre físico parcial al % objetivo; respaldo fotográfico.",
      ],
      severino: [
        "Avance rubros 9–15 según secuencia Severino; no mezclar con cierre civil.",
      ],
      transversal: [
        "Memorando presentación planilla 1 + paquete documental.",
        "Revisión equipo mínimo vs informe consolidado maquinaria.",
      ],
    }
  }
  if (diaObra <= 45) {
    return {
      foco: "Planilla 2 — remate Trasvase/San Antonio",
      trasvase: [
        "Desazolve y desalojo rubros 2–4 hasta 100 % acumulado contractual.",
        "Remate tramos rezagados; auditoría volumétrica continua.",
      ],
      sanAntonio: [
        "Cierre rubros 6–8; coordinación replanteo final (rub. 5).",
      ],
      severino: [
        "Inspección interna, ajustes, pruebas finales (rub. 14–17).",
        "Grúa/planta termovacío si aplica ET (verificar arrendamientos pendientes).",
      ],
      transversal: [
        "Actualizar cronograma mapa (semana_programada por tramo).",
        "Control plazo: días restantes vs saldo físico.",
      ],
    }
  }
  return {
    foco: "Planilla 2 — cierre contractual (100 %)",
    trasvase: [
      "Últimos tramos; limpieza y reconformación taludes.",
      "Replanteo final rub. 1.",
    ],
    sanAntonio: [
      "Remate encauzamiento; replanteo rub. 5.",
    ],
    severino: [
      "Cierre transformador, pruebas finales rub. 17–18, entrega EPA.",
    ],
    transversal: [
      "Planilla 2, requerimiento pago final, libro de obra completo.",
      "Acta entrega-recepción y archivo EPA.",
    ],
  }
}

function main() {
  const defs = valoresPorDefectoPlanilla(PROYECTO_DESASOLVE_CANALES)
  if (!defs) throw new Error("Sin defaults planilla")
  const config = {
    ...defs,
    proyecto_id: PROYECTO_DESASOLVE_CANALES,
    registrado_por: null,
    created_at: "",
    updated_at: "",
  }
  const [p1, p2] = calcularPeriodosPlanilla(config)
  const finPlazo = addDays(FECHA_INICIO_PLAZO_EJECUCION, PLAZO_CALENDARIO_DIAS - 1)

  const V_DESALOJO = 525_576 + 71_692.45141
  const vP1 = V_DESALOJO * (PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION / 100)
  const hApuHm3 = vP1 * 0.008
  const equivCamiones = hApuHm3 / (p1.dias_calendario * 8)

  const dias: DiaPlan[] = []
  for (let i = 0; i < PLAZO_CALENDARIO_DIAS; i++) {
    const fecha = addDays(FECHA_INICIO_PLAZO_EJECUCION, i)
    const diaObra = i + 1
    const planilla: 1 | 2 = fecha <= p1.fecha_fin ? 1 : 2
    const t = tareasPorFase(diaObra)
    dias.push({ fecha, diaObra, planilla, ...t })
  }

  const lines: string[] = []
  lines.push("# Plan maestro de ejecución — Emergencia Severino y Trasvase Manabí")
  lines.push("")
  lines.push(`**Resolución:** ${RESOLUCION_EMERGENCIA} · **Proyecto app:** ${PROYECTO_DESASOLVE_CANALES}`)
  lines.push(`**Inicio plazo:** ${FECHA_INICIO_PLAZO_EJECUCION} · **Fin plazo:** ${finPlazo} (${PLAZO_CALENDARIO_DIAS} días)`)
  lines.push(`**Anticipo:** ${PORCENTAJE_ANTICIPO_CONTRATO} % (${FECHA_PAGO_ANTICIPO}) · **Monto oferta ref.:** USD ${PRESUPUESTO_OFERTA_SIN_IVA_USD.toLocaleString("en-US")} sin IVA`)
  lines.push(`**Planilla 1:** ${p1.fecha_inicio} → ${p1.fecha_fin} (meta **${PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION} %** acumulado)`)
  lines.push(`**Planilla 2:** ${p2.fecha_inicio} → ${p2.fecha_fin} (meta **100 %** acumulado)`)
  lines.push("")
  lines.push("---")
  lines.push("")
  lines.push("## 1. Respuesta operativa — desalojo y volqueta única")
  lines.push("")
  lines.push("### 1.1 Qué exige el contrato")
  lines.push("")
  lines.push("- El **equipo mínimo ofertado** incluye **1 volqueta** (MACK DM690S, Rosa Moreira). Eso acredita **disponibilidad mínima** ante EPA, no el límite máximo de flota en campo.")
  lines.push("- Los rubros **3 y 7** (desalojo) están **emparejados 1:1 en m³** con desazolve (rub. 2 y 6): todo material excavado debe salir con **ticket georreferenciado** (módulo desalojo, radio **≤ " + RADIO_DESALOJO_MAX_KM + " km**).")
  lines.push("- En la app, la **antiglosa** compara V₁ (abscisas), V₂ (viajes volqueta) y V₃ (horómetro excavadora). Una sola placa no puede simular volumen que no movió.")
  lines.push("")
  lines.push("### 1.2 ¿Hay que subcontratar?")
  lines.push("")
  lines.push("| Escenario | Conclusión |")
  lines.push("|-----------|------------|")
  lines.push("| **Cumplir solo con la volqueta del equipo mínimo** | Solo es viable si el **ritmo real de desazolve** es bajo (cuellos de botadero, acceso, clima) **o** si la volqueta hace **múltiples turnos** y aun así el volumen del periodo no exige más camiones. |")
  lines.push(
    "| **Meta Planilla 1** | Si el 60,13 % del rubro desalojo fuera ritmo pleno (~" +
      Math.round(vP1).toLocaleString("en-US") +
      " m³ en P1), el coeficiente APU 0,008 (confirmar unidad en PDF) exige del orden de **" +
      Math.round(hApuHm3).toLocaleString("en-US") +
      " h-máquina** en el periodo (~**" +
      equivCamiones.toFixed(1) +
      " camiones** a 8 h/día) — **una volqueta no alcanza** a ese teórico. |"
  )
  lines.push("| **Recomendación práctica** | **Sí: ampliar capacidad de transporte** vía (a) **más unidades del mismo arrendador** (Rosa Moreira u otro con RUC/contrato documentado), (b) **subcontrato de transporte** autorizado por EPA, o (c) **resecuenciar frentes** para no excavar más de lo que la flota puede evacuar el mismo día. Todas las placas deben registrarse en **tickets**; el mínimo contractual sigue siendo la volqueta comprometida. |")
  lines.push("")
  lines.push("### 1.3 Reglas de oro desalojo")
  lines.push("")
  lines.push("1. **No desacoplar** excavación y evacuación más de lo acordado en sitio (material acumulado = riesgo y desvío V₂/V₃).")
  lines.push("2. **Botaderos** cargados en Supabase antes de producción masiva.")
  lines.push("3. **Decisión documentada** (libro de obra): flota adicional, turnos, o subcontrato — con aprobación EPA si el contrato lo exige.")
  lines.push("4. Revisar semanalmente **Informe consolidado maquinaria** y **conciliación antiglosa** en planilla.")
  lines.push("")
  lines.push("---")
  lines.push("")
  lines.push("## 2. Organización y frentes (sin cabos sueltos)")
  lines.push("")
  lines.push("| Rol / frente | Responsable | Entregables diarios |")
  lines.push("|--------------|-------------|---------------------|")
  lines.push("| Superintendencia | Macías Loor | Decisiones, salva-plazos, interfaz EPA |")
  lines.push("| Trasvase campo | Saltos | GPS, jornadas, desazolve/desalojo/tendido |")
  lines.push("| Trasvase medición/planilla | Vélez | Libro de obra, medición, requerimiento pago |")
  lines.push("| San Antonio + coordinación | Amén | Frente mayores + alineación inter-frentes |")
  lines.push("| Severino eléctrico | Carvajal | Rubros 9–18, pruebas, actas |")
  lines.push("| Topografía | Chancay | Replanteo rub. 1/5, control V₁ |")
  lines.push("")
  lines.push("### Cadena diaria obligatoria (canales)")
  lines.push("")
  lines.push("Replanteo → Desazolve (GPS minitramo) → Ticket volqueta (V₂) → Tendido → Reporte CGE → Evidencias libro de obra")
  lines.push("")
  lines.push("### Cadena Severino (paralela)")
  lines.push("")
  lines.push("Pruebas iniciales → Muestreo aceite → Termovacío/filtrado → Apertura/inspección → Reparaciones → Pruebas finales → Energización/entrega")
  lines.push("")
  lines.push("---")
  lines.push("")
  lines.push("## 3. Cronograma diario (60 días de obra)")
  lines.push("")
  lines.push("Cada fila es el **mínimo a verificar ese día**. Ajuste tramos concretos en el mapa (semana_programada, maquinaria_asignada).")
  lines.push("")

  let semana = 0
  for (const d of dias) {
    const w = Math.floor((d.diaObra - 1) / 7) + 1
    if (w !== semana) {
      semana = w
      lines.push("")
      lines.push(
        "### Semana " +
          semana +
          " (días " +
          d.diaObra +
          "–" +
          Math.min(d.diaObra + 6, PLAZO_CALENDARIO_DIAS) +
          ")"
      )
      lines.push("")
    }
    lines.push(
      "#### Día " +
        d.diaObra +
        " — " +
        d.fecha +
        " (" +
        diaSemana(d.fecha) +
        ") · Planilla " +
        d.planilla
    )
    lines.push("")
    lines.push("**Foco:** " + d.foco)
    lines.push("")
    lines.push("- **Trasvase:** " + d.trasvase.join(" "))
    lines.push("- **San Antonio:** " + d.sanAntonio.join(" "))
    lines.push("- **Severino:** " + d.severino.join(" "))
    lines.push("- **Transversal:** " + d.transversal.join(" "))
    lines.push("")
  }

  lines.push("---")
  lines.push("")
  lines.push("## 4. Hitos contractuales (checklist)")
  lines.push("")
  lines.push("- [ ] Botaderos autorizados cargados en sistema")
  lines.push("- [ ] Equipo mínimo en sitio (compromisos arrendamiento)")
  lines.push("- [ ] Plan transporte desalojo (1 + N volquetas) aprobado internamente")
  lines.push("- [ ] Planilla 1 presentada antes fin nov-2026")
  lines.push("- [ ] 100 % físico y planilla 2 antes " + finPlazo)
  lines.push("- [ ] Severino: secuencia rubros 9–18 con actas de prueba")
  lines.push("- [ ] Cierre antiglosa sin observaciones críticas V₁/V₂/V₃")
  lines.push("")
  lines.push("---")
  lines.push("")
  lines.push("*Documento generado desde datos contractuales del repositorio. Regenerar: npx tsx scripts/generate-plan-maestro-ejecucion.ts.*")
  lines.push("")

  const out = path.join(process.cwd(), "docs/plan-maestro-ejecucion-desasolve-2026.md")
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, lines.join("\n"), "utf8")
  console.log("Wrote", out, "lines", lines.length)
}

main()
