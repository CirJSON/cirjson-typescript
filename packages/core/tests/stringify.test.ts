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
    expect(() => stringify(BigInt(BigInt(42)))).toThrowError("Do not know how to serialize a BigInt")
    expect(() => stringify(BigInt(42))).toThrowError("Do not know how to serialize a BigInt")
    expect(() => stringify(BigInt(true))).toThrowError("Do not know how to serialize a BigInt")
    expect(() => stringify(BigInt("9007199254740992"))).toThrowError("Do not know how to serialize a BigInt")
  })

  describe("primitives", () => {
    it("should serialize boolean", () => {
      expect(stringify(true)).toEqual("true")
      expect(stringify(false)).toEqual("false")
    })

    it("should stringify numbers", () => {
      expect(stringify(42)).toEqual("42")
      expect(stringify(9.8)).toEqual("9.8")
      expect(stringify(-42)).toEqual("-42")
      expect(stringify(-9.8)).toEqual("-9.8")
      expect(stringify(42e30)).toEqual("4.2e+31")
      expect(stringify(9.8e30)).toEqual("9.8e+30")
      expect(stringify(-42e30)).toEqual("-4.2e+31")
      expect(stringify(-9.8e30)).toEqual("-9.8e+30")
      expect(stringify(42e-30)).toEqual("4.2e-29")
      expect(stringify(9.8e-30)).toEqual("9.8e-30")
      expect(stringify(-42e-30)).toEqual("-4.2e-29")
      expect(stringify(-9.8e-30)).toEqual("-9.8e-30")
    })

    it("should stringify string", () => {
      expect(stringify("")).toEqual('""')
      expect(stringify('A "real" thing')).toEqual('"A \\"real\\" thing"')
      expect(stringify("foo\\bar")).toEqual('"foo\\\\bar"')
      expect(stringify("foo/bar")).toEqual('"foo/bar"')
      expect(stringify("foo\bbar")).toEqual('"foo\\bbar"')
      expect(stringify("foo\fbar")).toEqual('"foo\\fbar"')
      expect(stringify("foo\nbar")).toEqual('"foo\\nbar"')
      expect(stringify("foo\rbar")).toEqual('"foo\\rbar"')
      expect(stringify("foo\tbar")).toEqual('"foo\\tbar"')
    })
  })

  describe("complex values", () => {
    it("should stringify object structures", () => {
      expect(stringify({})).toEqual('{"__cirJsonId__":"1"}')

      expect(stringify({ foo: 1, bar: true, toto: "tata" })).toEqual(
        '{"__cirJsonId__":"1","foo":1,"bar":true,"toto":"tata"}',
      )

      expect(stringify({ foo: { bar: 1, buzz: false }, toto: "tata" })).toEqual(
        '{"__cirJsonId__":"1","foo":1,"bar":true,"toto":"tata"}',
      )
    })
  })
})
