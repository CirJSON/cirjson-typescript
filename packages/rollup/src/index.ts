import type { LoadResult, Plugin, TransformResult } from "rollup"
import { createFilter } from "@rollup/pluginutils"
import fs from "node:fs"
import { compileCirJson } from "./compile"

interface Options {
  include: string | RegExp | Array<string | RegExp>
  exclude?: string | RegExp | Array<string | RegExp>
}

function filterId(f: (id: string | unknown) => boolean, id: string): boolean {
  if (!f(id)) {
    return false
  }

  const filterExt = /\.cirjson$/i
  return filterExt.test(id)
}

export default function cirJsonRollup(options: Partial<Options> = {}): Plugin {
  const realOptions: Options = {
    include: options.include || /\.cirjson$/,
    exclude: options.exclude,
  }
  const filter = createFilter(realOptions.include, realOptions.exclude)

  return {
    name: "rollup:CirJSON",
    resolveId(source: string) {
      console.log(`resolving ${source}`)
      if (source === "@cirjson/core") {
        // this signals that Rollup should not ask other plugins or check
        // the file system to find this id
        return { id: "@cirjson/core", external: true }
      }
      return null // other ids should be handled as usually
    },
    load(id: string): LoadResult {
      if (!filterId(filter, id)) {
        return
      }

      console.log(`loaded ${id}`)
      return {
        code: fs.readFileSync(id, "utf-8"),
        map: { mappings: "" },
      }
    },
    transform(code: string, id: string): TransformResult {
      if (!filterId(filter, id)) {
        return
      }

      console.log(`transformed ${id}`)
      return {
        code: compileCirJson(code),
        map: { mappings: "" },
      }
    },
  }
}
