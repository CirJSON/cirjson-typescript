import { PartialContext } from "../../src/internal/PartialContext"

let partialContext: PartialContext<string>

type ParsedPartialContextArray = {
  key: string
  value: string
}

type ParsedPartialContext = {
  array: Array<ParsedPartialContextArray>
}

type EmptyObject = {
  [p: string]: never
}

function getPartialContextArray() {
  const foo = JSON.parse(JSON.stringify(partialContext)) as ParsedPartialContext
  return foo.array
}

describe("PartialContext.ts", () => {
  beforeEach(() => {
    partialContext = new PartialContext()
  })

  describe("insert", () => {
    it("should add new value", () => {
      partialContext.insert("foo", "bar")
      const partialContextArray = getPartialContextArray()
      expect(partialContextArray).toEqual([{ key: "foo", value: "bar" }])
    })

    it("should order values", () => {
      partialContext.insert("foo", "bar")

      partialContext.insert("buzz", "baz")
      expect(getPartialContextArray()).toEqual([
        { key: "buzz", value: "baz" },
        { key: "foo", value: "bar" },
      ])

      partialContext.insert("toto", "tata")
      expect(getPartialContextArray()).toEqual([
        { key: "buzz", value: "baz" },
        { key: "foo", value: "bar" },
        { key: "toto", value: "tata" },
      ])
    })

    it("should replace existing values", () => {
      partialContext.insert("foo", "bar")
      expect(getPartialContextArray()).toEqual([{ key: "foo", value: "bar" }])

      partialContext.insert("foo", "BAR")
      expect(getPartialContextArray()).toEqual([{ key: "foo", value: "BAR" }])

      partialContext.insert("buzz", "baz")
      expect(getPartialContextArray()).toEqual([
        { key: "buzz", value: "baz" },
        { key: "foo", value: "BAR" },
      ])
      partialContext.insert("buzz", "BAZ")
      expect(getPartialContextArray()).toEqual([
        { key: "buzz", value: "BAZ" },
        { key: "foo", value: "BAR" },
      ])

      partialContext.insert("toto", "tata")
      expect(getPartialContextArray()).toEqual([
        { key: "buzz", value: "BAZ" },
        { key: "foo", value: "BAR" },
        { key: "toto", value: "tata" },
      ])
      partialContext.insert("toto", "TATA")
      expect(getPartialContextArray()).toEqual([
        { key: "buzz", value: "BAZ" },
        { key: "foo", value: "BAR" },
        { key: "toto", value: "TATA" },
      ])

      partialContext.insert("foo", "bar")
      expect(getPartialContextArray()).toEqual([
        { key: "buzz", value: "BAZ" },
        { key: "foo", value: "bar" },
        { key: "toto", value: "TATA" },
      ])
    })
  })

  describe("getFromId", () => {
    it("should return value from ID", () => {
      partialContext.insert("foo", "bar")
      expect(partialContext.getFromID("foo")).toEqual("bar")

      partialContext.insert("buzz", "baz")
      expect(partialContext.getFromID("foo")).toEqual("bar")
      expect(partialContext.getFromID("buzz")).toEqual("baz")

      partialContext.insert("toto", "tata")
      expect(partialContext.getFromID("foo")).toEqual("bar")
      expect(partialContext.getFromID("buzz")).toEqual("baz")
      expect(partialContext.getFromID("toto")).toEqual("tata")
    })

    it("should return undefined for ID not existing", () => {
      expect(partialContext.getFromID("foo")).toEqual(undefined)
      expect(partialContext.getFromID("buzz")).toEqual(undefined)
      expect(partialContext.getFromID("toto")).toEqual(undefined)
      expect(partialContext.getFromID("nope")).toEqual(undefined)

      partialContext.insert("foo", "bar")
      expect(partialContext.getFromID("foo")).not.toEqual(undefined)
      expect(partialContext.getFromID("buzz")).toEqual(undefined)
      expect(partialContext.getFromID("toto")).toEqual(undefined)
      expect(partialContext.getFromID("nope")).toEqual(undefined)

      partialContext.insert("buzz", "baz")
      expect(partialContext.getFromID("foo")).not.toEqual(undefined)
      expect(partialContext.getFromID("buzz")).not.toEqual(undefined)
      expect(partialContext.getFromID("toto")).toEqual(undefined)
      expect(partialContext.getFromID("nope")).toEqual(undefined)

      partialContext.insert("toto", "tata")
      expect(partialContext.getFromID("foo")).not.toEqual(undefined)
      expect(partialContext.getFromID("buzz")).not.toEqual(undefined)
      expect(partialContext.getFromID("toto")).not.toEqual(undefined)
      expect(partialContext.getFromID("nope")).toEqual(undefined)
    })
  })

  describe("getValueID", () => {
    it("should return ID", () => {
      partialContext.insert("foo", "bar")
      expect(partialContext.getValueID("bar")).toEqual("foo")

      partialContext.insert("buzz", "baz")
      expect(partialContext.getValueID("bar")).toEqual("foo")
      expect(partialContext.getValueID("baz")).toEqual("buzz")

      partialContext.insert("toto", "tata")
      expect(partialContext.getValueID("bar")).toEqual("foo")
      expect(partialContext.getValueID("baz")).toEqual("buzz")
      expect(partialContext.getValueID("tata")).toEqual("toto")
    })

    it("should return undefined for value not existing", () => {
      expect(partialContext.getValueID("bar")).toEqual(undefined)
      expect(partialContext.getValueID("baz")).toEqual(undefined)
      expect(partialContext.getValueID("tata")).toEqual(undefined)
      expect(partialContext.getValueID("nope")).toEqual(undefined)

      partialContext.insert("foo", "bar")
      expect(partialContext.getValueID("bar")).not.toEqual(undefined)
      expect(partialContext.getValueID("baz")).toEqual(undefined)
      expect(partialContext.getValueID("tata")).toEqual(undefined)
      expect(partialContext.getValueID("nope")).toEqual(undefined)

      partialContext.insert("buzz", "baz")
      expect(partialContext.getValueID("bar")).not.toEqual(undefined)
      expect(partialContext.getValueID("baz")).not.toEqual(undefined)
      expect(partialContext.getValueID("tata")).toEqual(undefined)
      expect(partialContext.getValueID("nope")).toEqual(undefined)

      partialContext.insert("toto", "tata")
      expect(partialContext.getValueID("bar")).not.toEqual(undefined)
      expect(partialContext.getValueID("baz")).not.toEqual(undefined)
      expect(partialContext.getValueID("tata")).not.toEqual(undefined)
      expect(partialContext.getValueID("nope")).toEqual(undefined)
    })

    it("should work with object as values", () => {
      const o1 = {}
      const o2 = {}
      const o3 = {}
      const o4 = {}

      const pc = new PartialContext<EmptyObject>()

      expect(pc.getValueID(o1)).toEqual(undefined)
      expect(pc.getValueID(o2)).toEqual(undefined)
      expect(pc.getValueID(o3)).toEqual(undefined)
      expect(pc.getValueID(o4)).toEqual(undefined)

      pc.insert("foo", o1)
      expect(pc.getValueID(o1)).toEqual("foo")
      expect(pc.getValueID(o2)).toEqual(undefined)
      expect(pc.getValueID(o3)).toEqual(undefined)
      expect(pc.getValueID(o4)).toEqual(undefined)

      pc.insert("bar", o2)
      expect(pc.getValueID(o1)).toEqual("foo")
      expect(pc.getValueID(o2)).toEqual("bar")
      expect(pc.getValueID(o3)).toEqual(undefined)
      expect(pc.getValueID(o4)).toEqual(undefined)

      pc.insert("toto", o3)
      expect(pc.getValueID(o1)).toEqual("foo")
      expect(pc.getValueID(o2)).toEqual("bar")
      expect(pc.getValueID(o3)).toEqual("toto")
      expect(pc.getValueID(o4)).toEqual(undefined)
    })
  })
})
