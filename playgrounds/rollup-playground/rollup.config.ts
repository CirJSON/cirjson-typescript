import { defineConfig } from "rollup"
import typescript from "@rollup/plugin-typescript"
import json from "@rollup/plugin-json"

import cirJsonRollup from "@cirjson/rollup"

export default defineConfig({
  input: ["src/index.ts"],
  output: [
    {
      file: "dist/bundle.js",
    },
  ],
  plugins: [cirJsonRollup(), typescript(), json()],
  treeshake: false,
})
