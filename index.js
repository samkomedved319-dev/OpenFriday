#!/usr/bin/env node
"use strict";
// Open Friday v2.0 - With Login System

const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { IDENTITY, chat, generateCode } = require("./core/builtin");
const { loginUser, logoutUser, getCurrentUser, isLoggedIn, createUser } = require("./core/auth");

// Version check
if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(IDENTITY.version);
  process.exit(0);
}

// Colors
const C = { reset: "\x1b[0m", dim: "\x1b[2m", bold: "\x1b[1m", cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m" };

function print(msg, color = "reset") { process.stdout.write(`${C[color]}${msg}${C.reset}`); }
function printLine(msg, color = "reset") { console.log(`${C[color]}${msg}${C.reset}`); }

// Typing animation for responses
async function typeResponse(text, speed = 6) {
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(text[i]);
    if (text[i] === '\n') await new Promise(r => setTimeout(r, speed * 2));
    else await new Promise(r => setTimeout(r, speed));
  }
}

function respond(text) { console.log(""); printLine(text, "cyan"); console.log(""); }

// Commands
const COMMANDS = {
  // Core
  help: "Show all commands",
  exit: "Exit Open Friday",
  clear: "Clear terminal",
  whoami: "About Open Friday",
  login: "Login to Open Friday",
  logout: "Logout",
  register: "Create new account",
  profile: "Show profile",
  
  // Code Generation
  generate: "Generate code",
  app: "Create web app",
  api: "Create REST API",
  react: "Create React app",
  python: "Create Python script",
  go: "Create Go program",
  node: "Create Node project",
  
  // Smart Features
  explain: "Explain code",
  fix: "Fix bugs",
  optimize: "Optimize code",
  review: "Review code",
  test: "Generate tests",
  debug: "Debug issue",
  suggest: "Get suggestions",
  architect: "Design architecture",
  
  // Files
  ls: "List files",
  cat: "Read file",
  mkdir: "Create folder",
  touch: "Create file",
  rm: "Delete file/folder",
  find: "Find files",
  grep: "Search in files",
  
  // System
  run: "Run command",
  open: "Open file/folder",
  explorer: "Open explorer",
  ip: "Show IP",
  ps: "List processes",
  pwd: "Current directory",
  cd: "Change directory",
  
  // Project
  git: "Git commands",
  init: "Initialize project",
  install: "Install npm",
  
  // Utils
  time: "Show time",
  hash: "Hash text"
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
    "Auth": ["login", "logout", "register", "profile"],
    "Code Gen": ["generate", "app", "api", "react", "python", "go", "node"],
    "Smart": ["explain", "fix", "optimize", "review", "test", "debug", "suggest", "architect"],
    "Files": ["ls", "cat", "mkdir", "touch", "rm", "find", "grep"],
    "System": ["run", "open", "explorer", "ip", "ps", "pwd", "cd"],
    "Project": ["git", "init", "install"],
    "Utils": ["time", "hash"]
  };
  
  for (const [cat, cmds] of Object.entries(cats)) {
    printLine(`[${cat}]`, "yellow");
    cmds.forEach(c => printLine(`  /${c.padEnd(12)} ${COMMANDS[c]}`, "dim"));
    console.log("");
  }
}

// Main
async function start() {
  const user = getCurrentUser();
  
  showBanner();
  
  if (user) {
    printLine(`Logged in as: ${user.name} (${user.email})`, "green");
  } else {
    printLine("Not logged in. Use /login or /register to sign in.", "yellow");
    printLine("Or open dashboard: /login (opens browser)\n", "dim");
  }
  
  printLine("Type /help for commands or talk naturally.\n", "dim");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let currentDir = process.cwd();

  rl.setPrompt(`${C.green}>${C.reset} `);
  rl.prompt();

  rl.on("line", async (input) => {
    const line = input.trim();
    if (!line) { rl.prompt(); return; }

    if (line.startsWith("/")) {
      const parts = line.slice(1).split(" ");
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(" ");

      await executeCommand(cmd, args, currentDir, rl);
      rl.prompt();
      return;
    }

    // Check login for natural chat
    if (!isLoggedIn()) {
      printLine("\nPlease login first! Use /login or /register", "yellow");
      console.log("Or open the dashboard: /login\n");
      rl.prompt();
      return;
    }

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
    // Auth
    case "help": showHelp(); break;
    case "exit": case "quit": 
      printLine("\nGoodbye! 👋", "cyan"); 
      process.exit(0);
    case "clear": showBanner(); break;
    
    case "whoami":
      const user = getCurrentUser();
      if (user) {
        printLine(`\nLogged in as: ${user.name}`, "cyan");
        printLine(`Email: ${user.email}`, "dim");
        printLine(`Since: ${user.loginAt}`, "dim");
      } else {
        printLine("\nNot logged in. Use /login or /register", "yellow");
      }
      console.log("");
      break;
    
    case "login":
      const loginPath = path.join(__dirname, "webui", "login.html");
      if (fs.existsSync(loginPath)) {
        exec(`start "" "${loginPath}"`);
        printLine("\nOpening login page in browser...", "cyan");
        printLine("Or login here: /login <email> <password>", "dim");
      }
      break;
    
    case "logout":
      logoutUser();
      printLine("\nLogged out successfully!", "green");
      break;
    
    case "register":
      if (!args) {
        printLine("\nUsage: /register <email> <password> [name]", "yellow");
        printLine("Example: /register john@example.com secret123 John", "dim");
        break;
      }
      const regParts = args.split(" ");
      if (regParts.length < 2) {
        printLine("Need email and password: /register <email> <password>", "yellow");
        break;
      }
      const result = createUser(regParts[0], regParts[1], regParts[2]);
      if (result.success) {
        printLine("\nAccount created! Now login: /login " + regParts[0] + " " + regParts[1], "green");
      } else {
        printLine("\nError: " + result.error, "red");
      }
      break;
    
    case "profile":
      const currentUser = getCurrentUser();
      if (currentUser) {
        printLine("\nProfile:", "cyan");
        printLine(`  Name: ${currentUser.name}`, "green");
        printLine(`  Email: ${currentUser.email}`, "green");
        printLine(`  Logged in: ${currentUser.loginAt}`, "dim");
      } else {
        printLine("\nNot logged in. Use /login", "yellow");
      }
      console.log("");
      break;

    // Check auth for other commands
    case "generate": case "app": case "api": case "react": case "python": case "go": case "node":
    case "explain": case "fix": case "optimize": case "review": case "test": case "debug": 
    case "suggest": case "architect":
      if (!isLoggedIn()) {
        printLine("\nPlease login first! Use /login or /register", "yellow");
        return;
      }
      break;

    // Code Generation
    case "generate":
      if (!args) { printLine("Usage: /generate <description>", "yellow"); return; }
      respond(generateCode(args, "js"));
      break;
    case "app":
      const appName = args || "my-app";
      const appDir = path.join(currentDir, appName);
      if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(path.join(appDir, "index.html"), generateCode(appName, "html"));
      fs.writeFileSync(path.join(appDir, "style.css"), generateCode(appName, "css"));
      fs.writeFileSync(path.join(appDir, "script.js"), generateCode(appName, "js"));
      respond("Created: " + appDir);
      break;
    case "api":
      const apiName = args || "my-api";
      const apiDir = path.join(currentDir, apiName);
      if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
      fs.writeFileSync(path.join(apiDir, "server.js"), generateCode(apiName, "node"));
      fs.writeFileSync(path.join(apiDir, "package.json"), JSON.stringify({ name: apiName, version: "1.0.0", main: "server.js" }, null, 2));
      respond("Created: " + apiDir);
      break;
    case "react":
      const reactName = args || "my-react";
      const reactDir = path.join(currentDir, reactName);
      if (!fs.existsSync(reactDir)) fs.mkdirSync(reactDir, { recursive: true });
      fs.writeFileSync(path.join(reactDir, "App.jsx"), generateCode(reactName, "react"));
      fs.writeFileSync(path.join(reactDir, "App.css"), generateCode(reactName, "css"));
      respond("Created: " + reactDir);
      break;
    case "python":
      const pyName = args ? (args.endsWith(".py") ? args : args + ".py") : "script.py";
      fs.writeFileSync(path.join(currentDir, pyName), generateCode(pyName, "python"));
      respond("Created: " + pyName);
      break;
    case "go":
      const goName = args ? (args.endsWith(".go") ? args : args + ".go") : "main.go";
      fs.writeFileSync(path.join(currentDir, goName), generateCode(goName, "go"));
      respond("Created: " + goName);
      break;
    case "node":
      const nodeName = args || "my-node";
      const nodeDir = path.join(currentDir, nodeName);
      if (!fs.existsSync(nodeDir)) fs.mkdirSync(nodeDir, { recursive: true });
      fs.writeFileSync(path.join(nodeDir, "index.js"), generateCode(nodeName, "js"));
      fs.writeFileSync(path.join(nodeDir, "package.json"), JSON.stringify({ name: nodeName, version: "1.0.0" }, null, 2));
      respond("Created: " + nodeDir);
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
    case "suggest": respond(chat("Suggest")); break;
    case "architect":
      if (!args) { printLine("Usage: /architect <project>", "yellow"); return; }
      respond(chat("Architecture: " + args));
      break;

    // Files
    case "ls":
      const dir = args ? path.resolve(currentDir, args) : currentDir;
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
          printLine(`  ${item.isDirectory() ? "📁" : "📄"} ${item.name}`, item.isDirectory() ? "yellow" : "dim");
        });
      } else printLine("Not found", "red");
      break;
    case "cat":
      if (!args) { printLine("Usage: /cat <filepath>", "yellow"); return; }
      const fpath = path.resolve(currentDir, args);
      if (fs.existsSync(fpath)) console.log(fs.readFileSync(fpath, "utf8"));
      else printLine("Not found", "red");
      break;
    case "mkdir":
      if (!args) { printLine("Usage: /mkdir <name>", "yellow"); return; }
      const mdir = path.resolve(currentDir, args);
      if (!fs.existsSync(mdir)) { fs.mkdirSync(mdir, { recursive: true }); respond("Created: " + mdir); }
      else printLine("Exists", "yellow");
      break;
    case "touch":
      if (!args) { printLine("Usage: /touch <filename>", "yellow"); return; }
      fs.writeFileSync(path.resolve(currentDir, args), "");
      respond("Created: " + args);
      break;
    case "rm":
      if (!args) { printLine("Usage: /rm <path>", "yellow"); return; }
      const rmp = path.resolve(currentDir, args);
      if (fs.existsSync(rmp)) {
        fs.statSync(rmp).isDirectory() ? fs.rmdirSync(rmp, { recursive: true }) : fs.unlinkSync(rmp);
        respond("Deleted: " + rmp);
      } else printLine("Not found", "red");
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
      found.slice(0, 15).forEach(f => printLine("  " + f, "cyan"));
      break;
    case "grep":
      if (!args) { printLine("Usage: /grep <pattern>", "yellow"); return; }
      const pattern = args;
      const results = [];
      function searchFile(f) {
        try {
          fs.readFileSync(f, "utf8").split("\n").forEach((l, i) => {
            if (l.includes(pattern)) results.push(f + ":" + (i+1) + ": " + l.substring(0, 60));
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
      results.slice(0, 20).forEach(r => printLine("  " + r, "cyan"));
      break;

    // System
    case "run":
      if (!args) { printLine("Usage: /run <command>", "yellow"); return; }
      exec(args, { cwd: currentDir }, (e, out) => { if (out) console.log(out); if (e) printLine(e.message, "red"); });
      break;
    case "open":
      if (!args) { printLine("Usage: /open <path>", "yellow"); return; }
      const op = path.resolve(currentDir, args);
      if (fs.existsSync(op)) { exec(`start "" "${op}"`); respond("Opened: " + op); }
      else printLine("Not found", "red");
      break;
    case "explorer":
      exec(`explorer "${args ? path.resolve(currentDir, args) : currentDir}"`);
      respond("Opened");
      break;
    case "ip":
      require("os").networkInterfaces().forEach(n => n.forEach(i => { if (i.family === "IPv4") printLine("  " + i.address, "green"); }));
      break;
    case "ps":
      exec("tasklist", (e, out) => { if (out) out.split("\n").slice(0, 12).forEach(l => printLine(l.substring(0, 70), "dim")); });
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
        respond("Changed to: " + currentDir);
      } else printLine("Not found", "red");
      break;

    // Git & Project
    case "git":
      exec("git " + args, { cwd: currentDir }, (e, out) => { if (out) console.log(out); });
      break;
    case "init":
      const iname = args || "my-project";
      const idir = path.join(currentDir, iname);
      if (!fs.existsSync(idir)) fs.mkdirSync(idir, { recursive: true });
      fs.writeFileSync(path.join(idir, "README.md"), "# " + iname + "\n\nCreated with Open Friday");
      respond("Created: " + idir);
      break;
    case "install":
      exec(args ? "npm install " + args : "npm install", { cwd: currentDir }, (e, out) => { if (out) console.log(out); if (!e) respond("Installed"); });
      break;

    // Utils
    case "time": respond(new Date().toLocaleString()); break;
    case "hash":
      const crypto = require("crypto");
      respond(crypto.createHash("md5").update(args || "").digest("hex"));
      break;

    default:
      const similar = Object.keys(COMMANDS).filter(c => c.startsWith(cmd.slice(0, 3)));
      if (similar.length > 0) {
        printLine("Did you mean:", "yellow");
        similar.forEach(s => printLine("  /" + s, "cyan"));
      } else {
        printLine("Unknown: /" + cmd + ". Type /help.", "red");
      }
  }
}

start();