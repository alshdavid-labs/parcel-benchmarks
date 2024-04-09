
// @ts-check
import * as fs from "node:fs";
import * as path from "node:path";
import * as glob from "glob";
import { Paths } from './paths.mjs'

function json(/** @type {string} */ filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'))
}

const parcelPackageIndex = /** @type {Record<string, string>} */ ({})
const targetPackageIndex = /** @type {Record<string, string>} */ ({})

const parcelPackageJsonPaths = glob.sync('packages/*/*/package.json', { cwd: Paths.parcel_src() })

for (const packageJsonPath of parcelPackageJsonPaths) {
  const { name } = json(Paths.parcel_src(packageJsonPath))
  parcelPackageIndex[name] = path.dirname(Paths.parcel_src(packageJsonPath))
}

for (const dirName of fs.readdirSync(Paths.root('node_modules'))) {
  if (dirName === 'parcel') {
    targetPackageIndex[dirName] = Paths.root("node_modules", dirName)
    continue
  }
  if (dirName.startsWith('@parcel')) {
    for (const dir of fs.readdirSync(Paths.root("node_modules", '@parcel'))) {
      const pkgName = `@parcel/${dir}`
      if (!(pkgName in parcelPackageIndex)) {
        continue
      }
      targetPackageIndex[pkgName] = Paths.root("node_modules", '@parcel', dir)
    }
  }
}

for (const [pkgName, pkgPath] of Object.entries(targetPackageIndex)) {
  if (fs.existsSync(pkgPath)) {
    fs.rmSync(pkgPath, { recursive: true, force: true })
    fs.symlinkSync(parcelPackageIndex[pkgName], pkgPath)
  }
  console.log('Linking:', pkgName)
}
