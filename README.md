# 🖥️ Custom Node.js CLI Shell

A lightweight **Unix-like command-line shell** built with Node.js and TypeScript, supporting built-ins, external commands, pipelines, and I/O redirection.

## 📋 Prerequisites

- Node.js v18+
- npm

## 🚀 Features

- Built-in commands (`exit`, `clear`, `echo`, `pwd`, `cd`, `type`, `history`)
- Execute external system commands
- Command history with file persistence
- Auto-completion support
- Input/Output redirection (`>`, `>>`, `2>`, `2>>`)
- Command pipelines (`|`)
- Quote and escape character handling
- Modular and extensible architecture

## 📂 Project Structure

```

nodejs-shell/
│
├── app/
│ ├── commands/
│ │ ├── builtIn/
│ │ │ ├── cd.ts
│ │ │ ├── clear.ts
│ │ │ ├── echo.ts
│ │ │ ├── exit.ts
│ │ │ ├── history.ts
│ │ │ ├── pwd.ts
│ │ │ ├── type.ts
│ │ │
│ │ ├── external/
│ │ │ ├── external.ts
│ │ │
│ │ ├── types.ts
│ │
│ ├── utils/
│ │ ├── argumentsParser.ts
│ │ ├── autoCompleter.ts
│ │ ├── executor.ts
│ │ ├── history.ts
│ │ ├── pathUtils.ts
│ │ ├── pipeline.ts
│ │ ├── redirectParser.ts
│ │ ├── redirector.ts
│ │ ├── shellUtils.ts
│ │ ├── utilityData.ts
│ │
│ ├── main.ts
│
├── dist/
├── node_modules/
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json

```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/afridmd1/nodejs-shell.git
cd nodejs-shell
npm install
```

## 🧑‍💻 Run in Development Mode

```bash
npm run dev
```

## 🚀 Run as CLI (Recommended)

### 1. Build the project

```bash
npm run build
```

### 2. Link globally

```bash
npm link
```

### 3. Start the shell

```bash
nodejs-shell
```

## 🔧 Built-in Commands

| Command | Description            |
| ------- | ---------------------- |
| exit    | Exit the shell         |
| clear   | Clear terminal         |
| echo    | Print text             |
| pwd     | Show current directory |
| cd      | Change directory       |
| type    | Identify command type  |
| history | Show command history   |

## 🔤 Quoting & Escaping

- Single quotes: `echo 'hello world'`
- Double quotes: `echo "hello world"`
- Escape characters: `echo hello\ world`
- Escaped chars inside double quotes: `echo "hello \"world\""`

## 🔗 Pipelines

Chain commands together using `|`:

```bash
<command1> | <command2>
<command1> | <command2> | <command3>
```

Example (Linux/macOS):

```bash
echo hello world | grep hello
ls | grep .txt
```

Example (Windows):

```bash
echo hello world | find "hello"
dir | find ".txt"
```

## 📤 Redirection

```bash
echo Hello > file.txt
echo Hello >> file.txt
invalid-command 2> error.txt
invalid-command 2>> error.txt
```

## 🔍 Auto-completion

Press `Tab` to auto-complete commands. Press `Tab` twice to see all matches.

## 🧠 Command History

### Enable history (Linux/macOS)

```bash
HISTFILE=~/.myshell_history
nodejs-shell
```

### Windows (PowerShell)

```powershell
$env:HISTFILE="$HOME/.myshell_history"
nodejs-shell
```

- Loads history on startup
- Saves history on exit
- `history` — show full history
- `history 5` — show last 5 commands
- `history -w file` — write history to file
- `history -r file` — read history from file
- `history -a file` — append history to file

## 📈 Future Improvements

- Filename auto-completion
- Background jobs
- Programmable completion

## 🎯 Purpose

- Learn shell internals
- Practice Node.js system programming
- Showcase project for interviews

## 📝 License

MIT License
