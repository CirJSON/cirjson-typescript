import { CirJsonParseContext } from "./internal/CirJsonParseContext"
import { CirJsonError } from "./errors/CirJsonError"

export function parse<T>(text: string): T {
  const context = new CirJsonParseContext()
  const baseParsed = JSON.parse(text)
  return parseUnknown(baseParsed, context) as T
}

function parseUnknown(baseParsed: unknown, context: CirJsonParseContext): unknown {
  if (typeof baseParsed === "object" && baseParsed !== null) {
    return parseObjectOrArray(baseParsed, context)
  }

  return baseParsed
}

function parseObjectOrArray(baseParsed: object, context: CirJsonParseContext) {
  if (Array.isArray(baseParsed)) {
    return parseArray(baseParsed, context)
  }

  return
}

function parseArray(array: Array<unknown>, context: CirJsonParseContext) {
  if (array.length === 0 || typeof array[0] !== "string" || array[0].length === 0) {
    throw new CirJsonError("The found array without ID at the start")
  }

  const arrayId = array[0]

  if (context.isIdAlreadyRegistered(arrayId)) {
    return context.getStructureFromId(arrayId)!
  }

  const result: Array<unknown> = []
  context.registerStructure(arrayId, result)
  const realArray: Array<unknown> = array.slice(1)
  for (const realArrayElement of realArray) {
  }

  return result
}
