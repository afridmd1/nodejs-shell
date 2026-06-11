import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

//types
import type { CommandContext } from "../types.js";

//utilities
import { findInPath } from "../../utils/pathUtils.js";
import { writeErrorToFile } from "../../utils/redirector.js";

function runExternalCommand(ctx: CommandContext) {
  const exePath = findInPath(ctx.command);

  if (!exePath) {
    writeErrorToFile(
      ctx.stderrFile,
      ctx.stderrMode,
      `${ctx.command}: command not found`,
    );
    ctx.rl.prompt();
    return;
  }

  // prevent spawning non-executable files
  if (process.platform === "win32") {
    const ext = path.extname(exePath).toLowerCase();

    const pathext = (process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD")
      .toLowerCase()
      .split(";")
      .filter(Boolean);

    if (!pathext.includes(ext)) {
      writeErrorToFile(
        ctx.stderrFile,
        ctx.stderrMode,
        `${ctx.command}: command not found`,
      );
      ctx.rl.prompt();
      return;
    }
  }

  let stdio: ("inherit" | number)[] = ["inherit", "inherit", "inherit"];
  let outFileDescriptor: number | null = null;
  let errFileDescriptor: number | null = null;

  if (ctx.stdoutFile) {
    outFileDescriptor = fs.openSync(ctx.stdoutFile, ctx.stdoutMode);
    stdio[1] = outFileDescriptor; // stdout
  }

  if (ctx.stderrFile) {
    errFileDescriptor = fs.openSync(ctx.stderrFile, ctx.stderrMode);
    stdio[2] = errFileDescriptor; // stderr
  }

  const child = spawn(exePath, ctx.args, {
    stdio,
    argv0: ctx.command,
  });

  child.on("error", (err) => {
    writeErrorToFile(
      ctx.stderrFile,
      ctx.stderrMode,
      `error executing command: ${err.message}`,
    );
    ctx.rl.prompt();
  });

  child.on("exit", () => {
    if (outFileDescriptor !== null) fs.closeSync(outFileDescriptor);
    if (errFileDescriptor !== null) fs.closeSync(errFileDescriptor);

    ctx.rl.prompt();
  });
}

export default runExternalCommand;
