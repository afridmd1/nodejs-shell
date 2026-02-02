import fs from "node:fs";

const history: string[] = [];
let lastAppendedIndex = 0;

const addToHistory = (command: string): void => {
  history.push(command);
};

const getHistory = (): string[] => {
  return history;
};

const loadHistoryFromFile = (filePath: string) => {
  const content = fs.readFileSync(filePath, { encoding: "utf-8" });
  const lines = content.split("\n");

  for (let line of lines) {
    line = line.trimEnd();

    if (!line.length) continue;

    history.push(line);
  }

  lastAppendedIndex = history.length;
};

const writeHistoryToFile = (filePath: string) => {
  const data = history.length ? history.join("\n") + "\n" : "";

  fs.writeFileSync(filePath, data, { encoding: "utf-8" });

  lastAppendedIndex = history.length;
};

const appendHistoryToFile = (filePath: string) => {
  const newEntries = history.slice(lastAppendedIndex);
  if (newEntries.length === 0) return;

  const data = newEntries.join("\n") + "\n";

  fs.appendFileSync(filePath, data, { encoding: "utf-8" });

  lastAppendedIndex = history.length;
};

export {
  addToHistory,
  getHistory,
  loadHistoryFromFile,
  writeHistoryToFile,
  appendHistoryToFile,
};
