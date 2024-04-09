import * as path from 'node:path'
import * as fs from 'node:fs'
import * as child_process from 'node:child_process'
import { Paths } from './paths.mjs'
import { crawlDir, TargetType } from './crawl.mjs'

const COPIES = process.env.BENCH_COPIES ? parseInt(process.env.BENCH_COPIES, 10) : 10
const MODE = process.env.BENCH_MODE ? process.env.BENCH_MODE : 'sync'

if (!['sync', 'dynamic'].includes(MODE)) {
  console.error('Invalid mode, use "sync" or "dynamic')
  process.exit(1)
}

if (!fs.existsSync(Paths.root('vendor')) || !fs.existsSync(Paths.root('vendor', 'three-js'))) {
  console.log('Setting up three-js')
  
  // git clone --depth 1 --branch r108 https://github.com/mrdoob/three.js.git vendor/three
  // I have just vendored the files into the project

  fs.mkdirSync(Paths.root('vendor', 'three-js'), { recursive: true })
  child_process.execSync(`tar -xzf ${Paths.root('scripts', 'assets', 'three-js.tar.gz')} -C .`, {
    stdio: 'inherit',
    cwd: Paths.root('vendor', 'three-js')
  })
}

if (!fs.existsSync(Paths.root('benchmarks', `three-js-${COPIES}-${MODE}`))) {
  console.log("Generating fixtures")

  fs.cpSync(
    Paths.root('scripts', 'assets', 'three-js-parcel'),
    Paths.root('benchmarks', `three-js-${COPIES}-${MODE}`),
    { recursive: true },
  )

  const packageJson = JSON.parse(fs.readFileSync(Paths.root('benchmarks', `three-js-${COPIES}-${MODE}`, 'package.json'), 'utf8'))
  packageJson.name = packageJson.name + `-${COPIES}-${MODE}`
  fs.writeFileSync(Paths.root('benchmarks', `three-js-${COPIES}-${MODE}`, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf8')

  let index = ''
  let salt = 0

  for (let i = 1; i <= COPIES; i++) {
    process.stdout.write(`${i} `)
    if (MODE === 'dynamic') {
      index += `export const three_js_copy_${i} = import('./copy_${i}/Three.js').then((three_js_copy_${i}) => globalThis.three_js_copy_${i} = three_js_copy_${i});\n`
    } else {
      index += `import * as three_js_copy_${i} from './copy_${i}/Three.js'; export { three_js_copy_${i} }; globalThis.three_js_copy_${i} = three_js_copy_${i};\n`
    }

    const copy_dir = Paths.root('benchmarks', `three-js-${COPIES}-${MODE}`, 'src', `copy_${i}`)
    fs.cpSync(
      Paths.root('vendor', 'three-js', '_src'),
      copy_dir,
      { recursive: true },
    )

    let results = crawlDir({
      targetPath: copy_dir,
      dontCrawl: [],
      match: [TargetType.FILE]
    })

    for (const filepath of results.keys()) {
      fs.appendFileSync(filepath, `\nexport const benchmark_salt_${salt} = ${salt};`)
      salt += 1
    }
  }

  fs.writeFileSync(Paths.root('benchmarks', `three-js-${COPIES}-${MODE}`, 'src', 'index.js'), index, 'utf8')
  process.stdout.write(`\n`)

  console.log("Please run 'yarn install'")
}