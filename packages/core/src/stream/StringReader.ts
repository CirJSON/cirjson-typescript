import { CirJsonError } from "../errors/CirJsonError"

export class StringReader {
  private next = 0

  private readonly str: string

  private readonly length: number

  constructor(s: string) {
    this.str = s
    this.length = s.length
  }

  read(cBuf: Array<string | null>, off: number, len: number): number {
    this.checkFromIndexSize(off, len, cBuf.length)
    if (len === 0) {
      return 0
    }

    if (this.next >= this.length) {
      return -1
    }

    const n = Math.min(this.length - this.next, len)
    this.getChars(this.str, this.next, this.next + n, cBuf, off)
    this.next += n
    return n
  }

  private checkFromIndexSize(fromIndex: number, size: number, length: number) {
    if ((length | fromIndex | size) < 0 || size > length - fromIndex) {
      throw new CirJsonError(`Range [${fromIndex}, ${fromIndex} + ${size}) out of bounds for length ${length}`)
    }

    return fromIndex
  }

  private getChars(s: string, srcBegin: number, srcEnd: number, dst: Array<string | null>, dstBegin: number) {
    for (let i = 0; i < srcEnd - srcBegin; i++) {
      dst[dstBegin + i] = s[srcBegin + i]
    }
  }
}
