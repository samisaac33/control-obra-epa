import { Suspense } from "react"

import LoginClient from "@/src/app/login/LoginClient"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[oklch(0.98_0.002_264)]" />}>
      <LoginClient />
    </Suspense>
  )
}
