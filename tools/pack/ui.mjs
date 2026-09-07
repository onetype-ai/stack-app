#!/usr/bin/env node
//
//   node tools/pack/ui.mjs pack        folds the shared ui into one file
//   node tools/pack/ui.mjs unpack      rebuilds the folder
//

import { Packer } from "./index.mjs";

new Packer({ at: "src/ui", into: "src/ui/example.txt", name: "unit", tool: "ui" }).ran(process.argv.slice(2));
