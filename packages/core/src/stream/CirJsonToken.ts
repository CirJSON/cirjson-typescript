/**
 * A structure, name or value type in a CirJSON-encoded string.
 */
export enum CirJsonToken {
  /**
   * The opening of a CirJSON array. Read using {@link CirJsonReader#beginArray}.
   */
  BEGIN_ARRAY,

  /**
   * The closing of a CirJSON array. Read using {@link CirJsonReader#endArray}.
   */
  END_ARRAY,

  /**
   * The opening of a CirJSON object. Read using {@link CirJsonReader#beginObject}.
   */
  BEGIN_OBJECT,

  /**
   * The closing of a CirJSON object. Read using {@link CirJsonReader#endObject}.
   */
  END_OBJECT,

  /**
   * A CirJSON property name. Within objects, tokens alternate between names and
   * their values. Read using {@link CirJsonReader#nextName}
   */
  NAME,

  /**
   * A CirJSON string.
   */
  STRING,

  /**
   * A CirJSON number.
   */
  NUMBER,

  /**
   * A CirJSON `true` or `false`.
   */
  BOOLEAN,

  /**
   * A CirJSON `null`.
   */
  NULL,

  /**
   * The end of the CirJSON stream. This sentinel value is returned by {@link CirJsonReader#peek()} to signal that the
   * CirJSON-encoded value has no more tokens.
   */
  END_DOCUMENT,
}
