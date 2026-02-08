//types
import type { CommandContext } from "../types.js";

//utilities
import { writeOutputToFile } from "../../utils/redirector.js";

function echoCommand(ctx: CommandContext) {
  writeOutputToFile(ctx.stdoutFile, ctx.stdoutMode, ctx.args.join(" "));
  ctx.rl.prompt();
}

export default echoCommand;
