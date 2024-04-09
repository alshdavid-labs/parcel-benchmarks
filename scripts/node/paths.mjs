import * as path from "node:path";
import * as url from 'node:url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const { PARCEL_SRC_PATH } = process.env;

if (typeof PARCEL_SRC_PATH !== "string") {
  console.log("Please set the $PARCEL_SRC_PATH env var")
  process.exit(1);
}

export const Paths = {
  dirname(/** @type {string[]} */ ...segments) { return path.resolve(__dirname, ...segments) },
  root(/** @type {string[]} */ ...segments) { return path.resolve(this.dirname('..', '..', ...segments)) },
  parcel_src(/** @type {string[]} */ ...segments) { return path.join(PARCEL_SRC_PATH, ...segments) },
}
