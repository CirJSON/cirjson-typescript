// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as foo from "../res/foo.json"

import * as cirFoo from "../res/foo.cirjson"

console.log("logging this text")
console.log(foo)
console.log(cirFoo)

export function foo() {
  return 1 + 2
}
