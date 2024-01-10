import { defineConfig } from "vite"

import CirJson from "@cirjson/vite"

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  resolve: {
    alias: {
      "/@": __dirname,
      "@": __dirname,
    },
  },
  plugins: [CirJson()],
})
