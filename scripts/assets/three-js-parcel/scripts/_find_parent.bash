#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
TARGET="$1"

CUR="$SCRIPT_DIR"
ROOT_DIR=""

while true;
do
  for ITEM in $CUR/*; do
    ITEM_NAME=$(basename $ITEM)
    if [ "$ITEM_NAME" = "$TARGET" ]; then
      ROOT_DIR="$CUR"
      break
    fi
  done
  if ! [ "$ROOT_DIR" = "" ]; then
    break
  fi
  CUR="$(dirname $CUR)"
done

printf $ROOT_DIR