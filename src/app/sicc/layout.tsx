import type { Metadata } from "next"

import { SiccShell } from "@/components/sicc/sicc-shell"

export const metadata: Metadata = {
  title: "SICC | Sistema Integrado de Control de Construcción",
  description:
    "Sistema integrado para gestión de obra: presupuesto, metrados, libro de obra, certificaciones y más.",
}

export default function SiccLayout({ children }: { children: React.ReactNode }) {
  return <SiccShell>{children}</SiccShell>
}
