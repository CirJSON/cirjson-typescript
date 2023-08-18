import { CirJsonContext } from "../CirJsonContext"
import { PartialContext } from "./PartialContext"
import { ComplexStructure } from "../baseTypes"

export class CirJsonStringifyContext extends CirJsonContext {
  private context: PartialContext<ComplexStructure>

  private nextId = 1

  constructor() {
    super("stringify")
    this.context = new PartialContext()
  }

  isStructureAlreadyStringified(structure: ComplexStructure): boolean {
    this.assertStringifyMode()
    return this.context.getValueID(structure) !== undefined
  }

  getStructureId(structure: ComplexStructure): string {
    this.assertStringifyMode()
    const searchedId = this.context.getValueID(structure)

    if (searchedId !== undefined) {
      return searchedId
    }

    const id = this.getNextId()
    this.context.insert(id, structure)
    return id
  }

  private getNextId(): string {
    return `${this.nextId++}`
  }
}
