import { spawn } from "node:child_process";
import { PassThrough } from "node:stream";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import type { Interface } from "node:readline";
import type { Readable, Writable } from "node:stream";

//utilities
import parseArguments from "./argumentsParser.js";
import { findInPath } from "./pathUtils.js";
import { builtIns } from "./utilityData.js";
import { parseRedirection } from "./redirectParser.js";
import { splitByPipe } from "./shellUtils.js";

type BuiltInContext = {
  stdin: Readable;
  stdout: Writable;
  stderr: Writable;
  isLast: boolean;
};

const runBuiltIn = (
  command: string,
  args: string[],
  context: BuiltInContext,
) => {
  switch (command) {
    case "exit":
      context.stdout.end();
      process.exit(0);

    case "clear":
      context.stdout.write("\x1b[2J\x1b[H");
      if (context.isLast) context.stdout.end();
      break;

    case "echo":
      context.stdout.write(args.join(" ") + "\n");
      if (context.stdout !== process.stdout) context.stdout.end();
      break;

    case "pwd":
      context.stdout.write(process.cwd() + "\n");
      if (context.stdout !== process.stdout) context.stdout.end();
      break;

    case "cd":
      const targetDir = args[0] || "";
      if (targetDir) {
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
        } catch {
          context.stderr.write(`cd: ${targetDir}: No such file or directory\n`);
        }
      }
      if (context.stdout !== process.stdout) context.stdout.end();
      break;

    case "type":
      for (const cmd of args) {
        if (builtIns.has(cmd)) {
          context.stdout.write(`${cmd} is a shell builtin\n`);
        } else {
          const p = findInPath(cmd);
          if (p) context.stdout.write(`${cmd} is ${p}\n`);
          else context.stderr.write(`${cmd} not found\n`);
        }
      }
      if (context.stdout !== process.stdout) context.stdout.end();
      break;

    case "history":
      // history in a pipeline doesn't make much sense, just end stdout
      if (context.stdout !== process.stdout) context.stdout.end();
      break;

    default:
      if (context.stdout !== process.stdout) context.stdout.end();
      break;
  }
};

const executePipeline = (input: string, rl: Interface) => {
  const segments = splitByPipe(input);
  const count = segments.length;

  const pipes = Array.from({ length: count - 1 }, () => new PassThrough());
  const children: ReturnType<typeof spawn>[] = [];

  let lastProcess: ReturnType<typeof spawn> | null = null;
  let lastIsBuiltIn = false;

  const cleanup = () => {
    process.stdin.unpipe(); // unpipe from any child process
    process.stdin.resume();
    pipes.forEach((p) => p.destroy());
    children.forEach((c) => c.kill());
  };

  for (let i = 0; i < count; i++) {
    const result = parseArguments(segments[i]);
    if (!result.success) {
      process.stderr.write(`syntax error: ${result.error}\n`);
      cleanup();
      rl.prompt();
      return;
    }

    const tokens = result.args;
    const { args: allArgs, redirection } = parseRedirection(tokens);
    const [cmd, ...args] = allArgs;
    const isBuiltin = builtIns.has(cmd);
    const isLast = i === count - 1;

    // pre-create redirect files
    if (redirection.stdout) {
      fs.closeSync(
        fs.openSync(
          redirection.stdout.file,
          redirection.stdout.append ? "a" : "w",
        ),
      );
    }

    if (redirection.stderr) {
      fs.closeSync(
        fs.openSync(
          redirection.stderr.file,
          redirection.stderr.append ? "a" : "w",
        ),
      );
    }

    const redirStdout = redirection.stdout
      ? fs.createWriteStream(redirection.stdout.file, {
          flags: redirection.stdout.append ? "a" : "w",
        })
      : null;

    const redirStderr = redirection.stderr
      ? fs.createWriteStream(redirection.stderr.file, {
          flags: redirection.stderr.append ? "a" : "w",
        })
      : null;

    const stdin = i === 0 ? process.stdin : pipes[i - 1];
    const stdout = redirStdout ?? (isLast ? process.stdout : pipes[i]);
    const stderr = redirStderr ?? process.stderr;

    if (isBuiltin) {
      if (isLast) lastIsBuiltIn = true;

      runBuiltIn(cmd, args, {
        stdin,
        stdout,
        stderr,
        isLast,
      });
    } else {
      const cmdPath = findInPath(cmd);

      if (!cmdPath) {
        process.stderr.write(`${cmd}: command not found\n`);
        cleanup();
        rl.prompt();
        return;
      }

      const child = spawn(cmdPath!, args, {
        stdio: ["pipe", "pipe", "pipe"],
        argv0: cmd,
      });

      children.push(child);

      child.on("error", (err) => {
        process.stderr.write(`${cmd}: ${err.message}\n`);
        cleanup();
        rl.prompt();
      });

      if (i === 0) {
        process.stdin.pause();
        process.stdin.pipe(child.stdin!);
      } else {
        pipes[i - 1].pipe(child.stdin!);
      }

      child.stdout!.pipe(stdout);
      (child.stderr as Readable).pipe(stderr);

      lastProcess = child;
    }
  }

  if (lastIsBuiltIn) {
    rl.prompt();
  } else if (lastProcess) {
    lastProcess.on("exit", () => {
      process.stdin.unpipe(); // unpipe from the last process
      process.stdin.resume();
      rl.prompt();
    });
  }
};

export default executePipeline;
