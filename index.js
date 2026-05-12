#!/usr/bin/env node
"use strict";
// Open Friday v2.0 - Claude Code Style with Animations & Command Preview

const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { IDENTITY, chat, generateCode } = require("./core/builtin");

// Handle --version flag
if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(IDENTITY.version);
  process.exit(0);
}

// Minimal colors
const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

function print(msg, color = "reset") {
  process.stdout.write(`${C[color]}${msg}${C.reset}`);
}

function printLine(msg, color = "reset") {
  console.log(`${C[color]}${msg}${C.reset}`);
}

// ═══════════════════════ THINKING ANIMATION
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const THOUGHTS = ["Thinking", "Generating", "Analyzing", "Processing", "Computing", "Loading"];

let animationInterval = null;

function startThinking(message = "Thinking") {
  let frame = 0;
  print(`${message} `, "yellow");
  animationInterval = setInterval(() => {
    process.stdout.write(`\r${C.yellow}${SPINNER_FRAMES[frame % SPINNER_FRAMES.length]}${C.reset} ${message}`);
    frame++;
  }, 80);
}

function stopThinking() {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
    process.stdout.write("\r" + " ".repeat(20) + "\r");
  }
}

async function think(message, callback) {
  startThinking(message);
  try {
    const result = await callback();
    stopThinking();
    return result;
  } catch (e) {
    stopThinking();
    throw e;
  }
}

// ═══════════════════════ COMMAND PREVIEW WITH SCROLLING
const COMMANDS = {
  help: { desc: "Show all commands", usage: "/help" },
  exit: { desc: "Exit Open Friday", usage: "/exit" },
  clear: { desc: "Clear terminal", usage: "/clear" },
  whoami: { desc: "About Open Friday", usage: "/whoami" },
  login: { desc: "Open login page", usage: "/login" },
  
  generate: { desc: "Generate code from description", usage: "/generate <description>" },
  app: { desc: "Create web app (HTML/CSS/JS)", usage: "/app <name>" },
  api: { desc: "Create REST API server", usage: "/api <name>" },
  react: { desc: "Create React app", usage: "/react <name>" },
  python: { desc: "Create Python script", usage: "/python <filename>" },
  go: { desc: "Create Go program", usage: "/go <filename>" },
  node: { desc: "Create Node.js project", usage: "/node <name>" },
  
  explain: { desc: "Explain any code", usage: "/explain <code>" },
  fix: { desc: "Fix bugs in code", usage: "/fix <code or issue>" },
  optimize: { desc: "Optimize performance", usage: "/optimize <code>" },
  review: { desc: "Code review", usage: "/review <code>" },
  test: { desc: "Generate tests", usage: "/test <code>" },
  debug: { desc: "Debug issues", usage: "/debug <issue>" },
  suggest: { desc: "Proactive suggestions", usage: "/suggest" },
  architect: { desc: "Design architecture", usage: "/architect <project>" },
  docs: { desc: "Generate documentation", usage: "/docs <topic>" },
  
  ls: { desc: "List directory contents", usage: "/ls [path]" },
  cat: { desc: "Read file contents", usage: "/cat <filepath>" },
  mkdir: { desc: "Create directory", usage: "/mkdir <name>" },
  touch: { desc: "Create empty file", usage: "/touch <filename>" },
  rm: { desc: "Delete file/directory", usage: "/rm <path>" },
  edit: { desc: "Edit file", usage: "/edit <filepath>" },
  write: { desc: "Write to file", usage: "/write <filepath> <content>" },
  find: { desc: "Find files by name", usage: "/find <pattern>" },
  grep: { desc: "Search in files", usage: "/grep <pattern> [path]" },
  
  run: { desc: "Run shell command", usage: "/run <command>" },
  open: { desc: "Open file/folder", usage: "/open <path>" },
  explorer: { desc: "Open file explorer", usage: "/explorer [path]" },
  ip: { desc: "Show IP addresses", usage: "/ip" },
  ps: { desc: "List processes", usage: "/ps" },
  kill: { desc: "Kill process by PID", usage: "/kill <PID>" },
  pwd: { desc: "Show current directory", usage: "/pwd" },
  cd: { desc: "Change directory", usage: "/cd <path>" },
  
  git: { desc: "Git commands", usage: "/git <command>" },
  gitinit: { desc: "Initialize git repo", usage: "/gitinit" },
  gits: { desc: "Git status", usage: "/gits" },
  gitc: { desc: "Git commit", usage: "/gitc <message>" },
  gitp: { desc: "Git push", usage: "/gitp" },
  gitpl: { desc: "Git pull", usage: "/gitpl" },
  
  init: { desc: "Initialize new project", usage: "/init <type>" },
  install: { desc: "Install dependencies", usage: "/install [package]" },
  build: { desc: "Build project", usage: "/build" },
  serve: { desc: "Start dev server", usage: "/serve" },
  
  hash: { desc: "Generate hash", usage: "/hash <text>" },
  encode: { desc: "Base64 encode", usage: "/encode <text>" },
  decode: { desc: "Base64 decode", usage: "/decode <text>" },
  json: { desc: "Format JSON", usage: "/json <text>" },
  time: { desc: "Show current time", usage: "/time" },
  weather: { desc: "Show weather", usage: "/weather [city]" },
  
  config: { desc: "Configure API settings", usage: "/config" },
  models: { desc: "List available models", usage: "/models" },
};

const COMMAND_LIST = Object.keys(COMMANDS);
let selectedIndex = 0;
let showCommands = false;

function showCommandPalette(filter = "") {
  const filtered = filter 
    ? COMMAND_LIST.filter(c => c.includes(filter.toLowerCase()) || COMMANDS[c].desc.toLowerCase().includes(filter.toLowerCase()))
    : COMMAND_LIST;
  
  if (filtered.length === 0) return "";
  
  selectedIndex = Math.min(selectedIndex, filtered.length - 1);
  const selected = filtered[selectedIndex];
  
  let output = "\n";
  filtered.forEach((cmd, i) => {
    const isSelected = i === selectedIndex;
    const prefix = isSelected ? "▶" : " ";
    const color = isSelected ? "cyan" : "dim";
    printLine(`${prefix} /${cmd.padEnd(12)} ${COMMANDS[cmd].desc}`, color);
  });
  
  output += `\n  ${C.cyan}↑↓${C.reset} navigate  ${C.cyan}Enter${C.reset} select  ${C.cyan}Esc${C.reset} close\n`;
  return output;
}

function getSelectedCommand(filter = "") {
  const filtered = filter 
    ? COMMAND_LIST.filter(c => c.includes(filter.toLowerCase()) || COMMANDS[c].desc.toLowerCase().includes(filter.toLowerCase()))
    : COMMAND_LIST;
  return filtered[selectedIndex] || "";
}

// Banner
function showBanner() {
  console.clear();
  printLine(IDENTITY.icon, "cyan");
  printLine(` ${IDENTITY.name} ${IDENTITY.version}`, "cyan");
  printLine(` ${IDENTITY.tagline}`, "dim");
  console.log("");
  printLine("Type / for commands, or talk naturally.\n", "dim");
}

// Show full help
function showHelp() {
  console.log("");
  printLine(" Commands", "cyan");
  printLine(" ────────", "cyan");
  
  const categories = {
    "Core": ["help", "exit", "clear", "whoami", "login"],
    "Code Generation": ["generate", "app", "api", "react", "python", "go", "node"],
    "Smart Features": ["explain", "fix", "optimize", "review", "test", "debug", "suggest", "architect", "docs"],
    "File Operations": ["ls", "cat", "mkdir", "touch", "rm", "edit", "write", "find", "grep"],
    "System": ["run", "open", "explorer", "ip", "ps", "kill", "pwd", "cd"],
    "Git": ["git", "gitinit", "gits", "gitc", "gitp", "gitpl"],
    "Project": ["init", "install", "build", "serve"],
    "Config": ["config", "models"],
    "Utils": ["hash", "encode", "decode", "json", "time", "weather"],
  };
  
  for (const [cat, cmds] of Object.entries(categories)) {
    printLine(`\n${cat}:`, "yellow");
    cmds.forEach(c => {
      if (COMMANDS[c]) {
        printLine(`  /${c.padEnd(12)} ${COMMANDS[c].desc}`, "dim");
      }
    });
  }
  console.log("");
}

// Main CLI
async function start() {
  showBanner();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let currentDir = process.cwd();
  let inputBuffer = "";
  let commandMode = false;
  let commandFilter = "";

  // Handle special keys for command palette
  rl.input.on("keypress", (char, key) => {
    if (showCommands && key) {
      if (key.name === "up") {
        selectedIndex = Math.max(0, selectedIndex - 1);
        redrawCommandPalette();
      } else if (key.name === "down") {
        const filtered = commandFilter 
          ? COMMAND_LIST.filter(c => c.includes(commandFilter.toLowerCase()))
          : COMMAND_LIST;
        selectedIndex = Math.min(filtered.length - 1, selectedIndex + 1);
        redrawCommandPalette();
      } else if (key.name === "escape") {
        showCommands = false;
        clearCommandPalette();
      }
    }
  });

  function redrawCommandPalette() {
    // This would need terminal control - simplified for now
  }
  
  function clearCommandPalette() {
    // Clear command palette lines
  }

  rl.setPrompt(`${C.green}>${C.reset} `);
  rl.prompt();

  rl.on("line", async (input) => {
    const line = input.trim();
    
    // Handle command palette
    if (showCommands) {
      if (line === "") {
        // Enter - select current
        const selected = getSelectedCommand(commandFilter);
        if (selected) {
          showCommands = false;
          rl.setPrompt(`${C.cyan}/${selected}${C.reset} `);
        }
      } else if (line === "exit" || line === "esc") {
        showCommands = false;
      }
      rl.prompt();
      return;
    }

    if (!line) { rl.prompt(); return; }

    // Command palette trigger
    if (line === "/") {
      showCommands = true;
      selectedIndex = 0;
      commandFilter = "";
      console.log(showCommandPalette());
      rl.prompt();
      return;
    }

    if (line.startsWith("/")) {
      // Check if typing command with filter
      const partial = line.substring(1);
      const matching = COMMAND_LIST.filter(c => c.startsWith(partial.split(" ")[0].toLowerCase()));
      
      if (matching.length > 1 && !COMMANDS[partial.split(" ")[0].toLowerCase()]) {
        // Multiple matches - show preview
        console.log("\n  Commands:");
        matching.slice(0, 5).forEach(c => printLine(`    /${c}`, "cyan"));
        console.log("");
      }

      const parts = line.split(" ");
      const cmd = parts[0].toLowerCase().substring(1);
      const args = parts.slice(1).join(" ");

      if (!COMMANDS[cmd]) {
        const similar = COMMAND_LIST.filter(c => c.startsWith(cmd.substring(0, 3)));
        if (similar.length > 0) {
          printLine(`Unknown: /${cmd}. Did you mean:`, "yellow");
          similar.forEach(s => printLine(`  /${s}`, "cyan"));
        } else {
          printLine(`Unknown: /${cmd}. Type /help for all commands.`, "red");
        }
        rl.prompt();
        return;
      }

      switch (cmd) {
        case "help":
          showHelp();
          break;
        case "exit":
        case "quit":
          printLine("\nGoodbye! 👋", "cyan");
          rl.close();
          process.exit(0);
        case "clear":
          showBanner();
          break;
        case "whoami":
          printLine(`\n🤖 ${IDENTITY.name}`, "cyan");
          printLine(`   ${IDENTITY.tagline}`, "dim");
          IDENTITY.personality.traits.forEach(t => printLine(`   • ${t}`, "green"));
          break;
        case "login":
          const loginPath = path.join(__dirname, "webui", "login.html");
          if (fs.existsSync(loginPath)) {
            exec(`start "" "${loginPath}"`);
            printLine("Opening login page...", "cyan");
          } else {
            printLine("Login page not found. Use /config to configure API.", "yellow");
          }
          break;
        case "config":
          printLine("\n📡 API Configuration", "cyan");
          printLine("────────────────────", "cyan");
          const configPath = path.join(__dirname, "config.json");
          if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
            printLine(`  Provider: ${config.provider || "builtin"}`, "green");
            printLine(`  Model: ${config.model || "llama3.2:latest"}`, "green");
            printLine(`  API URL: ${config.apiUrl || "local (ollama)"}`, "green");
          } else {
            printLine("  Using built-in AI (GodCoder)", "dim");
            printLine("  Run /login to configure external API", "dim");
          }
          console.log("");
          printLine("To configure: Edit config.json or use /login", "dim");
          break;
        case "models":
          printLine("\n📋 Available Models:", "cyan");
          printLine("  • llama3.2:latest (Ollama)", "dim");
          printLine("  • llama3.1:8b (Ollama)", "dim");
          printLine("  • codellama:7b (Ollama)", "dim");
          printLine("  • godcoder (built-in)", "dim");
          console.log("");
          break;

        // ═══════════════════════ CODE GENERATION
        case "generate":
          if (!args) { printLine("Usage: /generate <description>", "yellow"); break; }
          await think("Generating", async () => {
            const code = generateCode(args, "js");
            console.log("");
            console.log(code);
          });
          break;
        case "app":
          const appName = args || "my-app";
          const appDir = path.join(currentDir, appName);
          await think("Creating web app", async () => {
            if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });
            fs.writeFileSync(path.join(appDir, "index.html"), generateCode(appName, "html"));
            fs.writeFileSync(path.join(appDir, "style.css"), generateCode(appName, "css"));
            fs.writeFileSync(path.join(appDir, "script.js"), generateCode(appName, "js"));
          });
          printLine(`✓ Created ${appDir}`, "green");
          break;
        case "api":
          const apiName = args || "my-api";
          const apiDir = path.join(currentDir, apiName);
          await think("Creating API", async () => {
            if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
            fs.writeFileSync(path.join(apiDir, "server.js"), generateCode(apiName, "python"));
            fs.writeFileSync(path.join(apiDir, "package.json"), JSON.stringify({
              name: apiName, version: "1.0.0", main: "server.js",
              scripts: { start: "node server.js" }
            }, null, 2));
          });
          printLine(`✓ Created ${apiDir}`, "green");
          break;
        case "react":
          const reactName = args || "my-react";
          const reactDir = path.join(currentDir, reactName);
          await think("Creating React app", async () => {
            if (!fs.existsSync(reactDir)) fs.mkdirSync(reactDir, { recursive: true });
            fs.writeFileSync(path.join(reactDir, "App.jsx"), generateCode(reactName, "react"));
            fs.writeFileSync(path.join(reactDir, "App.css"), generateCode(reactName, "css"));
          });
          printLine(`✓ Created ${reactDir}`, "green");
          break;
        case "python":
          const pyName = args ? (args.endsWith(".py") ? args : args + ".py") : "script.py";
          const pyPath = path.join(currentDir, pyName);
          await think("Creating Python", async () => {
            fs.writeFileSync(pyPath, generateCode(pyName, "python"));
          });
          printLine(`✓ Created ${pyPath}`, "green");
          break;
        case "go":
          const goName = args ? (args.endsWith(".go") ? args : args + ".go") : "main.go";
          const goPath = path.join(currentDir, goName);
          await think("Creating Go", async () => {
            fs.writeFileSync(goPath, generateCode(goName, "go"));
          });
          printLine(`✓ Created ${goPath}`, "green");
          break;
        case "node":
          const nodeName = args || "my-node";
          const nodeDir = path.join(currentDir, nodeName);
          await think("Creating Node project", async () => {
            if (!fs.existsSync(nodeDir)) fs.mkdirSync(nodeDir, { recursive: true });
            fs.writeFileSync(path.join(nodeDir, "index.js"), generateCode(nodeName, "js"));
            fs.writeFileSync(path.join(nodeDir, "package.json"), JSON.stringify({
              name: nodeName, version: "1.0.0", main: "index.js"
            }, null, 2));
          });
          printLine(`✓ Created ${nodeDir}`, "green");
          break;

        // ═══════════════════════ SMART FEATURES
        case "explain":
          if (!args) { printLine("Usage: /explain <code>", "yellow"); break; }
          await think("Explaining", async () => {
            const explanation = chat("Explain this code: " + args);
            console.log("");
            console.log(explanation);
          });
          break;
        case "fix":
          if (!args) { printLine("Usage: /fix <code or issue>", "yellow"); break; }
          await think("Fixing bugs", async () => {
            const fix = chat("Fix bugs in: " + args);
            console.log("");
            console.log(fix);
          });
          break;
        case "optimize":
          if (!args) { printLine("Usage: /optimize <code>", "yellow"); break; }
          await think("Optimizing", async () => {
            const optimized = chat("Optimize: " + args);
            console.log("");
            console.log(optimized);
          });
          break;
        case "review":
          if (!args) { printLine("Usage: /review <code>", "yellow"); break; }
          await think("Reviewing code", async () => {
            const review = chat("Review this code: " + args);
            console.log("");
            console.log(review);
          });
          break;
        case "test":
          if (!args) { printLine("Usage: /test <code>", "yellow"); break; }
          await think("Generating tests", async () => {
            const tests = chat("Generate tests for: " + args);
            console.log("");
            console.log(tests);
          });
          break;
        case "debug":
          if (!args) { printLine("Usage: /debug <issue>", "yellow"); break; }
          await think("Debugging", async () => {
            const debugHelp = chat("Help debug: " + args);
            console.log("");
            console.log(debugHelp);
          });
          break;
        case "suggest":
          await think("Analyzing", async () => {
            const suggestions = chat("Give me proactive development suggestions");
            console.log("");
            console.log(suggestions);
          });
          break;
        case "architect":
          if (!args) { printLine("Usage: /architect <project>", "yellow"); break; }
          await think("Designing architecture", async () => {
            const architecture = chat("Design architecture for: " + args);
            console.log("");
            console.log(architecture);
          });
          break;
        case "docs":
          if (!args) { printLine("Usage: /docs <topic>", "yellow"); break; }
          await think("Generating docs", async () => {
            const docs = chat("Generate documentation for: " + args);
            console.log("");
            console.log(docs);
          });
          break;

        // ═══════════════════════ FILE OPERATIONS
        case "ls":
          const dir = args ? path.resolve(currentDir, args) : currentDir;
          if (fs.existsSync(dir)) {
            fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
              printLine(`  ${item.isDirectory() ? "📁" : "📄"} ${item.name}`, item.isDirectory() ? "yellow" : "dim");
            });
          } else {
            printLine(`Not found: ${dir}`, "red");
          }
          break;
        case "cat":
          if (!args) { printLine("Usage: /cat <filepath>", "yellow"); break; }
          const filePath = path.resolve(currentDir, args);
          if (fs.existsSync(filePath)) {
            console.log(fs.readFileSync(filePath, "utf8"));
          } else {
            printLine(`Not found: ${filePath}`, "red");
          }
          break;
        case "mkdir":
          if (!args) { printLine("Usage: /mkdir <name>", "yellow"); break; }
          const mDir = path.resolve(currentDir, args);
          if (!fs.existsSync(mDir)) { fs.mkdirSync(mDir, { recursive: true }); printLine(`✓ Created ${mDir}`, "green"); }
          else { printLine(`Exists: ${mDir}`, "yellow"); }
          break;
        case "touch":
          if (!args) { printLine("Usage: /touch <filename>", "yellow"); break; }
          const fPath = path.resolve(currentDir, args);
          const fDir = path.dirname(fPath);
          if (!fs.existsSync(fDir)) fs.mkdirSync(fDir, { recursive: true });
          fs.writeFileSync(fPath, "", "utf8");
          printLine(`✓ Created ${fPath}`, "green");
          break;
        case "rm":
          if (!args) { printLine("Usage: /rm <path>", "yellow"); break; }
          const target = path.resolve(currentDir, args);
          if (fs.existsSync(target)) {
            const stat = fs.statSync(target);
            if (stat.isDirectory()) fs.rmdirSync(target, { recursive: true });
            else fs.unlinkSync(target);
            printLine(`✓ Deleted ${target}`, "green");
          } else {
            printLine(`Not found: ${target}`, "red");
          }
          break;
        case "edit":
          if (!args) { printLine("Usage: /edit <filepath>", "yellow"); break; }
          const editPath = path.resolve(currentDir, args);
          if (fs.existsSync(editPath)) {
            printLine("Current content:", "dim");
            console.log(fs.readFileSync(editPath, "utf8").substring(0, 500));
            printLine("\nEnter new content (type 'END' to save):", "yellow");
            const lines = [];
            const addLine = () => new Promise(r => rl.question("", line => {
              if (line.trim() === "END") { r(); return; }
              lines.push(line);
              addLine().then(r);
            }));
            await addLine();
            fs.writeFileSync(editPath, lines.join("\n"), "utf8");
            printLine("✓ Saved", "green");
          } else {
            printLine(`Not found: ${editPath}`, "red");
          }
          break;
        case "write":
          const writeParts = args.split(" ");
          if (writeParts.length < 2) { printLine("Usage: /write <filepath> <content>", "yellow"); break; }
          const wPath = path.resolve(currentDir, writeParts[0]);
          const wContent = args.substring(writeParts[0].length + 1);
          const wDir = path.dirname(wPath);
          if (!fs.existsSync(wDir)) fs.mkdirSync(wDir, { recursive: true });
          fs.writeFileSync(wPath, wContent, "utf8");
          printLine(`✓ Written to ${wPath}`, "green");
          break;
        case "find":
          if (!args) { printLine("Usage: /find <pattern>", "yellow"); break; }
          const found = [];
          function searchDir(dir, pattern) {
            try {
              fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
                const fullPath = path.join(dir, item.name);
                if (item.name.includes(pattern)) found.push(fullPath);
                if (item.isDirectory() && !item.name.startsWith(".")) searchDir(fullPath, pattern);
              });
            } catch (e) {}
          }
          searchDir(currentDir, args);
          found.slice(0, 20).forEach(f => printLine(`  ${f}`, "cyan"));
          if (found.length > 20) printLine(`  ... and ${found.length - 20} more`, "dim");
          break;
        case "grep":
          const grepParts = args.split(" ");
          const grepPattern = grepParts[0];
          const grepPath = grepParts[1] ? path.resolve(currentDir, grepParts[1]) : currentDir;
          const grepResults = [];
          function searchFile(file) {
            try {
              const content = fs.readFileSync(file, "utf8");
              content.split("\n").forEach((line, i) => {
                if (line.includes(grepPattern)) grepResults.push(`${file}:${i+1}: ${line.substring(0, 80)}`);
              });
            } catch (e) {}
          }
          function grepDir(dir) {
            try {
              fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory() && !item.name.startsWith(".")) grepDir(fullPath);
                else if (item.isFile()) searchFile(fullPath);
              });
            } catch (e) {}
          }
          grepDir(grepPath);
          grepResults.slice(0, 30).forEach(r => printLine(`  ${r}`, "cyan"));
          break;

        // ═══════════════════════ SYSTEM
        case "run":
          if (!args) { printLine("Usage: /run <command>", "yellow"); break; }
          exec(args, { cwd: currentDir }, (e, out, err) => { if (out) console.log(out); if (err) printLine(err, "red"); });
          break;
        case "open":
          if (!args) { printLine("Usage: /open <path>", "yellow"); break; }
          const openPath = path.resolve(currentDir, args);
          if (fs.existsSync(openPath)) {
            exec(`start "" "${openPath}"`);
            printLine(`✓ Opened ${openPath}`, "green");
          } else { printLine(`Not found`, "red"); }
          break;
        case "explorer":
          const expPath = args ? path.resolve(currentDir, args) : currentDir;
          exec(`explorer "${expPath}"`);
          printLine(`✓ Opened ${expPath}`, "green");
          break;
        case "ip":
          require("os").networkInterfaces().forEach(n => n.forEach(i => { if (i.family === "IPv4") printLine(`  ${i.address}`, "green"); }));
          break;
        case "ps":
          exec("tasklist", (e, out) => { if (out) out.split("\n").slice(0, 15).forEach(l => printLine(l.substring(0, 80), "dim")); });
          break;
        case "kill":
          if (!args) { printLine("Usage: /kill <PID>", "yellow"); break; }
          exec(`taskkill /PID ${args} /F`, e => e ? printLine("Failed", "red") : printLine(`✓ Killed ${args}`, "green"));
          break;
        case "pwd":
          printLine(currentDir, "cyan");
          break;
        case "cd":
          if (!args) { printLine("Usage: /cd <path>", "yellow"); break; }
          const newDir = path.resolve(currentDir, args);
          if (fs.existsSync(newDir) && fs.statSync(newDir).isDirectory()) {
            currentDir = newDir;
            process.chdir(currentDir);
            printLine(`Changed to: ${currentDir}`, "green");
          } else {
            printLine(`Not found: ${newDir}`, "red");
          }
          break;

        // ═══════════════════════ GIT
        case "git":
          if (!args) { exec("git status", { cwd: currentDir }, (e, out) => console.log(out || "")); break; }
          exec(`git ${args}`, { cwd: currentDir }, (e, out, err) => { if (out) console.log(out); if (err) printLine(err, "red"); });
          break;
        case "gitinit":
          exec("git init", { cwd: currentDir }, (e, out) => { if (out) console.log(out); printLine("✓ Initialized git", "green"); });
          break;
        case "gits":
          exec("git status", { cwd: currentDir }, (e, out) => console.log(out || ""));
          break;
        case "gitc":
          if (!args) { printLine("Usage: /gitc <message>", "yellow"); break; }
          exec(`git add . && git commit -m "${args}"`, { cwd: currentDir }, (e, out) => { if (out) console.log(out); printLine("✓ Committed", "green"); });
          break;
        case "gitp":
          exec("git push", { cwd: currentDir }, (e, out) => { if (out) console.log(out); printLine("✓ Pushed", "green"); });
          break;
        case "gitpl":
          exec("git pull", { cwd: currentDir }, (e, out) => { if (out) console.log(out); printLine("✓ Pulled", "green"); });
          break;

        // ═══════════════════════ PROJECT
        case "init":
          const initType = args || "basic";
          const initDir = path.join(currentDir, args || "my-project");
          await think("Initializing", async () => {
            if (!fs.existsSync(initDir)) fs.mkdirSync(initDir, { recursive: true });
            fs.writeFileSync(path.join(initDir, "README.md"), `# ${args || "Project"}\n\nCreated with Open Friday`);
          });
          printLine(`✓ Created ${initDir}`, "green");
          break;
        case "install":
          if (!args) { exec("npm install", { cwd: currentDir }, (e, out) => console.log(out || "")); break; }
          await think("Installing", async () => {
            exec(`npm install ${args}`, { cwd: currentDir }, (e, out) => {});
          });
          printLine(`✓ Installed ${args}`, "green");
          break;
        case "build":
          if (fs.existsSync(path.join(currentDir, "package.json"))) {
            exec("npm run build", { cwd: currentDir }, (e, out) => console.log(out || ""));
          } else {
            printLine("No package.json found", "red");
          }
          break;
        case "serve":
          if (fs.existsSync(path.join(currentDir, "package.json"))) {
            exec("npm run start", { cwd: currentDir }, (e, out) => console.log(out || ""));
          } else {
            printLine("No package.json found", "red");
          }
          break;

        // ═══════════════════════ UTILS
        case "hash":
          const crypto = require("crypto");
          const hash = crypto.createHash("md5").update(args || "").digest("hex");
          printLine(hash, "cyan");
          break;
        case "encode":
          printLine(Buffer.from(args || "").toString("base64"), "cyan");
          break;
        case "decode":
          try { printLine(Buffer.from(args || "", "base64").toString(), "cyan"); }
          catch (e) { printLine("Invalid base64", "red"); }
          break;
        case "json":
          try { console.log(JSON.stringify(JSON.parse(args || "{}"), null, 2)); }
          catch (e) { printLine("Invalid JSON", "red"); }
          break;
        case "time":
          printLine(new Date().toLocaleString(), "cyan");
          break;
        case "weather":
          printLine("Weather feature coming soon!", "dim");
          break;
      }
    } else {
      // Natural conversation with thinking animation
      await think("Thinking", async () => {
        const response = chat(line);
        console.log("");
        console.log(response);
      });
    }

    rl.prompt();
  });
}

start();