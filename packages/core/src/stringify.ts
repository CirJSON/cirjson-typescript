import { CirJsonStringifyContext } from "./internal/CirJsonStringifyContext"
import { CirJsonError } from "./errors/CirJsonError"
import { ArrayStructure, ComplexStructure, isArrayStructure, isObjectStructure, ObjectStructure } from "./baseTypes"

export function stringify<T>(value: T): string | undefined {
  const context = new CirJsonStringifyContext()
  return stringifyUnknown(value, context)
}

function stringifyUnknown<T>(value: T, context: CirJsonStringifyContext) {
  switch (typeof value) {
    case "bigint":
      throw new CirJsonError("Do not know how to serialize a BigInt")
    case "function":
    case "undefined":
    case "symbol":
      return undefined
    case "boolean":
      return stringifyBoolean(value)
    case "number":
      return stringifyNumber(value)
    case "string":
      return stringifyString(value)
    case "object":
      return stringifyStructure(value as ComplexStructure | null, context)
  }
}

function stringifyBoolean(value: boolean) {
  return value ? "true" : "false"
}

function stringifyNumber(value: number): string {
  return JSON.stringify(value)
}

function stringifyString(value: string) {
  return JSON.stringify(value)
}

function stringifyStructure(value: ComplexStructure | null, context: CirJsonStringifyContext): string {
  if (value === null) {
    return "null"
  }

  if (isObjectStructure(value)) {
    return stringifyObjectStructure(value, context)
  } else if (isArrayStructure(value)) {
    return stringifyArrayStructure(value, context)
  }

  throw new CirJsonError("Don't know what happened")
}

function stringifyObjectStructure(value: ObjectStructure, context: CirJsonStringifyContext): string {
  let result = "{"

  const alreadyStringified = context.isStructureAlreadyStringified(value)

  const id = context.getStructureId(value)
  result += `"__cirJsonId__":${stringifyString(id)}`

  if (!alreadyStringified) {
    const keys = Object.keys(value)
    for (const key of keys) {
      const elementStringified = stringifyUnknown(value[key], context)
      if (elementStringified !== undefined) {
        result += ","
        result += `"${key}":${elementStringified}`
      }
    }
  }

  result += "}"
  return result
}

function stringifyArrayStructure(value: ArrayStructure<unknown>, context: CirJsonStringifyContext): string {
  let result = "["

  const alreadyStringified = context.isStructureAlreadyStringified(value)

  const id = context.getStructureId(value)
  result += stringifyString(id)

  if (!alreadyStringified) {
    for (const element of value) {
      result += ","

      const elementStringified = stringifyUnknown(element, context)
      if (elementStringified !== undefined) {
        result += elementStringified
      } else {
        result += "null"
      }
    }
  }

  result += "]"
  return result
}
