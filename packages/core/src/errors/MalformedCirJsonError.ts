import { CirJsonError } from "./CirJsonError"

/**
 * Thrown when a reader encounters malformed JSON.
 */
export class MalformedCirJsonError extends CirJsonError {
  constructor(message: string) {
    super(message)
  }
}
