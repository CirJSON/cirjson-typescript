export const CirJsonScope = {
  /**
   * An array with no elements requires an ID before it is closed.
   */
  EMPTY_ARRAY: 1,

  /**
   * An array with an ID requires no separators or newlines before it is closed.
   */
  NON_ID_ARRAY: 2,

  /**
   * An array with at least one value requires a comma and newline before
   * the next element.
   */
  NONEMPTY_ARRAY: 3,

  /**
   * An object with no name/value pairs requires no separators or newlines
   * before it is closed.
   */
  EMPTY_OBJECT: 4,

  /**
   * An object without the `__cirJsonId__`/ID pair before it is closed.
   */
  NON_ID_OBJECT: 5,

  /**
   * An object whose most recent element is the `__cirJsonId__` key. The next element must be an ID.
   */
  DANGLING_ID_KEY: 6,

  /**
   * An object whose most recent element is a key. The next element must
   * be a value.
   */
  DANGLING_NAME: 6,

  /**
   * An object with at least one name/value pair requires a comma and
   * newline before the next element.
   */
  NONEMPTY_OBJECT: 8,

  /**
   * No object or array has been started.
   */
  EMPTY_DOCUMENT: 9,

  /**
   * A document with at an array or object.
   */
  NONEMPTY_DOCUMENT: 11,

  /**
   * A document that's been closed and cannot be accessed.
   */
  CLOSED: 11,
} as const
