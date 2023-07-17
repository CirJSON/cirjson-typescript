export function parse(str: string) {
  const flattened = flatten(str)
}

function flatten(str: string): string {
  return JSON.stringify(JSON.parse(str))
}
