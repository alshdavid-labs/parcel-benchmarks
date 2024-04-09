# Results

Create a [discussion thread](https://github.com/alshdavid-labs/parcel-benchmarks/discussions) and post your data there. Make sure you add details like your hardware, the Parcel branch you are using and other important information.

# Setup

```bash
git clone git@github.com:alshdavid-labs/parcel-benchmarks.git
cd parcel-benchmarks
export PARCEL_SRC_PATH="/path/to/parcel/sources"
yarn install
node ./link.mjs
```

# Run a benchmark

```bash
cd three-js-10

yarn run build
yarn run build:optimize
```

# Better timings

Install [procmon](https://github.com/alshdavid/procmon)

```bash
cd three-js-10

env \
  PM_MEM_UNITS="mb" \
  PM_TIME_UNITS="ms" \
  PM_POLL_INTERVAL="500" \
  PM_REPORT="report.csv" \
  procmon "$(cat package.json | jq -r ".scripts.build")"
```
