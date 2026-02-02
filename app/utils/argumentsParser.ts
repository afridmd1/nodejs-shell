//utilities
import { escapeCharacters } from "./utilityData.js";

const parseArguments = (input: string): string[] => {
  const args: string[] = [];
  let currentArg = "",
    isSingleQuote = false,
    isDoubleQuote = false;

  for (let i = 0; i < input.length; i++) {
    const char = input.charAt(i);

    //handle escape character outside and single quotes
    if (char === "\\" && !isSingleQuote && !isDoubleQuote) {
      const nextChar = input.charAt(i + 1);
      if (nextChar) {
        currentArg += nextChar;
        i++; // skip next character as it's escaped
      }
      continue;
    }

    //handle escape character inside double quotes
    if (char === "\\" && isDoubleQuote) {
      const nextChar = input.charAt(i + 1);

      if (escapeCharacters.has(nextChar)) {
        currentArg += nextChar;
        i++; // skip next character as it's escaped
      } else {
        currentArg += char;
      }
      continue;
    }

    //handle double quotes
    if (char === '"' && !isSingleQuote) {
      isDoubleQuote = !isDoubleQuote;
      continue;
    }

    //handle single quotes
    if (char === "'" && !isDoubleQuote) {
      isSingleQuote = !isSingleQuote;
      continue;
    }

    //handle spaces
    if (char === " " && !isSingleQuote && !isDoubleQuote) {
      if (currentArg.length > 0) {
        args.push(currentArg);
        currentArg = "";
      }
      // skip extra spaces
      while (input[i + 1] === " ") i++;
    }
    //regular character
    else {
      currentArg += char;
    }
  }

  if (currentArg) args.push(currentArg);

  return args;
};

export default parseArguments;
