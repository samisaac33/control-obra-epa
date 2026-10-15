import path from "node:path"

import { replacePdfLastPage } from "./lib/replace-pdf-last-page"

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (token === "--base" || token === "--donor" || token === "--out") {
      const value = argv[i + 1]
      if (!value || value.startsWith("--")) {
        throw new Error(`Falta valor para ${token}`)
      }
      args[token.slice(2)] = value
      i++
    }
  }
  if (!args.base || !args.donor || !args.out) {
    throw new Error("Uso: --base <pdf> --donor <pdf> --out <pdf>")
  }
  return args as { base: string; donor: string; out: string }
}

async function main() {
  const { base, donor, out } = parseArgs(process.argv.slice(2))

  const { baseCount, outCount, donorPageIndex } = await replacePdfLastPage({
    basePath: base,
    donorPath: donor,
    outPath: out,
  })

  console.log(`Base: ${path.resolve(base)} (${baseCount} páginas)`)
  console.log(`Donor: ${path.resolve(donor)} (página índice ${donorPageIndex})`)
  console.log(`Salida: ${path.resolve(out)} (${outCount} páginas)`)
}

main().catch((error) => {
  console.error("Error al reemplazar última página:", error)
  process.exit(1)
})
