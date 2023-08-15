import {WrongCirJsonContextError} from "./WrongCirJsonContextError";

export type ContextMode = "stringify" | "parse"

export class CirJsonContext {
  /**
   * The mode of the context
   */
  readonly mode: ContextMode

  private context: { [k: string]: unknown }

  private nextId: number

  constructor(mode: ContextMode) {
    this.mode = mode
    this.context = {}
    this.nextId = 1
  }

  /**
   * Gets the ID of the structure.
   *
   * If the structure already has an ID, it returns the ID, otherwise it creates a new one.
   *
   * Only used when {@link mode} is `"stringify"`.
   *
   * @param structure the structure that needs its ID.
   *
   * @throws
   */
  getIdOfStructure<T>(structure: T) {
    this.assertStringifyMode()
    for (const key of Object.keys(this.context)) {

    }
  }

  private assertStringifyMode() {
    if (this.mode !== "stringify") {
      throw new WrongCirJsonContextError(this.mode)
    }
  }


}
