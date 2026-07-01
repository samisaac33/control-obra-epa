import Link from "next/link"
import {
  BookOpen,
  Building2,
  Calculator,
  ClipboardCheck,
  FileText,
  HardHat,
  LayoutDashboard,
  LineChart,
  Package,
  Ruler,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EstadoModuloBadge } from "@/components/sicc/estado-modulo-badge"
import type { ModuloId, ModuloSicc } from "@/lib/sicc/types"

const ICONOS: Record<ModuloId, React.ComponentType<{ className?: string }>> = {
  presupuesto: Calculator,
  metrados: Ruler,
  "libro-obra": BookOpen,
  certificaciones: ClipboardCheck,
  planificacion: LineChart,
  compras: Package,
  calidad: ShieldCheck,
  equipos: Truck,
  rrhh: Users,
  contratos: FileText,
  finanzas: Wallet,
  reportes: LayoutDashboard,
}

export function ModuleCard({ modulo }: { modulo: ModuloSicc }) {
  const Icono = ICONOS[modulo.id]

  return (
    <Card className="group border-foreground/10 bg-card/95 transition-shadow hover:shadow-md ring-1 ring-foreground/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-foreground/10 bg-[oklch(0.96_0.02_250)] text-[oklch(0.42_0.12_250)]">
            <Icono className="size-5" />
          </div>
          <EstadoModuloBadge estado={modulo.estado} />
        </div>
        <CardTitle className="mt-3 text-base">
          <Link href={modulo.href} className="hover:underline">
            {modulo.titulo}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">{modulo.descripcion}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {modulo.funcionalidades.slice(0, 3).map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-foreground/40">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm font-medium text-[oklch(0.42_0.12_250)] group-hover:underline">
          Abrir módulo →
        </p>
      </CardContent>
    </Card>
  )
}

export function ObraResumenCard({
  nombre,
  contrato,
  cliente,
  ubicacion,
  residente,
}: {
  nombre: string
  contrato: string
  cliente: string
  ubicacion: string
  residente: string
}) {
  return (
    <Card className="border-foreground/10 bg-card/95 ring-1 ring-foreground/5">
      <CardHeader className="border-b border-foreground/10 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[oklch(0.42_0.12_250)] text-white">
            <Building2 className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Obra activa</CardTitle>
            <CardDescription>Proyecto de demostración SICC</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Obra
            </dt>
            <dd className="mt-1 text-sm font-medium">{nombre}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contrato
            </dt>
            <dd className="mt-1 font-mono text-sm">{contrato}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Cliente
            </dt>
            <dd className="mt-1 text-sm">{cliente}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Ubicación
            </dt>
            <dd className="mt-1 text-sm">{ubicacion}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Residente
            </dt>
            <dd className="mt-1 flex items-center gap-2 text-sm">
              <HardHat className="size-4 text-muted-foreground" />
              {residente}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
