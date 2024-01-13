export function compileCirJson(code: string) {
  const escapedCode = code.replace(/`/g, "\\u0060")
  return `
  import { parse } from "@cirjson/core"
  export default parse(\`${escapedCode}\`)
  `
}
