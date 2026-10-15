import path from "node:path"

import { extractPdfPage } from "./lib/extract-pdf-page"

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (token === "--in" || token === "--page" || token === "--out") {
      const value = argv[i + 1]
      if (!value || value.startsWith("--")) {
        throw new Error(`Falta valor para ${token}`)
      }
      args[token === "--in" ? "in" : token.slice(2)] = value
      i++
    }
  }
  if (!args.in || !args.page || !args.out) {
    throw new Error("Uso: --in <pdf> --page <n> --out <pdf>")
  }
  return args as { in: string; page: string; out: string }
}

async function main() {
  const { in: inPath, page, out: outPath } = parseArgs(process.argv.slice(2))
  const pageNum = Number.parseInt(page, 10)

  await extractPdfPage({ inPath, page: pageNum, outPath })

  console.log(`Extraída página ${pageNum} de ${path.resolve(inPath)} → ${path.resolve(outPath)}`)
}

main().catch((error) => {
  console.error("Error al extraer página:", error)
  process.exit(1)
})
