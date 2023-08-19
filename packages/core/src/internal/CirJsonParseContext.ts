import { CirJsonContext } from "../CirJsonContext"
import { PartialContext } from "./PartialContext"
import { ComplexStructure } from "../baseTypes"

export class CirJsonParseContext extends CirJsonContext {
  private context: PartialContext<ComplexStructure>

  private nextId = 1

  constructor() {
    super("parse")
    this.context = new PartialContext()
  }

  isIdAlreadyRegistered(id: string): boolean {
    this.assertParseMode()
    return this.context.getFromID(id) !== undefined
  }

  registerStructure(id: string, structure: ComplexStructure) {
    this.assertParseMode()
    this.context.insert(id, structure)
  }

  getStructureFromId(id: string): ComplexStructure | undefined {
    this.assertParseMode()
    return this.context.getFromID(id)
  }
}
