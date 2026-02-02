import { spawn } from "node:child_process";
import { PassThrough } from "node:stream";
import type { Interface } from "node:readline";
import type { Readable, Writable } from "node:stream";

//utilities
import parseArguments from "./argumentsParser.js";
import { findInPath } from "./pathUtils.js";
import { builtIns } from "./utilityData.js";

type BuiltInContext = {
  stdin: Readable;
  stdout: Writable;
  stderr: Writable;
};

const runBuiltIn = (
  command: string,
  args: string[],
  context: BuiltInContext,
) => {
  switch (command) {
    case "echo":
      context.stdout.write(args.join(" ") + "\n");
      context.stdout.end();
      break;

    case "pwd":
      context.stdout.write(process.cwd() + "\n");
      context.stdout.end();
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
      context.stdout.end();
      break;

    default:
      context.stdout.end();
  }
};

const executePipeline = (input: string, rl: Interface) => {
  const segments = input.split("|").map((s) => s.trim());
  const count = segments.length;

  const pipes = Array.from({ length: count - 1 }, () => new PassThrough());

  let lastProcess: ReturnType<typeof spawn> | null = null;

  for (let i = 0; i < count; i++) {
    const [cmd, ...args] = parseArguments(segments[i]);
    const isBuiltin = builtIns.has(cmd);

    const stdin = i === 0 ? process.stdin : pipes[i - 1];

    const stdout = i === count - 1 ? process.stdout : pipes[i];

    if (isBuiltin) {
      runBuiltIn(cmd, args, {
        stdin,
        stdout,
        stderr: process.stderr,
      });
    } else {
      const cmdPath = findInPath(cmd);
      const child = spawn(cmdPath!, args, {
        stdio: [
          i === 0 ? "inherit" : "pipe",
          i === count - 1 ? "inherit" : "pipe",
          "inherit",
        ],
        argv0: cmd,
      });

      if (i > 0) {
        pipes[i - 1].pipe(child.stdin!);
      }

      if (i < count - 1) {
        child.stdout!.pipe(pipes[i]);
      }

      lastProcess = child;
    }
  }

  if (lastProcess) {
    lastProcess.on("exit", () => rl.prompt());
  } else {
    // last command was a builtin
    rl.prompt();
  }
};

export default executePipeline;
