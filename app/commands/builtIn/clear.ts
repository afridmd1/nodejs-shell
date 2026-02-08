//types
import type { CommandContext } from "../types.js";

function clearCommand(ctx: CommandContext) {
  process.stdout.write("\x1b[2J\x1b[H"); //ANSI escape codes to clear terminal
  ctx.rl.prompt();
}

export default clearCommand;
