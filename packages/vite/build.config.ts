import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  sourcemap: true,
  externals: ["vite", "@cirjson/core"],
})
