import type { Interface } from "node:readline";

interface CommandContext {
  rl: Interface;
  command: string;
  args: string[];
  stdoutFile: string | null;
  stdoutMode: "w" | "a";
  stderrFile: string | null;
  stderrMode: "w" | "a";
}

export type { CommandContext };
