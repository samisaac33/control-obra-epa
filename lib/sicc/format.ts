const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatearUsd(value: number): string {
  return usdFormatter.format(value)
}

export function formatearCantidad(value: number): string {
  return value.toLocaleString("es-EC", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  })
}

export function formatearFecha(iso: string): string {
  const fecha = new Date(`${iso}T12:00:00`)
  return fecha.toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatearFechaCorta(iso: string): string {
  const fecha = new Date(`${iso}T12:00:00`)
  return fecha.toLocaleDateString("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}
