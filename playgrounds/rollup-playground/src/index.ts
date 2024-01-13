import fooJson from "../res/foo.json"

import cirFoo from "../res/foo.cirjson"

export function foo() {
  console.log(fooJson)
  console.log(cirFoo)
  return "bar"
}
