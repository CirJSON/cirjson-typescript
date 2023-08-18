import { stringify } from "../src/stringify"

describe("stringify", () => {
  it("should return undefined for values with type 'function', 'undefined', and 'symbols'", () => {
    expect(stringify(function () {})).toBeUndefined()
    expect(stringify(undefined)).toBeUndefined()
    expect(stringify(Symbol())).toBeUndefined()
    expect(stringify(Symbol(42))).toBeUndefined()
    expect(stringify(Symbol("foo"))).toBeUndefined()
  })

  it("should throw CirJsonError if a BigInt is present", () => {
    expect(() => stringify(BigInt(BigInt(42)))).toThrowError()
    expect(() => stringify(BigInt(42))).toThrowError()
  })
})
