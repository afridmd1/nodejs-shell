#!/usr/bin/env node
import { createInterface } from "node:readline";
import type { Interface } from "node:readline";

//utilities
import executePipeline from "./utils/pipeline.js";
import {
  addToHistory,
  loadHistoryFromFile,
  writeHistoryToFile,
} from "./utils/history.js";
import parseArguments from "./utils/argumentsParser.js";
import { parseRedirection } from "./utils/redirectParser.js";
import executeCommand from "./utils/executor.js";
import autoCompleter from "./utils/autoCompleter.js";
import { hasPipe } from "./utils/shellUtils.js";

const rl: Interface = createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: autoCompleter,
  prompt: "$ ",
});

//load history from HISTFILE if defined
const HISTFILE = process.env.HISTFILE || "";

if (HISTFILE) {
  try {
    loadHistoryFromFile(HISTFILE);
  } catch (err) {
    console.log(`Could not load history from file '${HISTFILE}': No such file`);
  }
}

rl.prompt();

rl.on("line", (line: string = "") => {
  const input = line.trim();
  if (!input) {
    rl.prompt();
    return;
  }

  //preserve history
  addToHistory(input);

  //pipeline handling
  if (hasPipe(input)) {
    executePipeline(input, rl);
    return;
  }

  const result = parseArguments(input);
  if (!result.success) {
    process.stderr.write(`syntax error: ${result.error}\n`);
    rl.prompt();
    return;
  }
  const tokens = result.args;

  //handle redirection
  const { args: allArgs, redirection } = parseRedirection(tokens);
  const [command, ...args] = allArgs;

  executeCommand(
    rl,
    command,
    args,
    redirection.stdout?.file || null,
    redirection.stdout?.append ? "a" : "w",
    redirection.stderr?.file || null,
    redirection.stderr?.append ? "a" : "w",
  );
});

rl.on("close", () => {
  //write history to HISTFILE if defined on exit
  if (HISTFILE) writeHistoryToFile(HISTFILE);

  process.exit(0);
});
