#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$( dirname $SCRIPT_DIR )"
NAME="${1-unnamed}"

BENCHES=(
  three-js-10
  three-js-25
  three-js-50
  three-js-100
  three-js-200
)

rm -rf reports/$1
mkdir reports/$1

for BENCH in $ROOT_DIR/benchmarks/*; do
  $BENCHNAME=$(basename $BENCH)
  cd $BENCH

  # rm -rf $ROOT_DIR/.parcel-cache
  # rm -rf $ROOT_DIR/$BENCH/dist

  # env \
  #   PM_MEM_UNITS="mb" \
  #   PM_TIME_UNITS="ms" \
  #   PM_POLL_INTERVAL="500" \
  #   PM_REPORT="$ROOT_DIR/reports/$1/$BENCH-no-optimize.csv" \
  #   max-old-space-size=4000 \
  #   procmon node ./node_modules/.bin/parcel build --no-optimize --no-cache

  # rm -rf $ROOT_DIR/$BENCH/dist
  # rm -rf $ROOT_DIR/.parcel-cache

  # env \
  #   PM_MEM_UNITS="mb" \
  #   PM_TIME_UNITS="ms" \
  #   PM_POLL_INTERVAL="500" \
  #   PM_REPORT="$ROOT_DIR/reports/$1/$BENCH.csv" \
  #   max-old-space-size=4000 \
  #   procmon node ./node_modules/.bin/parcel build --no-cache

  # rm -rf $ROOT_DIR/$BENCH/dist
done
