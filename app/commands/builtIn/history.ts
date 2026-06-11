//types
import type { CommandContext } from "../types.js";

//utilities
import {
  getHistory,
  loadHistoryFromFile,
  writeHistoryToFile,
  appendHistoryToFile,
} from "../../utils/history.js";
import { writeOutputToFile, writeErrorToFile } from "../../utils/redirector.js";

function historyCommand(ctx: CommandContext) {
  //handle -r flag to read history from file
  if (ctx.args[0] === "-r") {
    const filePath = ctx.args[1] || "";

    if (!filePath) {
      ctx.rl.prompt();
      return;
    }

    try {
      loadHistoryFromFile(filePath);
    } catch {
      writeErrorToFile(
        ctx.stderrFile,
        ctx.stderrMode,
        `history: cannot read from file '${filePath}': No such file`,
      );
    }

    ctx.rl.prompt();
    return;
  }

  //handle -w flag to write history to file
  if (ctx.args[0] === "-w") {
    const filePath = ctx.args[1] || "";

    if (!filePath) {
      ctx.rl.prompt();
      return;
    }

    try {
      writeHistoryToFile(filePath);
    } catch {
      writeErrorToFile(
        ctx.stderrFile,
        ctx.stderrMode,
        `history: cannot write to file '${filePath}': No such file`,
      );
    }

    ctx.rl.prompt();
    return;
  }

  //handle -a flag to append history to file
  if (ctx.args[0] === "-a") {
    const filePath = ctx.args[1] || "";

    if (!filePath) {
      ctx.rl.prompt();
      return;
    }

    try {
      appendHistoryToFile(filePath);
    } catch {
      writeErrorToFile(
        ctx.stderrFile,
        ctx.stderrMode,
        `history: cannot append to file '${filePath}': No such file`,
      );
    }

    ctx.rl.prompt();
    return;
  }

  //handle invalid options
  if (ctx.args[0]?.startsWith("-")) {
    writeErrorToFile(
      ctx.stderrFile,
      ctx.stderrMode,
      `history: ${ctx.args[0]}: invalid option`,
    );
    ctx.rl.prompt();
    return;
  }

  const fullHistory = getHistory();
  const limit = Number(ctx.args[0]);
  const startIndex = limit ? fullHistory.length - limit : 0;

  fullHistory.slice(startIndex).forEach((cmd, index) => {
    writeOutputToFile(
      ctx.stdoutFile,
      ctx.stdoutMode,
      `    ${startIndex + index + 1}  ${cmd}`,
    );
  });

  ctx.rl.prompt();
}

export default historyCommand;
