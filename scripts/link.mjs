
// @ts-check
import * as fs from "node:fs";
import * as path from "node:path";
import * as glob from "glob";
import * as url from 'node:url'

function json(/** @type {string} */ filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'))
}

const { PARCEL_SRC_PATH } = process.env;
if (typeof PARCEL_SRC_PATH !== "string") {
  console.log("Please set the $PARCEL_SRC_PATH env var")
  process.exit(1);
}

const Paths = {
  dirname(/** @type {string[]} */ ...segments) { return path.join(url.fileURLToPath(new URL('.', import.meta.url)), ...segments) },
  root(/** @type {string[]} */ ...segments) { return this.dirname('..', ...segments) },
  parcel_src(/** @type {string[]} */ ...segments) { return path.join(PARCEL_SRC_PATH, ...segments) },
}

const parcelPackageIndex = /** @type {Record<string, string>} */ ({})
const targetPackageIndex = /** @type {Record<string, string>} */ ({})

const parcelPackageJsonPaths = glob.sync('packages/*/*/package.json', { cwd: PARCEL_SRC_PATH })

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
