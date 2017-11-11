"use babel";

import path from "path";

export default {

  // join paths and double-quote them if needed
  safePathJoin(path1, path2) {
    return this.quotePath(path.join(path1, path2));
  },

  // double quote paths containing spaces
  quotePath(path) {
    return /\s/g.test(path) ? `"${path}"` : path;
  }

};
