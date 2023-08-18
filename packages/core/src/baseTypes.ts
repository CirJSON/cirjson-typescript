export type ObjectStructure = {
  [p: string]: unknown
}

export type ArrayStructure<T> = Array<T>

export type ComplexStructure = ObjectStructure | ArrayStructure<unknown>

export function isObjectStructure(structure: ComplexStructure): structure is ObjectStructure {
  return !isArrayStructure(structure)
}

export function isArrayStructure(structure: ComplexStructure): structure is ArrayStructure<unknown> {
  return Array.isArray(structure)
}
