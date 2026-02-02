import path from "node:path";
import fs from "node:fs";

const findInPath = (cmd: string): string | null => {
  const dirs = (process.env.PATH || "").split(path.delimiter);

  for (const dir of dirs) {
    const fullPath = path.join(dir, cmd);

    try {
      fs.accessSync(fullPath, fs.constants.X_OK);
      return fullPath;
    } catch {
      continue;
    }
  }

  return null;
};

export { findInPath };
