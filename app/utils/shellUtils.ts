const hasPipe = (input: string): boolean => {
  let inSingle = false,
    inDouble = false;

  for (const char of input) {
    if (char === "'" && !inDouble) inSingle = !inSingle;
    if (char === '"' && !inSingle) inDouble = !inDouble;
    if (char === "|" && !inSingle && !inDouble) return true;
  }

  return false;
};

const splitByPipe = (input: string): string[] => {
  const segments: string[] = [];
  let current = "";
  let inSingle = false,
    inDouble = false;

  for (const char of input) {
    if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (char === "|" && !inSingle && !inDouble) {
      segments.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  segments.push(current.trim());
  return segments;
};

export { hasPipe, splitByPipe };
