import { WrongCirJsonContextError } from "./WrongCirJsonContextError"

export type ContextMode = "stringify" | "parse"

export abstract class CirJsonContext {
  /**
   * The mode of the context
   */
  readonly mode: ContextMode

  protected constructor(mode: ContextMode) {
    this.mode = mode
  }

  protected assertStringifyMode() {
    if (this.mode !== "stringify") {
      throw new WrongCirJsonContextError(this.mode)
    }
  }

  protected assertParseMode() {
    if (this.mode !== "parse") {
      throw new WrongCirJsonContextError(this.mode)
    }
  }
}
