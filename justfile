run name="":
  bash ./scripts/bin/bench-procmon {{name}}

generate count="50" mode="sync":
  BENCH_COPIES={{count}} \
  BENCH_MODE={{mode}} \
  node ./scripts/node/setup-three-js.mjs

link-parcel:
  node scripts/node/link.mjs
