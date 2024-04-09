const { Reporter } = require('@parcel/plugin')
const fs = require('node:fs')
const path = require('node:path')

let durations = {
    start: null,
    bundling: null,
    packaging: null,
}
let asset_count = 0

module.exports.default = new Reporter({
  report({ event }) {
    if (event.type === 'buildSuccess') {
      let end = Date.now()

      const totalTime = end - durations.start
      const transformationTime = durations.bundling - durations.start
      const bundlingTime = durations.packaging - durations.bundling
			const packagingTime = totalTime - bundlingTime - transformationTime
      
			let timings = {
        asset_count,
        transformation: transformationTime / 1000,
        bundling: bundlingTime / 1000,
        packaging: packagingTime / 1000,
        total: totalTime / 1000,
      }

      console.table(timings)
      fs.writeFileSync(path.join(__dirname, '..', 'phases.json'), JSON.stringify(timings, null, 2), 'utf8')
      return
    }
    if (event.type === 'buildStart') {
      let timestamp = Date.now()
      durations.start = timestamp
      return
    }
    if (event.type === 'buildProgress') {
      if (event.phase === 'resolving') {
        return
      }
      if (event.phase === 'transforming') {
        asset_count += 1
        return
      }
      if (event.phase === 'bundling') {
        let timestamp = Date.now()
        durations.bundling = timestamp
        return
      }
      if (event.phase === 'packaging' && durations.packaging === null) {
        let timestamp = Date.now()
        durations.packaging = timestamp
        return
      }
    }
  }
})
