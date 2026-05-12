#!/usr/bin/env node
"use strict";
// Open Friday v2.0 – Login-First CLI

const readline = require("readline");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { exec, spawn } = require("child_process");
const { IDENTITY, chat, generateCode } = require("./core/builtin");
const auth = require("./core/auth");

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════
const PORT = 3456;
const SESSION_PATH = path.join(__dirname, "core", "session.json");

const C = { reset: "\x1b[0m", dim: "\x1b[2m", bold: "\x1b[1m", cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", magenta: "\x1b[35m" };

function print(msg, c = "reset") { process.stdout.write(`${C[c]}${msg}${C.reset}`); }
function printLine(msg, c = "reset") { console.log(`${C[c]}${msg}${C.reset}`); }

// ═══════════════════════════════════════════════
// BANNER
// ═══════════════════════════════════════════════
function showBanner() {
  console.clear();
  printLine(IDENTITY.icon, "cyan");
  printLine(` ${IDENTITY.name} ${IDENTITY.version}`, "cyan");
  printLine(` ${IDENTITY.tagline}`, "dim");
  console.log("");
}

function showLoginPrompt() {
  printLine("╔══════════════════════════════════════════════╗", "cyan");
  printLine("║        🔐 LOGIN REQUIRED                     ║", "cyan");
  printLine("╠══════════════════════════════════════════════╣", "cyan");
  printLine("║  Open Friday requires authentication.         ║", "cyan");
  printLine("║  Sign up or log in to continue.               ║", "cyan");
  printLine("╠══════════════════════════════════════════════╣", "cyan");
  printLine("║                                              ║", "cyan");
  printLine("║  📎 Opening browser...                       ║", "cyan");
  printLine("║  If browser doesn't open, visit:              ║", "cyan");
  printLine(`║  ${C.green}http://localhost:${PORT}${C.cyan}               ║`, "cyan");
  printLine("║                                              ║", "cyan");
  printLine("╚══════════════════════════════════════════════╝", "cyan");
  console.log("");
}

// ═══════════════════════════════════════════════
// LOCAL HTTP SERVER (serves login & handles callback)
// ═══════════════════════════════════════════════
function startLoginServer() {
  const WEBUI = path.join(__dirname, "webui");

  // Helper to read file with proper content type
  function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  }

  const server = http.createServer((req, res) => {
    const url = req.url;

    // ── Auth callback endpoint ──
    if (url.startsWith("/auth-callback")) {
      const parsed = new URL(url, `http://localhost:${PORT}`);
      const name = parsed.searchParams.get("name") || "User";
      const email = parsed.searchParams.get("email") || "user@localhost";

      // Save session
      const session = {
        userId: Date.now(),
        email: email,
        name: name,
        loginAt: new Date().toISOString()
      };
      fs.writeFileSync(SESSION_PATH, JSON.stringify(session, null, 2));

      // Return success page
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<!DOCTYPE html>
<html><body style="background:#08080e;color:#00d4aa;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;">
<div><h1>✓ Authenticated!</h1><p style="color:#8888aa;">Welcome ${name}. You can close this tab and return to the terminal.</p>
<script>localStorage.setItem('openfriday_logged_in','true');localStorage.setItem('openfriday_user',JSON.stringify({name:"${name}",email:"${email}"}));
setTimeout(()=>window.close(),1000);</script></div></body></html>`);
      return;
    }

    // ── Serve login page ──
    if (url === "/" || url === "/login.html" || url === "/index.html") {
      const loginFile = path.join(WEBUI, "login.html");
      if (fs.existsSync(loginFile)) {
        let html = fs.readFileSync(loginFile, "utf8");
        // Inject the callback URL into the page
        const callbackScript = `<script>
// After login, redirect back to CLI
const origHandleLogin = handleLogin;
handleLogin = function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const name = email.split('@')[0];
  localStorage.setItem('openfriday_logged_in','true');
  localStorage.setItem('openfriday_user',JSON.stringify({name,email}));
  window.location.href = '/auth-callback?name='+encodeURIComponent(name)+'&email='+encodeURIComponent(email);
};

const origHandleRegister = handleRegister;
handleRegister = function(e) {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  localStorage.setItem('openfriday_logged_in','true');
  localStorage.setItem('openfriday_user',JSON.stringify({name,email}));
  window.location.href = '/auth-callback?name='+encodeURIComponent(name)+'&email='+encodeURIComponent(email);
};
</script>`;
        html = html.replace("</body>", callbackScript + "\n</body>");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
        return;
      }
    }

    // ── Serve static files (CSS, JS) ──
    const extMap = {
      ".css": "text/css",
      ".js": "application/javascript",
      ".html": "text/html",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".json": "application/json"
    };
    const ext = path.extname(url);
    if (extMap[ext]) {
      const filePath = path.join(WEBUI, url.replace(/^\//, ""));
      if (fs.existsSync(filePath)) {
        serveFile(res, filePath, extMap[ext]);
        return;
      }
    }

    // ── 404 ──
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      resolve(server);
    });
  });
}

// ═══════════════════════════════════════════════
// WAIT FOR LOGIN (poll session.json)
// ═══════════════════════════════════════════════
function waitForLogin() {
  return new Promise((resolve) => {
    const spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let i = 0;
    const interval = setInterval(() => {
      process.stdout.write(`\r${C.yellow}${spinner[i % 10]}${C.reset} Waiting for login...`);
      i++;
    }, 100);

    const poll = setInterval(() => {
      const user = auth.getCurrentUser();
      if (user) {
        clearInterval(interval);
        clearInterval(poll);
        process.stdout.write("\r" + " ".repeat(40) + "\r");
        resolve(user);
      }
    }, 500);

    // Safety: also check if session file appears directly
    const pollFile = setInterval(() => {
      try {
        if (fs.existsSync(SESSION_PATH)) {
          const data = JSON.parse(fs.readFileSync(SESSION_PATH, "utf8"));
          if (data.email) {
            clearInterval(interval);
            clearInterval(poll);
            clearInterval(pollFile);
            process.stdout.write("\r" + " ".repeat(40) + "\r");
            resolve(data);
          }
        }
      } catch (e) {}
    }, 500);
  });
}

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════
async function main() {
  showBanner();

  // Check if already logged in
  let user = auth.getCurrentUser();

  if (!user) {
    // Start local server & prompt login
    showLoginPrompt();

    let server;
    try {
      server = await startLoginServer();
      // Open browser
      const url = `http://localhost:${PORT}`;
      exec(`start "" "${url}"`);
    } catch (e) {
      // If server fails, just show URL manually
      printLine("Could not open browser automatically.", "yellow");
      printLine(`Please visit: ${C.green}http://localhost:${PORT}${C.reset}`, "yellow");
    }

    printLine("⏳ Waiting for you to log in...\n", "dim");

    // Wait for user to log in
    user = await waitForLogin();

    // Close server
    if (server) server.close();

    console.log("");
    printLine(`✓ Welcome, ${user.name}!`, "green");
    printLine("Type /help to see all commands.\n", "dim");
  } else {
    printLine(`✓ Logged in as ${user.name} (${user.email})`, "green");
    printLine("Type /help for commands or just chat.\n", "dim");
  }

  // ═══════════════════════════════════════════════
  // INTERACTIVE SESSION
  // ═══════════════════════════════════════════════
  const COMMANDS = {
    help: "Show all commands", exit: "Exit Open Friday", clear: "Clear terminal",
    whoami: "About Open Friday", login: "Open login page", logout: "Logout", profile: "Show profile",
    generate: "Generate code", app: "Create web app", api: "Create REST API",
    react: "Create React app", python: "Create Python script", go: "Create Go program", node: "Create Node project",
    explain: "Explain code", fix: "Fix bugs", optimize: "Optimize code",
    review: "Review code", test: "Generate tests", debug: "Debug issue",
    suggest: "Get suggestions", architect: "Design architecture",
    ls: "List files", cat: "Read file", mkdir: "Create folder", touch: "Create file",
    rm: "Delete file", find: "Find files", grep: "Search files",
    run: "Run command", open: "Open file", explorer: "Open explorer",
    ip: "Show IP", ps: "List processes", pwd: "Current directory", cd: "Change directory",
    git: "Git commands", init: "Initialize project", install: "Install npm",
    time: "Show time", hash: "Hash text"
  };

  function showHelp() {
    console.log("");
    const cats = {
      "Auth": ["login", "logout", "profile"],
      "Code": ["generate", "app", "api", "react", "python", "go", "node"],
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
      await execCmd(cmd, args, currentDir, rl);
    } else {
      // Natural chat
      console.log("");
      const response = chat(line);
      for (let i = 0; i < response.length; i++) {
        process.stdout.write(response[i]);
        await new Promise(r => setTimeout(r, 5));
      }
      console.log("\n");
    }
    rl.prompt();
  });

  // Execute a slash command
  async function execCmd(cmd, args, curDir, rl) {
    const respond = (t) => { console.log(""); printLine(t, "cyan"); console.log(""); };

    switch (cmd) {
      case "help": showHelp(); break;
      case "exit": case "quit": printLine("\nGoodbye! 👋", "cyan"); process.exit(0);
      case "clear": showBanner(); break;
      case "whoami":
        const u = auth.getCurrentUser();
        if (u) { printLine(`\nName: ${u.name}`, "cyan"); printLine(`Email: ${u.email}`, "dim"); printLine(`Login: ${u.loginAt}`, "dim"); }
        else printLine("Not logged in", "yellow");
        console.log(""); break;

      case "login":
        const loginUrl = `http://localhost:${PORT}`;
        try {
          const srv = await startLoginServer();
          exec(`start "" "${loginUrl}"`);
          printLine("Opening login page...", "cyan");
          const newUser = await waitForLogin();
          srv.close();
          respond(`Welcome, ${newUser.name}!`);
        } catch (e) {
          printLine(`Visit: ${loginUrl}`, "yellow");
        }
        break;

      case "logout":
        auth.logoutUser();
        printLine("\nLogged out. Run openfriday to login again.", "green");
        rl.close();
        process.exit(0);

      case "profile":
        const p = auth.getCurrentUser();
        if (p) { respond(`Name: ${p.name}\nEmail: ${p.email}`); }
        else { printLine("Not logged in", "yellow"); }
        break;

      // Code generation
      case "generate":
        if (!args) { printLine("Usage: /generate <desc>", "yellow"); return; }
        respond(generateCode(args, "js")); break;
      case "app":
        const an = args || "my-app"; const ad = path.join(curDir, an);
        if (!fs.existsSync(ad)) fs.mkdirSync(ad, { recursive: true });
        fs.writeFileSync(path.join(ad, "index.html"), generateCode(an, "html"));
        fs.writeFileSync(path.join(ad, "style.css"), generateCode(an, "css"));
        fs.writeFileSync(path.join(ad, "script.js"), generateCode(an, "js"));
        respond("Created: " + ad); break;
      case "api":
        const apin = args || "my-api"; const apid = path.join(curDir, apin);
        if (!fs.existsSync(apid)) fs.mkdirSync(apid, { recursive: true });
        fs.writeFileSync(path.join(apid, "server.js"), generateCode(apin, "node"));
        respond("Created: " + apid); break;
      case "react":
        const rn = args || "my-react"; const rd = path.join(curDir, rn);
        if (!fs.existsSync(rd)) fs.mkdirSync(rd, { recursive: true });
        fs.writeFileSync(path.join(rd, "App.jsx"), generateCode(rn, "react"));
        respond("Created: " + rd); break;
      case "python":
        const pyn = args ? (args.endsWith(".py") ? args : args + ".py") : "script.py";
        fs.writeFileSync(path.join(curDir, pyn), generateCode(pyn, "python"));
        respond("Created: " + pyn); break;
      case "go":
        const gn = args ? (args.endsWith(".go") ? args : args + ".go") : "main.go";
        fs.writeFileSync(path.join(curDir, gn), generateCode(gn, "go"));
        respond("Created: " + gn); break;
      case "node":
        const nn = args || "my-node"; const nd = path.join(curDir, nn);
        if (!fs.existsSync(nd)) fs.mkdirSync(nd, { recursive: true });
        fs.writeFileSync(path.join(nd, "index.js"), generateCode(nn, "js"));
        respond("Created: " + nd); break;

      // Smart
      case "explain": if (!args) { printLine("Usage: /explain <code>", "yellow"); return; } respond(chat("Explain: " + args)); break;
      case "fix": if (!args) { printLine("Usage: /fix <code>", "yellow"); return; } respond(chat("Fix: " + args)); break;
      case "optimize": if (!args) { printLine("Usage: /optimize <code>", "yellow"); return; } respond(chat("Optimize: " + args)); break;
      case "review": if (!args) { printLine("Usage: /review <code>", "yellow"); return; } respond(chat("Review: " + args)); break;
      case "test": if (!args) { printLine("Usage: /test <code>", "yellow"); return; } respond(chat("Test: " + args)); break;
      case "debug": if (!args) { printLine("Usage: /debug <issue>", "yellow"); return; } respond(chat("Debug: " + args)); break;
      case "suggest": respond(chat("Suggest")); break;
      case "architect": if (!args) { printLine("Usage: /architect <project>", "yellow"); return; } respond(chat("Architecture: " + args)); break;

      // Files
      case "ls":
        const d = args ? path.resolve(curDir, args) : curDir;
        if (fs.existsSync(d)) fs.readdirSync(d, { withFileTypes: true }).forEach(i => printLine(`  ${i.isDirectory() ? "📁" : "📄"} ${i.name}`, i.isDirectory() ? "yellow" : "dim"));
        else printLine("Not found", "red");
        break;
      case "cat":
        if (!args) { printLine("Usage: /cat <file>", "yellow"); return; }
        const fp = path.resolve(curDir, args);
        if (fs.existsSync(fp)) console.log(fs.readFileSync(fp, "utf8")); else printLine("Not found", "red");
        break;
      case "mkdir":
        if (!args) { printLine("Usage: /mkdir <name>", "yellow"); return; }
        const md = path.resolve(curDir, args);
        if (!fs.existsSync(md)) { fs.mkdirSync(md, { recursive: true }); respond("Created: " + md); }
        else printLine("Exists", "yellow");
        break;
      case "touch":
        if (!args) { printLine("Usage: /touch <file>", "yellow"); return; }
        fs.writeFileSync(path.resolve(curDir, args), ""); respond("Created: " + args);
        break;
      case "rm":
        if (!args) { printLine("Usage: /rm <path>", "yellow"); return; }
        const rp = path.resolve(curDir, args);
        if (fs.existsSync(rp)) { fs.statSync(rp).isDirectory() ? fs.rmdirSync(rp, { recursive: true }) : fs.unlinkSync(rp); respond("Deleted"); }
        else printLine("Not found", "red");
        break;
      case "find":
        if (!args) { printLine("Usage: /find <pattern>", "yellow"); return; }
        const fl = []; (function s(d, p) { try { fs.readdirSync(d, { withFileTypes: true }).forEach(i => { const f = path.join(d, i.name); if (i.name.includes(p)) fl.push(f); if (i.isDirectory() && !i.name.startsWith(".")) s(f, p); }); } catch (e) {} })(curDir, args);
        fl.slice(0, 15).forEach(f => printLine("  " + f, "cyan"));
        break;

      // System
      case "run": if (!args) { printLine("Usage: /run <cmd>", "yellow"); return; } exec(args, { cwd: curDir }, (e, o) => { if (o) console.log(o); if (e) printLine(e.message, "red"); }); break;
      case "open": if (!args) { printLine("Usage: /open <path>", "yellow"); return; } const op = path.resolve(curDir, args); if (fs.existsSync(op)) { exec(`start "" "${op}"`); respond("Opened"); } else printLine("Not found", "red"); break;
      case "explorer": exec(`explorer "${curDir}"`); respond("Opened"); break;
      case "ip": require("os").networkInterfaces().forEach(n => n.forEach(i => { if (i.family === "IPv4") printLine("  " + i.address, "green"); })); break;
      case "ps": exec("tasklist", (e, o) => { if (o) o.split("\n").slice(0, 12).forEach(l => printLine(l.substring(0, 70), "dim")); }); break;
      case "pwd": printLine(curDir, "cyan"); break;
      case "cd": if (!args) { printLine("Usage: /cd <path>", "yellow"); return; } const nd2 = path.resolve(curDir, args); if (fs.existsSync(nd2)) { curDir = nd2; process.chdir(curDir); respond("Changed to: " + curDir); } else printLine("Not found", "red"); break;

      // Git
      case "git": exec("git " + args, { cwd: curDir }, (e, o) => { if (o) console.log(o); }); break;
      case "init":
        const iname = args || "my-project"; const idir = path.join(curDir, iname);
        if (!fs.existsSync(idir)) fs.mkdirSync(idir, { recursive: true });
        fs.writeFileSync(path.join(idir, "README.md"), "# " + iname);
        respond("Created: " + idir);
        break;
      case "install": exec(args ? "npm install " + args : "npm install", { cwd: curDir }, (e, o) => { if (o) console.log(o); }); break;

      // Utils
      case "time": respond(new Date().toLocaleString()); break;
      case "hash": const crypto = require("crypto"); respond(crypto.createHash("md5").update(args || "").digest("hex")); break;

      default:
        const similar = Object.keys(COMMANDS).filter(c => c.startsWith(cmd.slice(0, 3)));
        if (similar.length > 0) { printLine("Did you mean:", "yellow"); similar.forEach(s => printLine("  /" + s, "cyan")); }
        else printLine("Unknown: /" + cmd + ". Type /help", "red");
    }
  }
}

main();