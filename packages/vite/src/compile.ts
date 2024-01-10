const savedFiles = new Map<string, string>()

export function isFileSaved(filename: string) {
  return savedFiles.has(filename)
}

export function loadFile(filename: string) {
  return savedFiles.get(filename)!
}

export function compile(filename: string, code: string) {
  const escapedCode = code.replace(/`/g, "\\u0060")
  const result = `const { parse } = require("@cirjson/core")\n\nexports.default = parse(\`${escapedCode}\`)\n`
  savedFiles.set(filename, result)
  return result
}
