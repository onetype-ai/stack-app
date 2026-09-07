#!/usr/bin/env node
//
//   node tools/pack/utils.mjs pack             packs every shared util
//   node tools/pack/utils.mjs pack Words       packs only Words
//   node tools/pack/utils.mjs unpack           rebuilds the files
//

import { Packer } from "./index.mjs";

new Packer({ at: "src/utils", demo: ["Words"], name: "util", tool: "utils" }).ran(process.argv.slice(2));
