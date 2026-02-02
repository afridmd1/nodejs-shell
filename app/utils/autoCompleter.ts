import path from "node:path";
import fs from "node:fs";

//utilities
import { builtIns } from "./utilityData.js";

let lastLine = "",
  tabCount = 0;

const longestCommonPrefix = (strings: string[]) => {
  if (strings.length === 0) return "";
  if (strings.length === 1) return strings[0];

  const firstStr = strings[0],
    lastStr = strings[strings.length - 1];

  let i = 0;
  while (i < firstStr.length && firstStr[i] === lastStr[i]) i++;

  return firstStr.slice(0, i);
};

const autoCompleter = (line: string) => {
  const allMatches = new Set<string>();

  //check in built-in commands
  for (const cmd of builtIns) {
    if (cmd.startsWith(line)) allMatches.add(cmd);
  }

  //check in PATH directories
  const dirs = (process.env.PATH || "").split(path.delimiter);

  for (const dir of dirs) {
    if (!dir) continue;

    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        if (file.startsWith(line)) allMatches.add(file);
      }
    } catch {
      continue;
    }
  }

  const matches = Array.from(allMatches).sort();

  if (matches.length === 1) {
    lastLine = "";
    tabCount = 0;
    return [[matches[0] + " "], line];
  }

  //multiple matches
  if (matches.length > 1) {
    //first tab press
    const suggestion = longestCommonPrefix(matches);
    if (suggestion.length > line.length) {
      lastLine = "";
      tabCount = 0;
      return [[suggestion], line];
    }

    //second tab press
    if (line === lastLine && tabCount === 1) {
      process.stdout.write("\n" + matches.join("  ") + "\n$ " + line);
      lastLine = "";
      tabCount = 0;
      return [[], line];
    }

    process.stdout.write("\x07"); //bell character
    lastLine = line;
    tabCount = 1;
    return [[], line];
  }

  process.stdout.write("\x07"); //bell character
  lastLine = "";
  tabCount = 0;
  return [[], line];
};

export default autoCompleter;
