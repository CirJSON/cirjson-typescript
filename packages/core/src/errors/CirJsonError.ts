export class CirJsonError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
  }
}
