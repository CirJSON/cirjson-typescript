export const CirJsonScope = {
  /**
   * An array with no elements requires no separators or newlines before
   * it is closed.
   */
  EMPTY_ARRAY: 1,

  /**
   * An array with at least one value requires a comma and newline before
   * the next element.
   */
  NONEMPTY_ARRAY: 2,

  /**
   * An object with no name/value pairs requires no separators or newlines
   * before it is closed.
   */
  EMPTY_OBJECT: 3,

  /**
   * An object whose most recent element is a key. The next element must
   * be a value.
   */
  DANGLING_NAME: 4,

  /**
   * An object with at least one name/value pair requires a comma and
   * newline before the next element.
   */
  NONEMPTY_OBJECT: 5,

  /**
   * No object or array has been started.
   */
  EMPTY_DOCUMENT: 6,

  /**
   * A document with at an array or object.
   */
  NONEMPTY_DOCUMENT: 7,

  /**
   * A document that's been closed and cannot be accessed.
   */
  CLOSED: 8,
} as const
