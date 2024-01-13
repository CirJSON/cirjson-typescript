// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fooJson from "../res/foo.json"

import cirFoo from "../res/foo.cirjson"

console.log("logging this text")
console.log(fooJson)
console.log(cirFoo)
console.log(JSON.stringify(cirFoo))

export function foo() {
  return 1 + 2
}
