//types
import type { CommandContext } from "../types.js";

//utilities
import { findInPath } from "../../utils/pathUtils.js";
import { builtIns } from "../../utils/utilityData.js";
import { writeOutputToFile, writeErrorToFile } from "../../utils/redirector.js";

function typeCommand(ctx: CommandContext) {
  if (ctx.args.length === 0) {
    ctx.rl.prompt();
    return;
  }

  for (const cmd of ctx.args) {
    if (builtIns.has(cmd)) {
      writeOutputToFile(
        ctx.stdoutFile,
        ctx.stdoutMode,
        `${cmd} is a shell builtin`,
      );
      continue;
    }

    const exePath = findInPath(cmd);

    if (exePath) {
      writeOutputToFile(ctx.stdoutFile, ctx.stdoutMode, `${cmd} is ${exePath}`);
    } else {
      writeErrorToFile(ctx.stderrFile, ctx.stderrMode, `${cmd} not found`);
    }
  }

  ctx.rl.prompt();
}

export default typeCommand;
