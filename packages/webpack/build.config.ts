import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  sourcemap: true,
  externals: ["webpack", "@cirjson/core"],
})
