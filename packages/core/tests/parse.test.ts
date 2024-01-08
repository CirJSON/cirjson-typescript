import { parse } from "../src/parse"
import { ArrayStructure, ObjectStructure } from "../src/baseTypes"

describe("parse", function () {
  describe("primitives", function () {
    it("should parse booleans", function () {
      expect(parse<boolean>("true")).toEqual(true)
      expect(parse<boolean>("false")).toEqual(false)
    })

    it("should parse numbers", function () {
      expect(parse<number>("42")).toEqual(42)
      expect(parse<number>("9.8")).toEqual(9.8)
      expect(parse<number>("-42")).toEqual(-42)
      expect(parse<number>("-9.8")).toEqual(-9.8)
      expect(parse<number>("42e30")).toEqual(42e30)
      expect(parse<number>("9.8e30")).toEqual(9.8e30)
      expect(parse<number>("-42e30")).toEqual(-42e30)
      expect(parse<number>("-9.8e30")).toEqual(-9.8e30)
      expect(parse<number>("42e-30")).toEqual(42e-30)
      expect(parse<number>("9.8e-30")).toEqual(9.8e-30)
      expect(parse<number>("-42e-30")).toEqual(-42e-30)
      expect(parse<number>("-9.8e-30")).toEqual(-9.8e-30)
    })

    it("should parse string", function () {
      expect(parse<string>('""')).toEqual("")
      expect(parse<string>('"A \\"real\\" thing"')).toEqual('A "real" thing')
      expect(parse<string>('"foo\\\\bar"')).toEqual("foo\\bar")
      expect(parse<string>('"foo/bar"')).toEqual("foo/bar")
      expect(parse<string>('"foo\\bbar"')).toEqual("foo\bbar")
      expect(parse<string>('"foo\\fbar"')).toEqual("foo\fbar")
      expect(parse<string>('"foo\\nbar"')).toEqual("foo\nbar")
      expect(parse<string>('"foo\\rbar"')).toEqual("foo\rbar")
      expect(parse<string>('"foo\\tbar"')).toEqual("foo\tbar")
    })
  })

  describe("complex structures", function () {
    it("should parse object structures", function () {
      expect(parse<ObjectStructure>('{"__cirJsonId__":"1"}')).toEqual({})

      expect(parse<ObjectStructure>('{"__cirJsonId__":"1","foo":1,"bar":true,"toto":"tata"}')).toEqual({
        foo: 1,
        bar: true,
        toto: "tata",
      })

      expect(
        parse<ObjectStructure>('{"__cirJsonId__":"1","foo":{"__cirJsonId__":"2","bar":1,"buzz":false},"toto":"tata"}'),
      ).toEqual({ foo: { bar: 1, buzz: false }, toto: "tata" })

      expect(parse<ObjectStructure>('{"__cirJsonId__":"1","foo":["2","bar",1,false],"toto":"tata"}')).toEqual({
        foo: ["bar", 1, false],
        toto: "tata",
      })

      expect(
        parse<ObjectStructure>(
          '{"__cirJsonId__":"1","foo":["2",{"__cirJsonId__":"3","bar":1,"buzz":false}],"toto":"tata"}',
        ),
      ).toEqual({ foo: [{ bar: 1, buzz: false }], toto: "tata" })

      expect(parse<ObjectStructure>('{"__cirJsonId__":"1","foo":42,"buzz":null}')).toEqual({ foo: 42, buzz: null })
    })

    it("should parse array structures", function () {
      expect(parse<ArrayStructure<unknown>>('["1"]')).toEqual([])
      expect(parse<ArrayStructure<unknown>>('["1","foo"]')).toEqual(["foo"])
      expect(parse<ArrayStructure<unknown>>('["1",1]')).toEqual([1])
      expect(parse<ArrayStructure<unknown>>('["1",true]')).toEqual([true])

      expect(parse<ArrayStructure<unknown>>('["1",{"__cirJsonId__":"2","bar":1,"buzz":false}]')).toEqual([
        { bar: 1, buzz: false },
      ])
      expect(parse<ArrayStructure<unknown>>('["1",["2","foo"],{"__cirJsonId__":"3","bar":1,"buzz":false}]')).toEqual([
        ["foo"],
        { bar: 1, buzz: false },
      ])
    })

    describe("recursive complex structures", function () {
      it("should parse recursive object structures", function () {
        const obj1 = parse<ObjectStructure>('{"__cirJsonId__":"1","foo":{"__cirJsonId__":"1"}}')
        expect(obj1).toBe(obj1.foo)
        expect(Object.keys(obj1).length).toEqual(1)

        const obj2 = parse<ObjectStructure>(
          '{"__cirJsonId__":"1","bar":true,"toto":"tata","foo":{"__cirJsonId__":"1"}}',
        )
        expect(Object.keys(obj2)).toEqual(["bar", "toto", "foo"])
        for (const key of Object.keys(obj2)) {
          const value = obj2[key]
          switch (key) {
            case "bar": {
              expect(value).toEqual(true)
              break
            }
            case "toto": {
              expect(value).toEqual("tata")
              break
            }
            case "foo": {
              expect(value).toEqual(obj2)
              break
            }
          }
        }

        const obj3 = parse<ObjectStructure>(
          '{"__cirJsonId__":"1","foo":["2",{"__cirJsonId__":"1"}],"bar":true,"toto":"tata"}',
        )
        expect(Object.keys(obj3)).toEqual(["foo", "bar", "toto"])
        for (const key of Object.keys(obj3)) {
          const value = obj3[key]
          switch (key) {
            case "bar": {
              expect(value).toEqual(true)
              break
            }
            case "toto": {
              expect(value).toEqual("tata")
              break
            }
            case "foo": {
              expect(value).toEqual([obj3])
              break
            }
          }
        }
      })

      it("should parse recursive array structures", function () {
        const arr1 = parse<ArrayStructure<unknown>>('["1",["1"]]')
        expect(arr1[0]).toBe(arr1)
        expect(arr1.length).toEqual(1)

        const arr2 = parse<ArrayStructure<unknown>>('["1","foo",42,true,["1"]]')
        expect(arr2.length).toEqual(4)
        expect(arr2[0]).toEqual("foo")
        expect(arr2[1]).toEqual(42)
        expect(arr2[2]).toEqual(true)
        expect(arr2[3]).toEqual(arr2)

        const arr3 = parse<ArrayStructure<unknown>>('["1","foo",{"__cirJsonId__":"2","foo":["1"]},true]')
        expect(arr3.length).toEqual(3)
        expect(arr3[0]).toEqual("foo")
        expect(arr3[1]).toEqual({ foo: arr3 })
        expect(arr3[2]).toEqual(true)
      })
    })

    describe("failing complex structures", function () {
      describe("failing arrays", function () {
        it("should throw CirJsonError if the array is empty", function () {
          expect(() => parse<ArrayStructure<unknown>>("[]")).toThrowError()
        })

        it("should throw CirJsonError if the array does not start with an ID", function () {
          expect(() => parse<ArrayStructure<unknown>>("[9]")).toThrowError()
        })

        it("should throw CirJsonError if the array starts with an empty ID", function () {
          expect(() => parse<ArrayStructure<unknown>>('[""]')).toThrowError()
        })
      })

      describe("failing object", function () {
        it("should throw CirJsonError if the object does not have the `__cirJsonId__` key", function () {
          expect(() => parse<ObjectStructure>("{}")).toThrowError()
          expect(() => parse<ObjectStructure>('{"foo":"bar"}')).toThrowError()
        })

        it("should throw CirJsonError if the object does not have an ID as its `__cirJsonId__`", function () {
          expect(() => parse<ObjectStructure>('{"__cirJsonId__":9}')).toThrowError()
        })

        it("should throw CirJsonError if the object starts has an empty ID as its `__cirJsonId__`", function () {
          expect(() => parse<ObjectStructure>('{"__cirJsonId__":""}')).toThrowError()
        })
      })
    })
  })
})
