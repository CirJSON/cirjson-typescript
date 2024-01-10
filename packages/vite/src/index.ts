import fs from "node:fs"
import { createFilter, Plugin, TransformResult } from "vite"

import "@cirjson/core"

import { compile, isFileSaved, loadFile } from "./compile"

interface Options {
  include: string | RegExp | Array<string | RegExp>
  exclude?: string | RegExp | Array<string | RegExp>
}

export default function cirJsonPlugin(options: Partial<Options> = {}): Plugin {
  const realOptions: Options = {
    include: options.include || /\.cirjson$/,
    exclude: options.exclude,
  }

  const filter = createFilter(realOptions.include, realOptions.exclude)

  return {
    name: "vite:CirJSON",
    load(id) {
      console.log(`${id}: ${filter(id)}`)
      if (!isFileSaved(id)) {
        const realCode = compile(id, fs.readFileSync(id, "utf-8"))
        return {
          code: realCode,
          map: null,
        }
      }

      const fileCode = loadFile(id)
      return {
        code: fileCode,
        map: null,
      }
    },
    transform(code, id, opt): TransformResult | undefined {
      console.log(`${id}: ${filter(id)}`)
      if (!filter(id)) {
        return
      }

      const realCode = compile(id, code)
      console.log(realCode)

      return {
        code: realCode,
        map: null,
      }
    },
  }
}
