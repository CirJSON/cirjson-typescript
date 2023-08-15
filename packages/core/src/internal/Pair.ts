export class Pair<K, V> {
  readonly key: K

  readonly value: V
  constructor(key: K, value: V) {
    this.key = key
    this.value = value
  }
}
