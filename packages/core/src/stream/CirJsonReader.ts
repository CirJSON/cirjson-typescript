import { CirJsonScope } from "./CirJsonScope"
import { IllegalCirJsonStateError } from "../errors/IllegalCirJsonStateError"
import { CirJsonError } from "../errors/CirJsonError"
import { CirJsonToken } from "./CirJsonToken"
import { arrayOfNulls, arrayCopy } from "../utils/arrayUtils"
import { MalformedCirJsonError } from "../errors/MalformedCirJsonError"
import { StringReader } from "./StringReader"

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

export class CirJsonReader {
  private input: StringReader

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
    this.input = new StringReader(input)
    this.stack[this.stackSize++] = CirJsonScope.EMPTY_DOCUMENT
  }

  /**
   * Consumes the next token from the CirJSON stream and asserts that it is the beginning of a new array.
   */
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

  /**
   * Consumes the next token from the CirJSON stream and asserts that it is the
   * end of the current array.
   */
  endArray() {
    let p = this.peeked
    if (p == PEEKED_NONE) {
      p = this.doPeek()
    }
    if (p == PEEKED_END_ARRAY) {
      this.stackSize--
      this.pathIndices[this.stackSize - 1]!++
      this.peeked = PEEKED_NONE
    } else {
      throw this.unexpectedTokenError("END_ARRAY")
    }
  }

  /**
   * Consumes the next token from the JSON stream and asserts that it is the
   * beginning of a new object.
   */
  beginObject() {
    let p = this.peeked
    if (p == PEEKED_NONE) {
      p = this.doPeek()
    }

    if (p == PEEKED_BEGIN_OBJECT) {
      this.push(CirJsonScope.EMPTY_OBJECT)
      this.peeked = PEEKED_NONE
    } else {
      throw this.unexpectedTokenError("BEGIN_OBJECT")
    }
  }

  /**
   * Consumes the next token from the JSON stream and asserts that it is the
   * end of the current object.
   */
  endObject() {
    let p = this.peeked
    if (p == PEEKED_NONE) {
      p = this.doPeek()
    }

    if (p == PEEKED_END_OBJECT) {
      this.stackSize--
      this.pathNames[this.stackSize] = null // Free the last path name so that it can be garbage collected!
      this.pathIndices[this.stackSize - 1]!++
      this.peeked = PEEKED_NONE
    } else {
      throw this.unexpectedTokenError("END_OBJECT")
    }
  }

  peek(): CirJsonToken {
    let p = this.peeked
    if (p === PEEKED_NONE) {
      p = this.doPeek()
    }

    switch (p) {
      case PEEKED_BEGIN_OBJECT:
        return CirJsonToken.BEGIN_OBJECT
      case PEEKED_END_OBJECT:
        return CirJsonToken.END_OBJECT
      case PEEKED_BEGIN_ARRAY:
        return CirJsonToken.BEGIN_ARRAY
      case PEEKED_END_ARRAY:
        return CirJsonToken.END_ARRAY
      case PEEKED_SINGLE_QUOTED_NAME:
      case PEEKED_DOUBLE_QUOTED_NAME:
      case PEEKED_UNQUOTED_NAME:
        return CirJsonToken.NAME
      case PEEKED_TRUE:
      case PEEKED_FALSE:
        return CirJsonToken.BOOLEAN
      case PEEKED_NULL:
        return CirJsonToken.NULL
      case PEEKED_SINGLE_QUOTED:
      case PEEKED_DOUBLE_QUOTED:
      case PEEKED_UNQUOTED:
      case PEEKED_BUFFERED:
        return CirJsonToken.STRING
      case PEEKED_LONG:
      case PEEKED_NUMBER:
        return CirJsonToken.NUMBER
      case PEEKED_EOF:
        return CirJsonToken.END_DOCUMENT
      default:
        throw new CirJsonError("Well that's weird. Peeked failed")
    }
  }

  doPeek(): number {
    const peekStack = this.stack[this.stackSize - 1] as number

    const arrayPeek = this.doArrayPeek(peekStack)
    if (arrayPeek !== undefined) {
      return arrayPeek
    }

    const objectPeek = this.doObjectPeek(peekStack)
    if (objectPeek !== undefined) {
      return objectPeek
    }
  }

  private doArrayPeek(peekStack: number): number | undefined {
    if (peekStack === CirJsonScope.EMPTY_ARRAY) {
      this.stack[this.stackSize - 1] = CirJsonScope.NON_ID_ARRAY
    } else {
      const c = String.fromCharCode(this.nextNonWhitespace(true))
      if (peekStack === CirJsonScope.NON_ID_ARRAY && c !== '"') {
        throw new MalformedCirJsonError(`Expected '"' to signify an array ID, got ${c} instead.`)
      } else {
        switch (c) {
          case "]":
            return (this.peeked = PEEKED_END_ARRAY)
          case ",":
            break
          default:
            throw this.syntaxError("Unterminated array")
        }
      }
    }
  }

  private doObjectPeek(peekStack: number): number | undefined {
    if (peekStack === CirJsonScope.EMPTY_OBJECT) {
      this.stack[this.stackSize - 1] = CirJsonScope.DANGLING_ID_KEY
      const c = String.fromCharCode(this.nextNonWhitespace(true))
      if (c === '"') {
        return (this.peeked = PEEKED_DOUBLE_QUOTED)
      } else {
        throw this.syntaxError("Needs the object ID")
      }
    }

    if (peekStack === CirJsonScope.NONEMPTY_OBJECT) {
      this.stack[this.stackSize - 1] = CirJsonScope.DANGLING_NAME
      const c = String.fromCharCode(this.nextNonWhitespace(true))
      switch (c) {
        case "}":
          return (this.peeked = PEEKED_END_OBJECT)
        case ",":
          break
        default:
          throw this.syntaxError("Unterminated object")
      }
    }

    const c = String.fromCharCode(this.nextNonWhitespace(true))
    switch (c) {
      case '"':
        return (this.peeked = PEEKED_DOUBLE_QUOTED_NAME)
    }
  }

  private push(newTop: number) {
    if (this.stackSize === this.stack.length) {
      const newLength = this.stackSize * 2
      this.stack = arrayCopy(this.stack, newLength)
      this.pathIndices = arrayCopy(this.pathIndices, newLength)
      this.pathNames = arrayCopy(this.pathNames, newLength)
    }
    this.stack[this.stackSize++] = newTop
  }

  /**
   * Returns true once `limit - pos >= minimum`. If the data is
   * exhausted before that many characters are available, this returns
   * false.
   */
  private fillBuffer(minimum: number) {
    const buffer = this.buffer
    this.lineStart -= this.pos
    if (this.limit !== this.pos) {
      this.limit -= this.pos
      buffer.copyWithin(0, this.pos, this.limit - this.pos)
    } else {
      this.limit = 0
    }

    this.pos = 0
    let total: number
    while ((total = this.input.read(buffer, this.limit, buffer.length - this.limit)) !== -1) {
      this.limit += total

      if (this.lineNumber === 0 && this.lineStart === 0 && this.limit > 0 && buffer[0] === "\ufeff") {
        this.pos++
        this.lineStart++
        minimum++
      }

      if (this.limit >= minimum) {
        return true
      }
    }

    return false
  }

  /**
   * Returns the next character in the stream that is neither whitespace nor a
   * part of a comment. When this returns, the returned character is always at
   * `buffer[pos-1]`; this means the caller can always push back the
   * returned character by decrementing `pos`.
   */
  private nextNonWhitespace(throwOnEof: boolean): number {
    /*
     * This code uses ugly local variables 'p' and 'l' representing the 'pos'
     * and 'limit' fields respectively. Using locals rather than fields saves
     * a few field reads for each whitespace character in a pretty-printed
     * document, resulting in a 5% speedup. We need to flush 'p' to its field
     * before any (potentially indirect) call to fillBuffer() and reread both
     * 'p' and 'l' after any (potentially indirect) call to the same method.
     */
    const buffer = this.buffer
    let p = this.pos
    let l = this.limit

    while (true) {
      if (p == l) {
        this.pos = p
        if (!this.fillBuffer(1)) {
          break
        }
        p = this.pos
        l = this.limit
      }

      const c = buffer[p++]
      if (c == "\n") {
        this.lineNumber++
        this.lineStart = p
        continue
      } else if (c === " " || c === "\r" || c === "\t") {
        continue
      }

      if (c === "/") {
        this.pos = p
        if (p == l) {
          this.pos-- // push back '/' so it's still in the buffer when this method returns
          const charsLoaded = this.fillBuffer(2)
          this.pos++ // consume the '/' again
          if (!charsLoaded) {
            return c.charCodeAt(0)
          }
        }
      } else {
        this.pos = p
        return c!.charCodeAt(0)
      }
    }

    if (!throwOnEof) {
      return -1
    }

    throw new CirJsonError("End of input" + this.locationString())
  }

  /**
   * @param toFind a string to search for. Must not contain a newline.
   */
  private skipTo(toFind: string): boolean {
    const length = toFind.length

    outer: for (; this.pos + length <= this.limit || this.fillBuffer(length); this.pos++) {
      if (this.buffer[this.pos] == "\n") {
        this.lineNumber++
        this.lineStart = this.pos + 1
        continue
      }
      for (let c = 0; c < length; c++) {
        if (this.buffer[this.pos + c] != toFind.charAt(c)) {
          continue outer
        }
      }
      return true
    }

    return false
  }

  private locationString(): string {
    const line = this.lineNumber + 1
    const column = this.pos - this.lineStart + 1
    return ` at line ${line} column ${column} path ${this.getPath()}`
  }

  private internalGetPath(usePreviousPath: boolean): string {
    let result = "$"
    for (let i = 0; i < this.stackSize; i++) {
      switch (this.stack[i]) {
        case CirJsonScope.EMPTY_ARRAY:
        case CirJsonScope.NONEMPTY_ARRAY:
          let pathIndex = this.pathIndices[i] as number
          // If index is last path element it points to next array element; have to decrement
          if (usePreviousPath && pathIndex > 0 && i == this.stackSize - 1) {
            pathIndex--
          }
          result += "[" + pathIndex + "]"
          break
        case CirJsonScope.EMPTY_OBJECT:
        case CirJsonScope.DANGLING_NAME:
        case CirJsonScope.NONEMPTY_OBJECT:
          result += "."
          if (this.pathNames[i] != null) {
            result += this.pathNames[i]
          }
          break
        case CirJsonScope.NONEMPTY_DOCUMENT:
        case CirJsonScope.EMPTY_DOCUMENT:
        case CirJsonScope.CLOSED:
          break
      }
    }

    return result
  }

  getPreviousPath(): string {
    return this.internalGetPath(true)
  }

  getPath(): string {
    return this.internalGetPath(false)
  }

  /**
   * Unescapes the character identified by the character or characters that
   * immediately follow a backslash. The backslash '\' should have already
   * been read. This supports both Unicode escapes "u000A" and two-character
   * escapes "\n".
   *
   * @throws MalformedJsonException if any Unicode escape sequences are
   *     malformed.
   */
  private readEscapeCharacter(): string {
    if (this.pos == this.limit && !this.fillBuffer(1)) {
      throw this.syntaxError("Unterminated escape sequence")
    }

    const escaped = this.buffer[this.pos++]
    switch (escaped) {
      case "u":
        if (this.pos + 4 > this.limit && !this.fillBuffer(4)) {
          throw this.syntaxError("Unterminated escape sequence")
        }

        let unicodeStr = ""
        let i = this.pos
        for (const end = i + 4; i < end; i++) {
          unicodeStr += this.buffer[i] as string
        }

        if (!/[A-Fa-f0-9]{4}/.test(unicodeStr)) {
          throw this.syntaxError(`Malformed Unicode escape \\u${unicodeStr}`)
        }
        this.pos += 4
        return String.fromCharCode(parseInt(unicodeStr, 16))
      case "t":
        return "\t"

      case "b":
        return "\b"

      case "n":
        return "\n"

      case "r":
        return "\r"

      case "f":
        return "\f"

      case '"':
      case "\\":
      case "/":
        return escaped
      default:
        // throw error when none of the above cases are matched
        throw this.syntaxError("Invalid escape sequence")
    }
  }

  private syntaxError(message: string): MalformedCirJsonError {
    return new MalformedCirJsonError(message + this.locationString())
  }

  private unexpectedTokenError(expected: string): IllegalCirJsonStateError {
    const peeked = this.peek()
    return new IllegalCirJsonStateError(`Expected ${expected} but was ${peeked}${this.locationString()}`)
  }
}
