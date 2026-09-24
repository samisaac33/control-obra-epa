import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const pkgPath = join(process.cwd(), "node_modules/@react-pdf/hyphenate/package.json")

try {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
  let changed = false

  for (const key of [".", "./*"]) {
    const entry = pkg.exports?.[key]
    if (!entry) continue

    if (!entry.require) {
      entry.require = entry.import
      changed = true
    }

    if (!entry.default) {
      entry.default = entry.import
      changed = true
    }
  }

  if (changed) {
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
    console.log("Parche aplicado: @react-pdf/hyphenate (compatibilidad Node.js + tsx)")
  }
} catch {
  // @react-pdf/hyphenate no instalado; omitir silenciosamente.
}
