import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "JBS Consorcio — Control de Obra EPA Manabí"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 48%, #0c4a6e 100%)",
          color: "#f8fafc",
          padding: "56px 64px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            JBS Consorcio
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            Control de Obra EPA Manabí
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.4,
              color: "#cbd5e1",
              maxWidth: 880,
            }}
          >
            Contrato de emergencia — Canales Poza Honda, La Estancilla y La Ciénega
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {[
            "Informe de afectación",
            "Presupuesto",
            "Maquinaria y transporte",
            "Evidencias fotográficas",
          ].map((modulo) => (
            <div
              key={modulo}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid rgba(148, 163, 184, 0.35)",
                background: "rgba(15, 23, 42, 0.55)",
                fontSize: 20,
                color: "#e2e8f0",
              }}
            >
              {modulo}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#94a3b8",
          }}
        >
          <span>Empresa Pública del Agua (EPA EP)</span>
          <span>CTO-2026-EP-0142</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
