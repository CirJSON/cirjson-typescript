import { stringify } from "../src/stringify"
import { ArrayStructure, ObjectStructure } from "../src/baseTypes"

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

  describe("complex structures", () => {
    it("should stringify object structures", () => {
      expect(stringify({})).toEqual('{"__cirJsonId__":"1"}')

      expect(stringify({ foo: 1, bar: true, toto: "tata" })).toEqual(
        '{"__cirJsonId__":"1","foo":1,"bar":true,"toto":"tata"}',
      )

      expect(stringify({ foo: { bar: 1, buzz: false }, toto: "tata" })).toEqual(
        '{"__cirJsonId__":"1","foo":{"__cirJsonId__":"2","bar":1,"buzz":false},"toto":"tata"}',
      )

      expect(stringify({ foo: ["bar", 1, false], toto: "tata" })).toEqual(
        '{"__cirJsonId__":"1","foo":["2","bar",1,false],"toto":"tata"}',
      )

      expect(stringify({ foo: [{ bar: 1, buzz: false }], toto: "tata" })).toEqual(
        '{"__cirJsonId__":"1","foo":["2",{"__cirJsonId__":"3","bar":1,"buzz":false}],"toto":"tata"}',
      )

      expect(stringify({ foo: 42, bar: undefined, buzz: null, toto() {} })).toEqual(
        '{"__cirJsonId__":"1","foo":42,"buzz":null}',
      )
    })

    it("should stringify array structures", () => {
      expect(stringify([])).toEqual('["1"]')
      expect(stringify(["foo"])).toEqual('["1","foo"]')
      expect(stringify([1])).toEqual('["1",1]')
      expect(stringify([true])).toEqual('["1",true]')

      expect(stringify([{ bar: 1, buzz: false }])).toEqual('["1",{"__cirJsonId__":"2","bar":1,"buzz":false}]')
      expect(stringify([["foo"], { bar: 1, buzz: false }])).toEqual(
        '["1",["2","foo"],{"__cirJsonId__":"3","bar":1,"buzz":false}]',
      )
    })

    describe("recursive complex structures", () => {
      it("should stringify recursive object structures", () => {
        const obj1: ObjectStructure = {}
        obj1.foo = obj1
        expect(stringify(obj1)).toEqual('{"__cirJsonId__":"1","foo":{"__cirJsonId__":"1"}}')

        const obj2: ObjectStructure = { bar: true, toto: "tata" }
        obj2.foo = obj2
        expect(stringify(obj2)).toEqual('{"__cirJsonId__":"1","bar":true,"toto":"tata","foo":{"__cirJsonId__":"1"}}')

        const obj3 = { foo: [] as Array<ObjectStructure>, bar: true, toto: "tata" }
        obj3.foo.push(obj3)
        expect(stringify(obj3)).toEqual(
          '{"__cirJsonId__":"1","foo":["2",{"__cirJsonId__":"1"}],"bar":true,"toto":"tata"}',
        )
      })

      it("should stringify recursive array structures", () => {
        const arr1: ArrayStructure<unknown> = []
        arr1.push(arr1)
        expect(stringify(arr1)).toEqual('["1",["1"]]')

        const arr2: ArrayStructure<unknown> = ["foo", 42, true]
        arr2.push(arr2)
        expect(stringify(arr2)).toEqual('["1","foo",42,true,["1"]]')

        const arr3: ArrayStructure<unknown> = ["foo", {}, true]
        ;(arr3[1] as ObjectStructure).foo = arr3
        expect(stringify(arr3)).toEqual('["1","foo",{"__cirJsonId__":"2","foo":["1"]},true]')
      })
    })
  })
})
