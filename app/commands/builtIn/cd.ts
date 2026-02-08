import path from "node:path";
import os from "node:os";

//types
import type { CommandContext } from "../types.js";

//utilities
import { writeErrorToFile } from "../../utils/redirector.js";

function cdCommand(ctx: CommandContext) {
  const targetDir = ctx.args[0] || "";

  if (!targetDir) {
    ctx.rl.prompt();
    return;
  }

  try {
    // home directory
    if (targetDir.startsWith("~")) {
      const homeDir = os.homedir();
      const relativePath = targetDir.slice(1);
      const fullPath = path.join(homeDir, relativePath);
      process.chdir(fullPath);
    }
    // absolute path
    else if (targetDir.startsWith("/")) {
      process.chdir(targetDir);
    }
    // relative path
    else {
      const resolvedPath = path.resolve(process.cwd(), targetDir);
      process.chdir(resolvedPath);
    }

    ctx.rl.prompt();
    return;
  } catch {
    writeErrorToFile(
      ctx.stderrFile,
      ctx.stderrMode,
      `cd: ${targetDir}: No such file or directory`,
    );
    ctx.rl.prompt();
    return;
  }
}

export default cdCommand;
