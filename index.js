#!/usr/bin/env node
"use strict";
// Open Friday v2.0 - Clean, Claude-style responses

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

// Colors
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

// ═══════════════════════════════════════════════
// TYPING ANIMATION - Clean output display
// ═══════════════════════════════════════════════
async function typeResponse(text, speed = 8) {
  // Print with slight delay for natural feel
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(text[i]);
    if (text[i] === '\n') {
      await new Promise(r => setTimeout(r, speed * 2));
    } else {
      await new Promise(r => setTimeout(r, speed));
    }
  }
}

// Quick display without animation
function respond(text) {
  console.log("");
  printLine(text, "cyan");
  console.log("");
}

// ═══════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════
const COMMANDS = {
  help: { desc: "Show all commands", usage: "/help" },
  exit: { desc: "Exit Open Friday", usage: "/exit" },
  clear: { desc: "Clear terminal", usage: "/clear" },
  whoami: { desc: "About Open Friday", usage: "/whoami" },
  login: { desc: "Open login/pricing page", usage: "/login" },
  config: { desc: "Show API configuration", usage: "/config" },
  models: { desc: "List available models", usage: "/models" },
  
  generate: { desc: "Generate code", usage: "/generate <description>" },
  app: { desc: "Create web app", usage: "/app <name>" },
  api: { desc: "Create REST API", usage: "/api <name>" },
  react: { desc: "Create React app", usage: "/react <name>" },
  python: { desc: "Create Python script", usage: "/python <name>" },
  go: { desc: "Create Go program", usage: "/go <name>" },
  node: { desc: "Create Node project", usage: "/node <name>" },
  
  explain: { desc: "Explain code", usage: "/explain <code>" },
  fix: { desc: "Fix bugs", usage: "/fix <code>" },
  optimize: { desc: "Optimize code", usage: "/optimize <code>" },
  review: { desc: "Review code", usage: "/review <code>" },
  test: { desc: "Generate tests", usage: "/test <code>" },
  debug: { desc: "Debug issue", usage: "/debug <issue>" },
  suggest: { desc: "Get suggestions", usage: "/suggest" },
  architect: { desc: "Design architecture", usage: "/architect <project>" },
  docs: { desc: "Generate docs", usage: "/docs <topic>" },
  
  ls: { desc: "List files", usage: "/ls [path]" },
  cat: { desc: "Read file", usage: "/cat <filepath>" },
  mkdir: { desc: "Create folder", usage: "/mkdir <name>" },
  touch: { desc: "Create file", usage: "/touch <filename>" },
  rm: { desc: "Delete file/folder", usage: "/rm <path>" },
  find: { desc: "Find files", usage: "/find <pattern>" },
  grep: { desc: "Search in files", usage: "/grep <pattern> [path]" },
  
  run: { desc: "Run command", usage: "/run <command>" },
  open: { desc: "Open file/folder", usage: "/open <path>" },
  explorer: { desc: "Open explorer", usage: "/explorer [path]" },
  ip: { desc: "Show IP", usage: "/ip" },
  ps: { desc: "List processes", usage: "/ps" },
  kill: { desc: "Kill process", usage: "/kill <PID>" },
  pwd: { desc: "Current directory", usage: "/pwd" },
  cd: { desc: "Change directory", usage: "/cd <path>" },
  
  git: { desc: "Git commands", usage: "/git <args>" },
  init: { desc: "Initialize project", usage: "/init <name>" },
  install: { desc: "Install npm", usage: "/install [package]" },
  hash: { desc: "Hash text", usage: "/hash <text>" },
  time: { desc: "Show time", usage: "/time" },
};

// Banner
function showBanner() {
  console.clear();
  printLine(IDENTITY.icon, "cyan");
  printLine(` ${IDENTITY.name} ${IDENTITY.version}`, "cyan");
  printLine(` ${IDENTITY.tagline}`, "dim");
  console.log("");
}

// Show help
function showHelp() {
  console.log("");
  printLine("Commands:", "cyan");
  console.log("");
  
  const cats = {
    "Core": ["help", "exit", "clear", "whoami", "login", "config", "models"],
    "Code Gen": ["generate", "app", "api", "react", "python", "go", "node"],
    "Smart": ["explain", "fix", "optimize", "review", "test", "debug", "suggest", "architect", "docs"],
    "Files": ["ls", "cat", "mkdir", "touch", "rm", "find", "grep"],
    "System": ["run", "open", "explorer", "ip", "ps", "kill", "pwd", "cd"],
    "Git": ["git", "init", "install"],
    "Utils": ["hash", "time"],
  };
  
  for (const [cat, cmds] of Object.entries(cats)) {
    printLine(`[${cat}]`, "yellow");
    cmds.forEach(c => {
      if (COMMANDS[c]) {
        printLine(`  /${c.padEnd(12)} ${COMMANDS[c].desc}`, "dim");
      }
    });
    console.log("");
  }
}

// Main
async function start() {
  showBanner();
  printLine("Type /help for commands or talk to me naturally.\n", "dim");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let currentDir = process.cwd();

  rl.setPrompt(`${C.green}>${C.reset} `);
  rl.prompt();

  rl.on("line", async (input) => {
    const line = input.trim();
    if (!line) { rl.prompt(); return; }

    // Slash command
    if (line.startsWith("/")) {
      const parts = line.slice(1).split(" ");
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(" ");

      if (!COMMANDS[cmd]) {
        const similar = Object.keys(COMMANDS).filter(c => c.startsWith(cmd.slice(0, 3)));
        if (similar.length > 0) {
          printLine(`Unknown: /${cmd}. Did you mean:`, "yellow");
          similar.forEach(s => printLine(`  /${s}`, "cyan"));
        } else {
          printLine(`Unknown: /${cmd}. Type /help for all.`, "red");
        }
        rl.prompt();
        return;
      }

      await executeCommand(cmd, args, currentDir, rl);
      rl.prompt();
      return;
    }

    // Natural conversation - get AI response
    const response = chat(line);
    console.log("");
    await typeResponse(response, 5);
    console.log("");

    rl.prompt();
  });
}

// Execute commands
async function executeCommand(cmd, args, currentDir, rl) {
  switch (cmd) {
    // Core
    case "help": showHelp(); break;
    case "exit": case "quit": 
      printLine("\nGoodbye! 👋", "cyan"); 
      process.exit(0);
    case "clear": showBanner(); break;
    case "whoami":
      printLine(`\n🤖 ${IDENTITY.name}`, "cyan");
      printLine(`   ${IDENTITY.tagline}`, "dim");
      IDENTITY.personality.traits.forEach(t => printLine(`   ${t}`, "green"));
      console.log("");
      break;
    case "login":
      const loginPath = path.join(__dirname, "webui", "login.html");
      if (fs.existsSync(loginPath)) {
        exec(`start "" "${loginPath}"`);
        respond("Opening login page...");
      } else {
        printLine("Login page not found", "red");
      }
      break;
    case "config":
      printLine("\nAPI Configuration:", "cyan");
      const cfgPath = path.join(__dirname, "config.json");
      if (fs.existsSync(cfgPath)) {
        const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
        printLine(`  Provider: ${cfg.provider || "builtin"}`, "green");
        printLine(`  Model: ${cfg.model || "llama3.2:latest"}`, "green");
        printLine(`  API: ${cfg.apiUrl || "local"}`, "dim");
      } else {
        printLine("  Using built-in AI", "dim");
      }
      console.log("");
      break;
    case "models":
      printLine("\nAvailable Models:", "cyan");
      printLine("  • godcoder (built-in)", "green");
      printLine("  • llama3.2:latest (ollama)", "dim");
      printLine("  • gpt-4 (with API key)", "dim");
      printLine("  • claude-3 (with API key)", "dim");
      console.log("");
      break;

    // Code Generation
    case "generate":
      if (!args) { printLine("Usage: /generate <description>", "yellow"); return; }
      const code = generateCode(args, "js");
      console.log("");
      printLine(code, "cyan");
      console.log("");
      break;
    case "app":
      const appName = args || "my-app";
      const appDir = path.join(currentDir, appName);
      if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(path.join(appDir, "index.html"), generateCode(appName, "html"));
      fs.writeFileSync(path.join(appDir, "style.css"), generateCode(appName, "css"));
      fs.writeFileSync(path.join(appDir, "script.js"), generateCode(appName, "js"));
      respond(`Created web app: ${appDir}`);
      break;
    case "api":
      const apiName = args || "my-api";
      const apiDir = path.join(currentDir, apiName);
      if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
      fs.writeFileSync(path.join(apiDir, "server.js"), generateCode(apiName, "node"));
      fs.writeFileSync(path.join(apiDir, "package.json"), JSON.stringify({
        name: apiName, version: "1.0.0", main: "server.js",
        scripts: { start: "node server.js" }
      }, null, 2));
      respond(`Created API: ${apiDir}`);
      break;
    case "react":
      const reactName = args || "my-react";
      const reactDir = path.join(currentDir, reactName);
      if (!fs.existsSync(reactDir)) fs.mkdirSync(reactDir, { recursive: true });
      fs.writeFileSync(path.join(reactDir, "App.jsx"), generateCode(reactName, "react"));
      fs.writeFileSync(path.join(reactDir, "App.css"), generateCode(reactName, "css"));
      respond(`Created React app: ${reactDir}`);
      break;
    case "python":
      const pyName = args ? (args.endsWith(".py") ? args : args + ".py") : "script.py";
      fs.writeFileSync(path.join(currentDir, pyName), generateCode(pyName, "python"));
      respond(`Created Python: ${pyName}`);
      break;
    case "go":
      const goName = args ? (args.endsWith(".go") ? args : args + ".go") : "main.go";
      fs.writeFileSync(path.join(currentDir, goName), generateCode(goName, "go"));
      respond(`Created Go: ${goName}`);
      break;
    case "node":
      const nodeName = args || "my-node";
      const nodeDir = path.join(currentDir, nodeName);
      if (!fs.existsSync(nodeDir)) fs.mkdirSync(nodeDir, { recursive: true });
      fs.writeFileSync(path.join(nodeDir, "index.js"), generateCode(nodeName, "js"));
      fs.writeFileSync(path.join(nodeDir, "package.json"), JSON.stringify({
        name: nodeName, version: "1.0.0", main: "index.js"
      }, null, 2));
      respond(`Created Node project: ${nodeDir}`);
      break;

    // Smart Features
    case "explain":
      if (!args) { printLine("Usage: /explain <code>", "yellow"); return; }
      respond(chat("Explain: " + args));
      break;
    case "fix":
      if (!args) { printLine("Usage: /fix <code>", "yellow"); return; }
      respond(chat("Fix: " + args));
      break;
    case "optimize":
      if (!args) { printLine("Usage: /optimize <code>", "yellow"); return; }
      respond(chat("Optimize: " + args));
      break;
    case "review":
      if (!args) { printLine("Usage: /review <code>", "yellow"); return; }
      respond(chat("Review: " + args));
      break;
    case "test":
      if (!args) { printLine("Usage: /test <code>", "yellow"); return; }
      respond(chat("Test: " + args));
      break;
    case "debug":
      if (!args) { printLine("Usage: /debug <issue>", "yellow"); return; }
      respond(chat("Debug: " + args));
      break;
    case "suggest":
      respond(chat("Suggest"));
      break;
    case "architect":
      if (!args) { printLine("Usage: /architect <project>", "yellow"); return; }
      respond(chat("Architecture: " + args));
      break;
    case "docs":
      if (!args) { printLine("Usage: /docs <topic>", "yellow"); return; }
      respond(chat("Docs: " + args));
      break;

    // Files
    case "ls":
      const dir = args ? path.resolve(currentDir, args) : currentDir;
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
          printLine(`  ${item.isDirectory() ? "📁" : "📄"} ${item.name}`, item.isDirectory() ? "yellow" : "dim");
        });
      } else { printLine(`Not found: ${dir}`, "red"); }
      break;
    case "cat":
      if (!args) { printLine("Usage: /cat <filepath>", "yellow"); return; }
      const fpath = path.resolve(currentDir, args);
      if (fs.existsSync(fpath)) console.log(fs.readFileSync(fpath, "utf8"));
      else printLine(`Not found: ${fpath}`, "red");
      break;
    case "mkdir":
      if (!args) { printLine("Usage: /mkdir <name>", "yellow"); return; }
      const mdir = path.resolve(currentDir, args);
      if (!fs.existsSync(mdir)) { fs.mkdirSync(mdir, { recursive: true }); respond(`Created: ${mdir}`); }
      else printLine(`Exists: ${mdir}`, "yellow");
      break;
    case "touch":
      if (!args) { printLine("Usage: /touch <filename>", "yellow"); return; }
      const tfp = path.resolve(currentDir, args);
      fs.writeFileSync(tfp, "", "utf8");
      respond(`Created: ${tfp}`);
      break;
    case "rm":
      if (!args) { printLine("Usage: /rm <path>", "yellow"); return; }
      const rmp = path.resolve(currentDir, args);
      if (fs.existsSync(rmp)) {
        fs.statSync(rmp).isDirectory() ? fs.rmdirSync(rmp, { recursive: true }) : fs.unlinkSync(rmp);
        respond(`Deleted: ${rmp}`);
      } else { printLine(`Not found: ${rmp}`, "red"); }
      break;
    case "find":
      if (!args) { printLine("Usage: /find <pattern>", "yellow"); return; }
      const found = [];
      function search(d, p) {
        try {
          fs.readdirSync(d, { withFileTypes: true }).forEach(i => {
            const fp = path.join(d, i.name);
            if (i.name.includes(p)) found.push(fp);
            if (i.isDirectory() && !i.name.startsWith(".")) search(fp, p);
          });
        } catch (e) {}
      }
      search(currentDir, args);
      found.slice(0, 15).forEach(f => printLine(`  ${f}`, "cyan"));
      break;
    case "grep":
      if (!args) { printLine("Usage: /grep <pattern>", "yellow"); return; }
      const pattern = args.split(" ")[0];
      const results = [];
      function searchFile(f) {
        try {
          fs.readFileSync(f, "utf8").split("\n").forEach((l, i) => {
            if (l.includes(pattern)) results.push(`${f}:${i+1}: ${l.substring(0, 60)}`);
          });
        } catch (e) {}
      }
      function grepDir(d) {
        try {
          fs.readdirSync(d, { withFileTypes: true }).forEach(i => {
            const fp = path.join(d, i.name);
            if (i.isDirectory() && !i.name.startsWith(".")) grepDir(fp);
            else if (i.isFile()) searchFile(fp);
          });
        } catch (e) {}
      }
      grepDir(currentDir);
      results.slice(0, 20).forEach(r => printLine(`  ${r}`, "cyan"));
      break;

    // System
    case "run":
      if (!args) { printLine("Usage: /run <command>", "yellow"); return; }
      exec(args, { cwd: currentDir }, (e, out) => { if (out) console.log(out); if (e) printLine(e.message, "red"); });
      break;
    case "open":
      if (!args) { printLine("Usage: /open <path>", "yellow"); return; }
      const op = path.resolve(currentDir, args);
      if (fs.existsSync(op)) { exec(`start "" "${op}"`); respond(`Opened: ${op}`); }
      else printLine(`Not found`, "red");
      break;
    case "explorer":
      exec(`explorer "${args ? path.resolve(currentDir, args) : currentDir}"`);
      respond("Opened explorer");
      break;
    case "ip":
      require("os").networkInterfaces().forEach(n => n.forEach(i => { if (i.family === "IPv4") printLine(`  ${i.address}`, "green"); }));
      break;
    case "ps":
      exec("tasklist", (e, out) => { if (out) out.split("\n").slice(0, 12).forEach(l => printLine(l.substring(0, 70), "dim")); });
      break;
    case "kill":
      if (!args) { printLine("Usage: /kill <PID>", "yellow"); return; }
      exec(`taskkill /PID ${args} /F`, e => e ? printLine("Failed", "red") : respond(`Killed process ${args}`));
      break;
    case "pwd":
      printLine(currentDir, "cyan");
      break;
    case "cd":
      if (!args) { printLine("Usage: /cd <path>", "yellow"); return; }
      const ndir = path.resolve(currentDir, args);
      if (fs.existsSync(ndir) && fs.statSync(ndir).isDirectory()) {
        currentDir = ndir;
        process.chdir(currentDir);
        respond(`Changed to: ${currentDir}`);
      } else { printLine(`Not found: ${ndir}`, "red"); }
      break;

    // Git
    case "git":
      exec(`git ${args}`, { cwd: currentDir }, (e, out) => { if (out) console.log(out); });
      break;
    case "init":
      const iname = args || "my-project";
      const idir = path.join(currentDir, iname);
      if (!fs.existsSync(idir)) fs.mkdirSync(idir, { recursive: true });
      fs.writeFileSync(path.join(idir, "README.md"), `# ${iname}\n\nCreated with Open Friday`);
      respond(`Created project: ${idir}`);
      break;
    case "install":
      exec(args ? `npm install ${args}` : "npm install", { cwd: currentDir }, (e, out) => { 
        if (out) console.log(out); 
        if (!e) respond("Dependencies installed");
      });
      break;

    // Utils
    case "hash":
      const crypto = require("crypto");
      respond(crypto.createHash("md5").update(args || "").digest("hex"));
      break;
    case "time":
      respond(new Date().toLocaleString());
      break;
  }
}

start();