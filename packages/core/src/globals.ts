// noinspection ES6ConvertVarToLetConst

import { parse } from "./parse"

declare global {
  // eslint-disable-next-line no-var
  var CirJSON: { parse: typeof parse }
}

globalThis.CirJSON = { parse }
