import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import type { Interface } from "node:readline";

//utilities
import { findInPath } from "./pathUtils.js";
import { builtIns } from "./utilityData.js";
import {
  getHistory,
  loadHistoryFromFile,
  writeHistoryToFile,
  appendHistoryToFile,
} from "./history.js";
import { writeOutputToFile, writeErrorToFile } from "./redirector.js";

const executeCommand = (
  rl: Interface,
  command: string,
  args: string[],
  stdoutFile: string | null,
  stdoutMode: "w" | "a",
  stderrFile: string | null,
  stderrMode: "w" | "a",
) => {
  //ensure stderr file is writable/appedable always for builtins
  if (stderrFile) {
    fs.closeSync(fs.openSync(stderrFile, stderrMode));
  }

  /*<-----builtins----->*/
  if (command === "exit") {
    rl.close();
    return;
  }

  if (command === "clear") {
    process.stdout.write("\x1b[2J\x1b[H"); //ANSI escape codes to clear terminal
    rl.prompt();
    return;
  }

  if (command === "echo") {
    writeOutputToFile(stdoutFile, stdoutMode, args.join(" "));
    rl.prompt();
    return;
  }

  if (command === "pwd") {
    writeOutputToFile(stdoutFile, stdoutMode, process.cwd());
    rl.prompt();
    return;
  }

  if (command === "cd") {
    const targetDir = args[0] || "";

    if (!targetDir) {
      rl.prompt();
      return;
    }

    try {
      //home directory
      if (targetDir.startsWith("~")) {
        const homeDir = os.homedir();
        const relativePath = targetDir.slice(1);
        const fullPath = path.join(homeDir, relativePath);

        process.chdir(fullPath);
      }
      //absolute path
      else if (targetDir.startsWith("/")) {
        process.chdir(targetDir);
      }
      //relative path
      else {
        const resolvedPath = path.resolve(process.cwd(), targetDir);
        process.chdir(resolvedPath);
      }

      rl.prompt();
      return;
    } catch (err) {
      writeErrorToFile(
        stderrFile,
        stderrMode,
        `cd: ${targetDir}: No such file or directory`,
      );
      rl.prompt();
      return;
    }
  }

  if (command === "type") {
    if (args.length === 0) {
      rl.prompt();
      return;
    }

    for (const cmd of args) {
      if (builtIns.has(cmd)) {
        writeOutputToFile(stdoutFile, stdoutMode, `${cmd} is a shell builtin`);
        continue;
      }

      const exePath = findInPath(cmd);

      if (exePath) {
        writeOutputToFile(stdoutFile, stdoutMode, `${cmd} is ${exePath}`);
      } else {
        writeErrorToFile(stderrFile, stderrMode, `${cmd} not found`);
      }
    }

    rl.prompt();
    return;
  }

  if (command === "history") {
    //handle -r flag to read history from file
    if (args[0] === "-r") {
      const filePath = args[1] || "";

      if (!filePath) {
        rl.prompt();
        return;
      }

      try {
        loadHistoryFromFile(filePath);
      } catch (err) {
        writeErrorToFile(
          stderrFile,
          stderrMode,
          `history: cannot read from file '${filePath}': No such file`,
        );
      }

      rl.prompt();
      return;
    }

    //handle -w flag to write history to file
    if (args[0] === "-w") {
      const filePath = args[1] || "";

      if (!filePath) {
        rl.prompt();
        return;
      }

      try {
        writeHistoryToFile(filePath);
      } catch (err) {
        writeErrorToFile(
          stderrFile,
          stderrMode,
          `history: cannot write to file '${filePath}': No such file`,
        );
      }

      rl.prompt();
      return;
    }

    //handle -a flag to append history to file
    if (args[0] === "-a") {
      const filePath = args[1] || "";

      if (!filePath) {
        rl.prompt();
        return;
      }

      try {
        appendHistoryToFile(filePath);
      } catch (err) {
        writeErrorToFile(
          stderrFile,
          stderrMode,
          `history: cannot append to file '${filePath}': No such file`,
        );
      }

      rl.prompt();
      return;
    }

    const fullHistory = getHistory();
    const limit = Number(args[0]);
    const startIndex = limit ? fullHistory.length - limit : 0;

    fullHistory.slice(startIndex).forEach((cmd, index) => {
      writeOutputToFile(
        stdoutFile,
        stdoutMode,
        `    ${startIndex + index + 1}  ${cmd}`,
      );
    });
    rl.prompt();
    return;
  }

  /*<-----external commands----->*/
  const exePath = findInPath(command);

  if (!exePath) {
    writeErrorToFile(stderrFile, stderrMode, `${command}: command not found`);
    rl.prompt();
    return;
  }

  let stdio: any[] = ["inherit", "inherit", "inherit"];
  let outFileDescriptor: number | null = null;
  let errFileDescriptor: number | null = null;

  if (stdoutFile) {
    outFileDescriptor = fs.openSync(stdoutFile, stdoutMode);
    stdio[1] = outFileDescriptor; //stdout
  }

  if (stderrFile) {
    errFileDescriptor = fs.openSync(stderrFile, stderrMode);
    stdio[2] = errFileDescriptor; //stderr
  }

  const child = spawn(exePath, args, {
    stdio: stdio,
    argv0: command,
  });

  child.on("error", (err) => {
    writeErrorToFile(
      stderrFile,
      stderrMode,
      `Error executing command: ${err.message}`,
    );
    rl.prompt();
  });

  child.on("exit", () => {
    if (outFileDescriptor !== null) fs.closeSync(outFileDescriptor);
    if (errFileDescriptor !== null) fs.closeSync(errFileDescriptor);

    rl.prompt();
  });
};

export default executeCommand;
