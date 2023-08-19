import { CirJsonParseContext } from "./internal/CirJsonParseContext"

export function parse<T>(text: string): T {
  const context = new CirJsonParseContext()
  return parseUnknown(text, context) as T
}

function parseUnknown(text: string, context: CirJsonParseContext): unknown {
  return
}
