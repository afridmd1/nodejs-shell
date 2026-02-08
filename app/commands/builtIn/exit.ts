//types
import type { CommandContext } from "../types.js";

function exitCommand(ctx: CommandContext) {
  ctx.rl.close();
}

export default exitCommand;
