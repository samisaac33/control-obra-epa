import { Suspense } from "react"

import IngresoClient from "@/src/app/ingreso/IngresoClient"

export default function IngresoPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[oklch(0.98_0.002_264)]" />}>
      <IngresoClient />
    </Suspense>
  )
}
