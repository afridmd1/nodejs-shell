const builtIns = new Set<string>([
  "exit",
  "clear",
  "echo",
  "type",
  "pwd",
  "cd",
  "history",
]);

const escapeCharacters = new Set<string>(['"', "\\", "$", "`"]);

export { builtIns, escapeCharacters };
