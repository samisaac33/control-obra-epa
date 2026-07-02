import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SeccionEnPreparacionProps = {
  titulo: string
}

export function SeccionEnPreparacion({ titulo }: SeccionEnPreparacionProps) {
  return (
    <div className="p-4 sm:p-6">
      <Card className="mx-auto max-w-2xl border-foreground/10">
        <CardHeader>
          <CardTitle>{titulo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta sección estará disponible cuando el residente de obra comience a registrar información
            operativa. Mientras tanto, consulte el dashboard, el informe de afectación, el presupuesto y las
            evidencias fotográficas.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
