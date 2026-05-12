#!/usr/bin/env node
"use strict";
// Open Friday v2.0 - Advanced AI Assistant with Personality
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { IDENTITY, chat, generateCode } = require("./builtin");

// Claude-like beautiful colors
const C = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

function print(msg, color = "reset") {
  console.log(`${C[color]}${msg}${C.reset}`);
}

function box(title, subtitle = "") {
  const width = Math.max(title.length, subtitle.length) + 6;
  console.log("");
  if (subtitle) {
    print("╭" + "─".repeat(width - 2) + "╮", "cyan");
    print(`│ ${C.bold}${title.substring(0, width-3).padEnd(width-4)}${C.reset} │`, "cyan");
    print(`│ ${subtitle.substring(0, width-3).padEnd(width-4)}${C.reset} │`, "cyan");
    print("╰" + "─".repeat(width - 2) + "╯", "cyan");
  } else {
    print("╭" + "─".repeat(width - 2) + "╮", "cyan");
    print(`│ ${C.bold}${title.substring(0, width-3).padEnd(width-4)}${C.reset} │`, "cyan");
    print("╰" + "─".repeat(width - 2) + "╯", "cyan");
  }
  console.log("");
}

function smallIcon() {
  print(IDENTITY.icon, "cyan");
}

async function typeOut(text, speed = 5) {
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(text[i]);
    await new Promise(r => setTimeout(r, speed));
  }
}

const HELP = `
${C.cyan}╭────────────────────────────────────────────────────╮
│ ${C.bold}🤖 OPEN FRIDAY v2.0 - Commands${C.reset}${C.cyan}                      │
╰────────────────────────────────────────────────────╯${C.reset}

${C.yellow}PERSONALITY:${C.reset}
  /whoami       - Learn about Open Friday
  /personality - See my traits
  /funfact     - Random fun fact

${C.yellow}CODE GENERATION:${C.reset}
  /generate   - Generate code from description
  /app        - Create web app
  /api        - Create REST API
  /react      - Create React app
  /python     - Create Python script
  /go         - Create Go program

${C.yellow}SMART FEATURES:${C.reset}
  /explain    - Explain any code
  /fix        - Fix bugs
  /optimize   - Optimize performance
  /review     - Code review
  /test       - Generate tests
  /suggest    - Proactive suggestions
  /architect  - Design architecture
  /debug      - Help debug issues
  /docs       - Generate documentation

${C.yellow}FILE OPERATIONS:${C.reset}
  /ls, /cat, /mkdir, /touch, /rm, /edit
  
${C.yellow}SYSTEM:${C.reset}
  /run, /open, /explorer, /ip, /ps, /kill

${C.yellow}UTILITY:${C.reset}
  /clear, /help, /exit`;

async function start() {
  console.clear();
  
  // Show the icon
  smallIcon();
  
  box(IDENTITY.name + " " + IDENTITY.version, IDENTITY.tagline);
  print("Type naturally or use /commands\n", "gray");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt(`${C.green}You >${C.reset} `);
  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();
    if (!input) { rl.prompt(); return; }

    if (input.startsWith("/")) {
      const parts = input.split(" ");
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(" ");

      switch (cmd) {
        // ═══════════════════════ PERSONALITY COMMANDS
        case "/whoami":
        case "/about":
          print("🤖 " + IDENTITY.name, "cyan");
          print(IDENTITY.tagline, "dim");
          console.log("");
          IDENTITY.personality.traits.forEach(t => print("  " + t, "green"));
          break;
          
        case "/personality":
          print("My Traits:", "cyan");
          IDENTITY.personality.traits.forEach(t => print("  " + t, "green"));
          print("\nMy Specialties:", "cyan");
          IDENTITY.personality.specialties.forEach(s => print("  " + s, "gray"));
          break;
          
        case "/funfact":
          const fact = IDENTITY.funFacts[Math.floor(Math.random() * IDENTITY.funFacts.length)];
          print("Fun Fact: " + fact, "cyan");
          break;
          
        // ═══════════════════════ HELP & UTILITY  
        case "/help":
          console.log(HELP);
          break;
        case "/clear":
          console.clear();
          smallIcon();
          box(IDENTITY.name + " " + IDENTITY.version, IDENTITY.tagline);
          break;
        case "/exit":
        case "/quit":
          print("Goodbye! Happy coding! 🚀", "cyan");
          rl.close();
          process.exit(0);
          
        // ═══════════════════════ CODE GENERATION
        case "/generate":
          if (!args) { print("Usage: /generate <description>", "yellow"); break; }
          print("Generating...", "yellow");
          const code = generateCode(args, "js");
          console.log("");
          await typeOut(C.cyan + code + C.reset + "\n");
          break;
        case "/app":
          const appName = args || "my-app";
          const appDir = path.join(process.cwd(), appName);
          print(`Creating app: ${appName}...`, "yellow");
          if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });
          fs.writeFileSync(path.join(appDir, "index.html"), generateCode(appName, "html"));
          fs.writeFileSync(path.join(appDir, "style.css"), generateCode(appName, "css"));
          fs.writeFileSync(path.join(appDir, "script.js"), generateCode(appName, "js"));
          print("✓ App created: " + appDir, "green");
          exec(`start "" "${appDir}"`);
          break;
        case "/api":
          const apiName = args || "my-api";
          const apiDir = path.join(process.cwd(), apiName);
          print("Creating API: " + apiName + "...", "yellow");
          if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
          fs.writeFileSync(path.join(apiDir, "server.js"), generateCode(apiName, "python"));
          fs.writeFileSync(path.join(apiDir, "package.json"), JSON.stringify({
            name: apiName, version: "1.0.0", main: "server.js",
            scripts: { start: "python server.py" }
          }, null, 2));
          print("✓ API created: " + apiDir, "green");
          break;
        case "/react":
          const reactName = args || "my-react";
          const reactDir = path.join(process.cwd(), reactName);
          print("Creating React app: " + reactName + "...", "yellow");
          if (!fs.existsSync(reactDir)) fs.mkdirSync(reactDir, { recursive: true });
          fs.writeFileSync(path.join(reactDir, "App.js"), generateCode(reactName, "react"));
          fs.writeFileSync(path.join(reactDir, "App.css"), generateCode(reactName, "css"));
          print("✓ React app created: " + reactDir, "green");
          break;
        case "/python":
          const pyName = (args || "script.py").replace(/\.py$/, "") + ".py";
          const pyPath = path.resolve(pyName);
          print("Creating Python: " + pyName + "...", "yellow");
          fs.writeFileSync(pyPath, generateCode(pyName, "python"));
          print("✓ Created: " + pyPath, "green");
          break;
        case "/go":
          const goName = (args || "main.go").replace(/\.go$/, "") + ".go";
          const goPath = path.resolve(goName);
          print("Creating Go: " + goName + "...", "yellow");
          fs.writeFileSync(goPath, generateCode(goName, "python"));
          print("✓ Created: " + goPath, "green");
          break;
          
        // ═══════════════════════ SMART FEATURES
        case "/explain":
          if (!args) { print("Usage: /explain <code or description>", "yellow"); break; }
          print("Explaining...", "yellow");
          const explanation = chat("Explain: " + args);
          console.log("");
          await typeOut(C.cyan + explanation + C.reset + "\n");
          break;
        case "/fix":
          if (!args) { print("Usage: /fix <file or description>", "yellow"); break; }
          print("Analyzing for bugs...", "yellow");
          const fix = chat("Fix bugs: " + args);
          console.log("");
          await typeOut(C.cyan + fix + C.reset + "\n");
          break;
        case "/optimize":
          if (!args) { print("Usage: /optimize <file or description>", "yellow"); break; }
          print("Optimizing...", "yellow");
          const optimized = chat("Optimize: " + args);
          console.log("");
          await typeOut(C.cyan + optimized + C.reset + "\n");
          break;
        case "/review":
          if (!args) { print("Usage: /review <file or description>", "yellow"); break; }
          print("Reviewing code...", "yellow");
          const review = chat("Code review: " + args);
          console.log("");
          await typeOut(C.cyan + review + C.reset + "\n");
          break;
        case "/test":
          if (!args) { print("Usage: /test <file or description>", "yellow"); break; }
          print("Generating tests...", "yellow");
          const tests = chat("Generate tests: " + args);
          console.log("");
          await typeOut(C.cyan + tests + C.reset + "\n");
          break;
        case "/suggest":
          print("Analyzing...", "yellow");
          const suggestions = chat("Give me proactive development suggestions");
          console.log("");
          await typeOut(C.cyan + suggestions + C.reset + "\n");
          break;
        case "/architect":
          if (!args) { print("Usage: /architect <project description>", "yellow"); break; }
          print("Designing architecture...", "yellow");
          const architecture = chat("Design architecture for: " + args);
          console.log("");
          await typeOut(C.cyan + architecture + C.reset + "\n");
          break;
        case "/debug":
          if (!args) { print("Usage: /debug <issue description>", "yellow"); break; }
          print("Debugging...", "yellow");
          const debugHelp = chat("Help debug: " + args);
          console.log("");
          await typeOut(C.cyan + debugHelp + C.reset + "\n");
          break;
        case "/docs":
          if (!args) { print("Usage: /docs <topic>", "yellow"); break; }
          print("Generating docs...", "yellow");
          const docs = chat("Documentation for: " + args);
          console.log("");
          await typeOut(C.cyan + docs + C.reset + "\n");
          break;
          
        // ═══════════════════════ FILE OPERATIONS
        case "/ls":
          const dir = args ? path.resolve(args) : process.cwd();
          print("Contents: " + dir, "cyan");
          fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
            print("  " + (item.isDirectory() ? "📁" : "📄") + " " + item.name, item.isDirectory() ? "yellow" : "gray");
          });
          break;
        case "/cat":
          const filePath = path.resolve(args);
          if (fs.existsSync(filePath)) {
            print("File: " + filePath, "cyan");
            console.log("-".repeat(50));
            console.log(fs.readFileSync(filePath, "utf8"));
          } else {
            print("Not found: " + filePath, "red");
          }
          break;
        case "/mkdir":
          const mDir = path.resolve(args);
          if (!fs.existsSync(mDir)) { fs.mkdirSync(mDir, { recursive: true }); print("✓ Created: " + mDir, "green"); }
          else { print("Exists: " + mDir, "yellow"); }
          break;
        case "/touch":
          const fPath = path.resolve(args);
          const fDir = path.dirname(fPath);
          if (!fs.existsSync(fDir)) fs.mkdirSync(fDir, { recursive: true });
          fs.writeFileSync(fPath, "", "utf8");
          print("✓ Created: " + fPath, "green");
          break;
        case "/rm":
          const target = path.resolve(args);
          if (fs.existsSync(target)) {
            print("Delete? (y/n) ", "yellow");
            if ((await new Promise(r => rl.question("", r))).toLowerCase() === "y") {
              const stat = fs.statSync(target);
              stat.isDirectory() ? fs.rmdirSync(target, { recursive: true }) : fs.unlinkSync(target);
              print("✓ Deleted: " + target, "green");
            }
          } else { print("Not found", "red"); }
          break;
          
        // ═══════════════════════ SYSTEM
        case "/run":
          if (!args) { print("Usage: /run <command>", "yellow"); break; }
          print("Running: " + args, "yellow");
          exec(args, (e, out, err) => { if (out) console.log(out); if (err) print(err, "red"); });
          break;
        case "/open":
          const openPath = path.resolve(args);
          if (fs.existsSync(openPath)) {
            exec(`start "" "${openPath}"`);
            print("✓ Opened: " + openPath, "green");
          } else { print("Not found", "red"); }
          break;
        case "/explorer": exec("explorer ."); print("✓ Opened", "green"); break;
        case "/ip":
          require("os").networkInterfaces().forEach(n => n.forEach(i => { if (i.family === "IPv4") print("  " + i.address, "green"); }));
          break;
        case "/ps": exec("tasklist", (e, out) => { if (out) out.split("\n").slice(0, 10).forEach(l => print(l.substring(0, 70), "gray")); }); break;
        case "/kill":
          if (args) { exec(`taskkill /PID ${args} /F`, e => e ? print("Failed", "red") : print("✓ Killed " + args, "green")); }
          else { print("Usage: /kill <PID>", "yellow"); }
          break;
        case "/edit":
          const editPath = path.resolve(args);
          if (fs.existsSync(editPath)) {
            print("Current:", "cyan"); console.log(fs.readFileSync(editPath, "utf8"));
            print("New (END):", "yellow");
            const lines = [], line = await new Promise(r => rl.question("", r));
            while (line.trim() !== "END") { lines.push(line); }
            fs.writeFileSync(editPath, lines.join("\n"), "utf8");
            print("✓ Saved", "green");
          } else { print("Not found", "red"); }
          break;
          
        default:
          print("Unknown: " + cmd, "red");
          print("Type /help for commands", "gray");
      }
    } else {
      // Natural conversation
      const response = chat(input);
      console.log("");
      await typeOut(C.cyan + response + C.reset + "\n");
    }
    
    rl.prompt();
  });
}

module.exports = { start };