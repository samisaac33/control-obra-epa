import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { AppShell } from "@/src/components/AppShell"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://control-obra-epa.vercel.app"

const siteTitle = "Control de Obra EPA Manabí"
const siteDescription =
  "Panel de control de obra EPA Manabí: informe de afectación, presupuesto contractual, registro de maquinaria y transporte, y evidencias fotográficas georreferenciadas."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Control de Obra EPA",
  },
  description: siteDescription,
  applicationName: "Control de Obra EPA Manabí",
  keywords: [
    "EPA Manabí",
    "Poza Honda",
    "control de obra",
    "emergencia",
    "maquinaria",
    "desasolve",
  ],
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: siteUrl,
    siteName: "Control de Obra EPA Manabí",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh min-w-0 bg-background text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
