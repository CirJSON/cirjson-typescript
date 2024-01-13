import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  sourcemap: true,
  externals: ["@rollup/pluginutils", "@cirjson/core"],
})
