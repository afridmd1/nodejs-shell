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
import executeCommand from "./utils/executor.js";
import autoCompleter from "./utils/autoCompleter.js";

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
  if (input.includes("|")) {
    executePipeline(input, rl);
    return;
  }

  const parts = parseArguments(input);
  const command = parts[0];
  const args = parts.slice(1);

  //handle redirections
  let stdoutFile: string | null = null;
  let stdoutMode: "w" | "a" = "w";
  let stderrFile: string | null = null;
  let stderrMode: "w" | "a" = "w";

  // stdout redirection
  // append mode: >> or 1>>
  let outAppendIndex = args.indexOf("1>>");
  if (outAppendIndex === -1) outAppendIndex = args.indexOf(">>");

  if (outAppendIndex !== -1) {
    stdoutFile = args[outAppendIndex + 1];
    stdoutMode = "a";
    args.splice(outAppendIndex, 2);
  }
  // write mode: > or 1>
  else {
    let outWriteIndex = args.indexOf("1>");
    if (outWriteIndex === -1) outWriteIndex = args.indexOf(">");

    if (outWriteIndex !== -1) {
      stdoutFile = args[outWriteIndex + 1];
      stdoutMode = "w";
      args.splice(outWriteIndex, 2);
    }
  }

  // stderr redirection
  // append mode: 2>>
  let errAppendIndex = args.indexOf("2>>");
  if (errAppendIndex !== -1) {
    stderrFile = args[errAppendIndex + 1];
    stderrMode = "a";
    args.splice(errAppendIndex, 2);
  }
  // write mode: 2>
  else {
    let errWriteIndex = args.indexOf("2>");
    if (errWriteIndex !== -1) {
      stderrFile = args[errWriteIndex + 1];
      stderrMode = "w";
      args.splice(errWriteIndex, 2);
    }
  }

  executeCommand(
    rl,
    command,
    args,
    stdoutFile,
    stdoutMode,
    stderrFile,
    stderrMode,
  );
});

rl.on("close", () => {
  //write history to HISTFILE if defined on exit
  if (HISTFILE) writeHistoryToFile(HISTFILE);

  process.exit(0);
});
