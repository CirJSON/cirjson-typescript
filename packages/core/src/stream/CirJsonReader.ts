import { CirJsonScope } from "./CirJsonScope"
import { IllegalCirJsonStateError } from "../errors/IllegalCirJsonStateError"

const MIN_INCOMPLETE_INTEGER = Number.MIN_SAFE_INTEGER

const PEEKED_NONE = 0
const PEEKED_BEGIN_OBJECT = 1
const PEEKED_END_OBJECT = 2
const PEEKED_BEGIN_ARRAY = 3
const PEEKED_END_ARRAY = 4
const PEEKED_TRUE = 5
const PEEKED_FALSE = 6
const PEEKED_NULL = 7
const PEEKED_SINGLE_QUOTED = 8
const PEEKED_DOUBLE_QUOTED = 9
const PEEKED_UNQUOTED = 10

const PEEKED_BUFFERED = 11
const PEEKED_SINGLE_QUOTED_NAME = 12
const PEEKED_DOUBLE_QUOTED_NAME = 13
const PEEKED_UNQUOTED_NAME = 14

const PEEKED_LONG = 15
const PEEKED_NUMBER = 16
const PEEKED_EOF = 17

const NUMBER_CHAR_NONE = 0
const NUMBER_CHAR_SIGN = 1
const NUMBER_CHAR_DIGIT = 2
const NUMBER_CHAR_DECIMAL = 3
const NUMBER_CHAR_FRACTION_DIGIT = 4
const NUMBER_CHAR_EXP_E = 5
const NUMBER_CHAR_EXP_SIGN = 6
const NUMBER_CHAR_EXP_DIGIT = 7

function arrayOfNulls<T>(size: number): Array<T | null> {
  const array: Array<T | null> = []

  while (size > array.length) {
    array.push(null)
  }

  return array
}

export class CirJsonReader {
  private input: string

  /**
   * Use a manual buffer to easily read and unread upcoming characters, and
   * also so we can create strings without an intermediate StringBuilder.
   * We decode literals directly out of this buffer, so it must be at least as
   * long as the longest token that can be reported as a number.
   */
  private buffer = arrayOfNulls<string>(1024)

  private pos = 0
  private limit = 0

  private lineNumber = 0
  private lineStart = 0

  peeked = PEEKED_NONE

  /**
   * A peeked value that was composed entirely of digits with an optional
   * leading dash. Positive values may not have a leading 0.
   */
  private peekedLong = 0

  /**
   * The number of characters in a peeked number literal. Increment 'pos' by
   * this after reading a number.
   */
  private peekedNumberLength = 0

  /**
   * A peeked string that should be parsed on the next double, long or string.
   * This is populated before a numeric value is parsed and used if that parsing
   * fails.
   */
  private peekedString: string | null = null

  private stack = arrayOfNulls<number>(32)
  private stackSize = 0

  private pathNames = arrayOfNulls<string>(32)
  private pathIndices = arrayOfNulls<number>(32)

  constructor(input: string) {
    this.input = input
    this.stack[this.stackSize++] = CirJsonScope.EMPTY_DOCUMENT
  }

  beginArray() {
    let p = this.peeked
    if (p === PEEKED_NONE) {
      p = this.doPeek()
    }

    if (p === PEEKED_BEGIN_ARRAY) {
      this.push(CirJsonScope.EMPTY_ARRAY)
      this.pathIndices[this.stackSize - 1] = 0
      this.peeked = PEEKED_NONE
    } else {
      throw this.unexpectedTokenError("BEGIN_ARRAY")
    }
  }

  private unexpectedTokenError(expected: string): IllegalCirJsonStateError {
    const peeked = this.peek()
    return new IllegalCirJsonStateError(`Expected ${expected} but was ${peeked}${this.locationString()}`)
  }
}
