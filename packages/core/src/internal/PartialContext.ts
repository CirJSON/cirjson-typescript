import { Pair } from "./Pair"

export class PartialContext<T> {
  private array: Array<Pair<string, T>>

  constructor() {
    this.array = []
  }

  getFromID(id: string): T | undefined {
    if (this.array.length === 0) {
      return undefined
    }

    let left = 0
    let right = this.array.length - 1

    while (left < right) {
      const m = Math.floor((left + right) / 2)
      if (this.array[m].key < id) {
        left = m + 1
      } else if (this.array[m].key > id) {
        right = m - 1
      } else {
        return this.array[m].value
      }
    }

    if (this.array[left].key === id) {
      return this.array[left].value
    }

    return undefined
  }

  getValueID(value: T): string | undefined {
    for (const pair of this.array) {
      if (value === pair.value) {
        return pair.key
      }
    }

    return undefined
  }

  insert(id: string, value: T) {
    if (this.array.length === 0) {
      this.array.push(new Pair(id, value))
      return
    }

    if (this.array.length === 1) {
      this.insertIntoArraySizeOne(id, value)
      return
    }

    this.insertIntoArray(id, value)
  }

  private insertIntoArraySizeOne(id: string, value: T) {
    const existingValueKey = this.array[0].key

    if (id === existingValueKey) {
      this.array.splice(0, 1, new Pair(id, value))
      return
    }

    if (id < existingValueKey) {
      this.array.splice(0, 0, new Pair(id, value))
      return
    }

    this.array.push(new Pair(id, value))
  }

  private insertIntoArray(id: string, value: T) {
    let left = 0
    let right = this.array.length - 1

    while (left < right) {
      const m = Math.floor((left + right) / 2)
      if (this.array[m].key < id) {
        left = m + 1
      } else if (this.array[m].key > id) {
        right = m - 1
      } else {
        this.array.splice(m, 1, new Pair(id, value))
        return
      }
    }

    if (id < this.array[left].key) {
      this.array.splice(left, 0, new Pair(id, value))
    } else if (id > this.array[left].key) {
      this.array.splice(left + 1, 0, new Pair(id, value))
    } else if (id === this.array[left].key) {
      this.array.splice(left, 1, new Pair(id, value))
    }
  }
}
