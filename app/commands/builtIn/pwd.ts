//types
import type { CommandContext } from "../types.js";

//utilities
import { writeOutputToFile } from "../../utils/redirector.js";

function pwdCommand(ctx: CommandContext) {
  writeOutputToFile(ctx.stdoutFile, ctx.stdoutMode, process.cwd());
  ctx.rl.prompt();
}

export default pwdCommand;
