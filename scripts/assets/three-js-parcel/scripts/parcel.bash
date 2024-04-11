#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$(bash $SCRIPT_DIR/_find_parent.bash justfile)"
PKG_DIR="$(bash $SCRIPT_DIR/_find_parent.bash package.json)"
PKG_NAME="$(basename $PKG_DIR)"
REPORT_NAME="$PKG_NAME-parcel"

echo VARIANT $VARIANT

if ! [ "$VARIANT" = "" ]; then
  REPORT_NAME="$PKG_NAME-parcel-$VARIANT"
fi

cd "$SCRIPT_DIR/.."
procmon \
  -r "$ROOT_DIR/reports/$REPORT_NAME" \
  -i 500 \
  -- node "$ROOT_DIR/node_modules/.bin/parcel" build --no-cache $@

cp "$PKG_DIR/phases.json" "$ROOT_DIR/reports/$REPORT_NAME"
