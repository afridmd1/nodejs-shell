# 🖥️ Custom Node.js CLI Shell

A lightweight **Unix-like command-line shell** built with Node.js and TypeScript, supporting built-ins, external commands, pipelines, and I/O redirection.

## 🚀 Features

- Built-in commands (`exit`, `clear`, `echo`, `pwd`, `cd`, `type`,
  `history`)
- Execute external system commands
- Command history with file persistence
- Auto-completion support
- Input/Output redirection (`>`, `>>`, `2>`, `2>>`)
- Command pipelines (`|`)
- Modular and extensible architecture

## 📂 Project Structure

    nodejs-shell/
    │
    ├── app/
    │   ├── commands/
    │   │   ├── builtIn/
    │   │   │   ├── cd.ts
    │   │   │   ├── clear.ts
    │   │   │   ├── echo.ts
    │   │   │   ├── exit.ts
    │   │   │   ├── history.ts
    │   │   │   ├── pwd.ts
    │   │   │   ├── type.ts
    │   │   │
    │   │   ├── external/
    │   │   │   ├── external.ts
    │   │   │
    │   │   ├── types.ts
    │   │
    │   ├── utils/
    │   │   ├── argumentsParser.ts
    │   │   ├── autoCompleter.ts
    │   │   ├── executor.ts
    │   │   ├── history.ts
    │   │   ├── pathUtils.ts
    │   │   ├── pipeline.ts
    │   │   ├── redirector.ts
    │   │   ├── utilityData.ts
    │   │
    │   ├── main.ts
    │
    ├── dist/
    ├── node_modules/
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── tsconfig.json

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

## 🔗 Pipelines

```bash
echo hello world | grep hello
```

## 📤 Redirection

```bash
echo Hello > file.txt
echo Hello >> file.txt
command 2> error.txt
command 2>> error.txt
```

## 🧠 Command History

### Enable history (Linux/macOS)

```bash
HISTFILE=~/.myshell_history nodejs-shell
```

### Windows (PowerShell)

```powershell
$env:HISTFILE="$HOME/.myshell_history"
nodejs-shell
```

- Loads history on startup
- Saves history on exit

## 📈 Future Improvements

- Background jobs
- Programmable completion
- Filename auto-completion

## 🎯 Purpose

- Learn shell internals
- Practice Node.js system programming
- Showcase project for interviews

## 📝 License

MIT License
