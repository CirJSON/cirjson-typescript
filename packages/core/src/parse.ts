export function parse<T>(text: string): T {
  return JSON.parse(text) as T
}
