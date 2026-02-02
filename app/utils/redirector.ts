import fs from "node:fs";

const writeOutputToFile = (
  stdoutFile: string | null,
  stdoutMode: "w" | "a",
  text: string,
) => {
  if (stdoutFile) {
    fs.writeFileSync(stdoutFile, text + "\n", {
      encoding: "utf-8",
      flag: stdoutMode,
    });
  } else {
    console.log(text);
  }
};

const writeErrorToFile = (
  stderrFile: string | null,
  stderrMode: "w" | "a",
  text: string,
) => {
  if (stderrFile) {
    fs.writeFileSync(stderrFile, text + "\n", {
      encoding: "utf-8",
      flag: stderrMode,
    });
  } else {
    console.error(text);
  }
};

export { writeOutputToFile, writeErrorToFile };
