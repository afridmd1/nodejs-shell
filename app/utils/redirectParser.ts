export type Redirection = {
  stdout?: { file: string; append: boolean };
  stderr?: { file: string; append: boolean };
};

export type ParsedSegment = {
  args: string[];
  redirection: Redirection;
};

const parseRedirection = (tokens: string[]): ParsedSegment => {
  const redirection: Redirection = {};
  const args = [...tokens];

  // stdout append: >> or 1>>
  let outAppendIndex = args.indexOf("1>>");
  if (outAppendIndex === -1) outAppendIndex = args.indexOf(">>");
  if (outAppendIndex !== -1) {
    redirection.stdout = { file: args[outAppendIndex + 1], append: true };
    args.splice(outAppendIndex, 2);
  }
  // stdout write: > or 1>
  else {
    let outWriteIndex = args.indexOf("1>");
    if (outWriteIndex === -1) outWriteIndex = args.indexOf(">");
    if (outWriteIndex !== -1) {
      redirection.stdout = { file: args[outWriteIndex + 1], append: false };
      args.splice(outWriteIndex, 2);
    }
  }

  // stderr append: 2>>
  let errAppendIndex = args.indexOf("2>>");
  if (errAppendIndex !== -1) {
    redirection.stderr = { file: args[errAppendIndex + 1], append: true };
    args.splice(errAppendIndex, 2);
  }
  // stderr write: 2>
  else {
    let errWriteIndex = args.indexOf("2>");
    if (errWriteIndex !== -1) {
      redirection.stderr = { file: args[errWriteIndex + 1], append: false };
      args.splice(errWriteIndex, 2);
    }
  }

  return { args, redirection };
};

export { parseRedirection };
