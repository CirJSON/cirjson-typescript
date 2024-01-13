import fs from "node:fs"
import { createFilter, Plugin, TransformResult } from "vite"

import "@cirjson/core"

import { compile } from "./compile"

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
    resolveId(id) {
      if (id === "@cirjson/core") {
        // this signals that Rollup should not ask other plugins or check
        // the file system to find this id
        return { id: "@cirjson/core", external: true }
      }
      return null // other ids should be handled as usually
    },
    load(id) {
      return {
        code: fs.readFileSync(id, "utf-8"),
        map: null,
      }
    },
    transform(code, id, opt): TransformResult | undefined {
      if (!filter(id)) {
        return
      }

      return {
        code: compile(code),
        map: null,
      }
    },
  }
}
