import { CirJsonError } from "./CirJsonError"
import { ContextMode } from "./CirJsonContext"

export class WrongCirJsonContextError extends CirJsonError {
  constructor(mode: ContextMode) {
    super(`Wrong context. Expected to be "${mode === "stringify" ? "parse" : "stringify"}", got "${mode}".`)
  }
}
