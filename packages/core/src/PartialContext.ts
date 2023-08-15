import { Pair } from "./internal/Pair"

export class PartialContext<T> {
  private array: Array<Pair<string, T>>

  constructor() {
    this.array = []
  }

  getFromID(id: string): T | undefined {
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

    const a = 1 + 2
    return
  }

  insert(id: string, value: T) {
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
      }
    }

    this.array.splice(left, 0, new Pair(id, value))
  }
}
