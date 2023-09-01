export function arrayOfNulls<T>(size: number): Array<T | null> {
  const array: Array<T | null> = []

  while (size > array.length) {
    array.push(null)
  }

  return array
}

export function arrayCopy<T>(original: Array<T>, newLength: number): Array<T | null> {
  const result: Array<T | null> = []

  for (let i = 0; i < newLength; i++) {
    if (i < original.length) {
      result.push(original[i])
    } else {
      result.push(null)
    }
  }

  return result
}
