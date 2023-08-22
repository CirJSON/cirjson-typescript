import { CirJsonError } from "./CirJsonError"

export class IllegalCirJsonStateError extends CirJsonError {
  constructor(message: string) {
    super(message)
  }
}
