/**
 * Open Friday — Command Definitions
 * 
 * All slash commands with metadata:
 * - name, description, aliases, args, handler, category, requiresAuth
 * 
 * Easy to extend: just add a new entry to the array.
 */

"use strict";

const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

// ─── Helper: resolve relative to currentDir ───
function resolvePath(curDir, p) {
  return path.resolve(curDir, p || ".");
}

// ─── Helper: respond with formatted text ───
function respond(text) {
  console.log("");
  // No color here — colors applied in the CLI
  console.log(text);
  console.log("");
}

// ─── Command Definitions ───
// Each command has:
//   name, description, category, aliases, args, requiresAuth, handler(ctx, args)
//
// handler receives: ctx (CommandContext with currentDir, rl, auth, fs, path, exec, builtin)
//                   args (string — everything after the command name)

const commands = [
  // ═══════════════════════════════════════════════
  // AUTH & CORE
  // ═══════════════════════════════════════════════
  {
    name: "help",
    description: "Show all commands with descriptions",
    category: "Core",
    aliases: ["h", "?"],
    handler: async (ctx) => {
      // Help is handled specially by the CLI
      return "SHOW_HELP";
    }
  },
  {
    name: "exit",
    description: "Exit Open Friday",
    category: "Core",
    aliases: ["quit", "close", "q"],
    handler: async () => {
      console.log("\nGoodbye! 👋");
      process.exit(0);
    }
  },
  {
    name: "clear",
    description: "Clear the terminal",
    category: "Core",
    aliases: ["cls"],
    handler: async () => {
      console.clear();
      // Re-show banner is handled by CLI
      return "SHOW_BANNER";
    }
  },
  {
    name: "whoami",
    description: "Show your profile information",
    category: "Core",
    aliases: ["me", "user", "profile"],
    handler: async (ctx, args) => {
      const user = ctx.auth.getCurrentUser();
      if (user) {
        respond(`Name: ${user.name}\nEmail: ${user.email}\nLogin: ${user.loginAt || "This session"}`);
      } else {
        respond("Not logged in. Use /login");
      }
    }
  },
  {
    name: "login",
    description: "Open browser to login / sign up",
    category: "Core",
    aliases: ["signin"],
    handler: async (ctx) => {
      try {
        const PORT = 3456;
        const srv = require("../core/auth-server");
        const server = await srv.start(ctx.rl);
        exec(`start "" "http://localhost:${PORT}"`);
        respond("Opening browser for login...");
        // Wait is handled by the caller in CLI
        return "WAIT_LOGIN";
      } catch (e) {
        respond("Could not start login server.");
      }
    }
  },
  {
    name: "logout",
    description: "Sign out of your account",
    category: "Core",
    handler: async (ctx) => {
      ctx.auth.logoutUser();
      console.log("\nLogged out. Run openfriday again to login.\n");
      process.exit(0);
    }
  },
  {
    name: "config",
    description: "Show current API configuration",
    category: "Core",
    aliases: ["settings", "prefs"],
    handler: async (ctx) => {
      respond("Config: Use /login to configure API providers");
    }
  },

  // ═══════════════════════════════════════════════
  // CODE GENERATION
  // ═══════════════════════════════════════════════
  {
    name: "generate",
    description: "Generate code from a description",
    category: "Code Gen",
    aliases: ["gen", "g"],
    args: { required: true, hint: "<description>" },
    handler: async (ctx, args) => {
      if (!args) { respond("Usage: /generate <description>"); return; }
      respond(ctx.builtin.generateCode(args, "js"));
    }
  },
  {
    name: "app",
    description: "Create a web app (HTML/CSS/JS)",
    category: "Code Gen",
    aliases: ["web", "website"],
    args: { hint: "<name>" },
    handler: async (ctx, args) => {
      const name = args || "my-app";
      const dir = resolvePath(ctx.currentDir, name);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), ctx.builtin.generateCode(name, "html"));
      fs.writeFileSync(path.join(dir, "style.css"), ctx.builtin.generateCode(name, "css"));
      fs.writeFileSync(path.join(dir, "script.js"), ctx.builtin.generateCode(name, "js"));
      respond(`✓ Created web app: ${dir}`);
    }
  },
  {
    name: "api",
    description: "Create a REST API server",
    category: "Code Gen",
    aliases: ["rest", "server", "backend"],
    args: { hint: "<name>" },
    handler: async (ctx, args) => {
      const name = args || "my-api";
      const dir = resolvePath(ctx.currentDir, name);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "server.js"), ctx.builtin.generateCode(name, "api"));
      fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name, version: "1.0.0", main: "server.js" }, null, 2));
      respond(`✓ Created API: ${dir}`);
    }
  },
  {
    name: "react",
    description: "Create a React app",
    category: "Code Gen",
    aliases: ["reactapp"],
    args: { hint: "<name>" },
    handler: async (ctx, args) => {
      const name = args || "my-react";
      const dir = resolvePath(ctx.currentDir, name);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "App.jsx"), ctx.builtin.generateCode(name, "react"));
      respond(`✓ Created React app: ${dir}`);
    }
  },
  {
    name: "python",
    description: "Create a Python script",
    category: "Code Gen",
    aliases: ["py", "script"],
    args: { hint: "<filename>" },
    handler: async (ctx, args) => {
      const name = args ? (args.endsWith(".py") ? args : args + ".py") : "script.py";
      fs.writeFileSync(resolvePath(ctx.currentDir, name), ctx.builtin.generateCode(name, "python"));
      respond(`✓ Created: ${name}`);
    }
  },
  {
    name: "go",
    description: "Create a Go program",
    category: "Code Gen",
    aliases: ["golang"],
    args: { hint: "<filename>" },
    handler: async (ctx, args) => {
      const name = args ? (args.endsWith(".go") ? args : args + ".go") : "main.go";
      fs.writeFileSync(resolvePath(ctx.currentDir, name), ctx.builtin.generateCode(name, "go"));
      respond(`✓ Created: ${name}`);
    }
  },
  {
    name: "node",
    description: "Create a Node.js project",
    category: "Code Gen",
    aliases: ["express", "npm"],
    args: { hint: "<name>" },
    handler: async (ctx, args) => {
      const name = args || "my-node";
      const dir = resolvePath(ctx.currentDir, name);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.js"), ctx.builtin.generateCode(name, "js"));
      fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name, version: "1.0.0", main: "index.js" }, null, 2));
      respond(`✓ Created Node project: ${dir}`);
    }
  },

  // ═══════════════════════════════════════════════
  // SMART FEATURES
  // ═══════════════════════════════════════════════
  {
    name: "explain",
    description: "Explain code or a concept",
    category: "Smart",
    aliases: ["what", "why", "helpme"],
    args: { required: true, hint: "<code or topic>" },
    handler: async (ctx, args) => {
      if (!args) { respond("Usage: /explain <code or topic>"); return; }
      respond(ctx.builtin.chat("Explain: " + args));
    }
  },
  {
    name: "fix",
    description: "Fix bugs in code",
    category: "Smart",
    aliases: ["bug", "debug", "repair"],
    args: { required: true, hint: "<code or issue>" },
    handler: async (ctx, args) => {
      if (!args) { respond("Usage: /fix <code or issue>"); return; }
      respond(ctx.builtin.chat("Fix: " + args));
    }
  },
  {
    name: "optimize",
    description: "Optimize code for performance",
    category: "Smart",
    aliases: ["perf", "speed", "fast"],
    args: { required: true, hint: "<code>" },
    handler: async (ctx, args) => {
      if (!args) { respond("Usage: /optimize <code>"); return; }
      respond(ctx.builtin.chat("Optimize: " + args));
    }
  },
  {
    name: "review",
    description: "Review code for issues and best practices",
    category: "Smart",
    aliases: ["audit", "check", "cr"],
    args: { required: true, hint: "<code>" },
    handler: async (ctx, args) => {
      if (!args) { respond("Usage: /review <code>"); return; }
      respond(ctx.builtin.chat("Review: " + args));
    }
  },
  {
    name: "test",
    description: "Generate unit tests for code",
    category: "Smart",
    aliases: ["tests", "spec", "unittest"],
    args: { required: true, hint: "<code>" },
    handler: async (ctx, args) => {
      if (!args) { respond("Usage: /test <code>"); return; }
      respond(ctx.builtin.chat("Test: " + args));
    }
  },
  {
    name: "suggest",
    description: "Get proactive development suggestions",
    category: "Smart",
    aliases: ["tips", "advice", "recommend"],
    handler: async (ctx) => {
      respond(ctx.builtin.chat("Suggest"));
    }
  },
  {
    name: "architect",
    description: "Design system architecture",
    category: "Smart",
    aliases: ["design", "structure", "plan"],
    args: { required: true, hint: "<project>" },
    handler: async (ctx, args) => {
      if (!args) { respond("Usage: /architect <project>"); return; }
      respond(ctx.builtin.chat("Architecture: " + args));
    }
  },

  // ═══════════════════════════════════════════════
  // FILE OPERATIONS
  // ═══════════════════════════════════════════════
  {
    name: "ls",
    description: "List directory contents",
    category: "Files",
    aliases: ["dir", "list"],
    args: { hint: "[path]" },
    handler: async (ctx, args) => {
      const dir = resolvePath(ctx.currentDir, args);
      if (!fs.existsSync(dir)) { console.log("Not found"); return; }
      const items = fs.readdirSync(dir, { withFileTypes: true });
      items.forEach(item => {
        console.log(`  ${item.isDirectory() ? "📁" : "📄"} ${item.name}`);
      });
    }
  },
  {
    name: "cat",
    description: "Read file contents",
    category: "Files",
    aliases: ["read", "view"],
    args: { required: true, hint: "<filepath>" },
    handler: async (ctx, args) => {
      if (!args) { console.log("Usage: /cat <filepath>"); return; }
      const fp = resolvePath(ctx.currentDir, args);
      if (!fs.existsSync(fp)) { console.log("Not found: " + fp); return; }
      
      // Detect binary files by extension
      const binaryExts = ['.png','.jpg','.jpeg','.gif','.bmp','.ico','.pdf','.zip','.exe','.dll','.so','.dylib','.woff','.woff2','.eot','.ttf','.mp3','.mp4','.avi','.mov','.webm','.ogg','.wav'];
      const ext = path.extname(fp).toLowerCase();
      if (binaryExts.includes(ext)) {
        console.log(`Cannot read "${path.basename(fp)}" — binary file. Use a compatible viewer.`);
        return;
      }
      
      // Also check first bytes for binary content
      const fd = fs.openSync(fp, 'r');
      const buf = Buffer.alloc(1024);
      const bytesRead = fs.readSync(fd, buf, 0, 1024, 0);
      fs.closeSync(fd);
      
      // Check for null bytes (indicates binary)
      for (let j = 0; j < bytesRead; j++) {
        if (buf[j] === 0) {
          console.log(`Cannot read "${path.basename(fp)}" — file appears to be binary.`);
          return;
        }
      }
      
      // Safe to read as text
      console.log(fs.readFileSync(fp, "utf8"));
    }
  },
  {
    name: "mkdir",
    description: "Create a directory",
    category: "Files",
    aliases: ["md", "makedir"],
    args: { required: true, hint: "<name>" },
    handler: async (ctx, args) => {
      if (!args) { console.log("Usage: /mkdir <name>"); return; }
      const dir = resolvePath(ctx.currentDir, args);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        respond("✓ Created: " + dir);
      } else {
        console.log("Already exists");
      }
    }
  },
  {
    name: "touch",
    description: "Create an empty file",
    category: "Files",
    aliases: ["create", "new"],
    args: { required: true, hint: "<filename>" },
    handler: async (ctx, args) => {
      if (!args) { console.log("Usage: /touch <filename>"); return; }
      fs.writeFileSync(resolvePath(ctx.currentDir, args), "");
      respond("✓ Created: " + args);
    }
  },
  {
    name: "rm",
    description: "Delete a file or directory",
    category: "Files",
    aliases: ["del", "delete", "remove"],
    args: { required: true, hint: "<path>" },
    handler: async (ctx, args) => {
      if (!args) { console.log("Usage: /rm <path>"); return; }
      const target = resolvePath(ctx.currentDir, args);
      if (fs.existsSync(target)) {
        const stat = fs.statSync(target);
        if (stat.isDirectory()) {
          fs.rmSync(target, { recursive: true, force: true });
        } else {
          fs.unlinkSync(target);
        }
        respond("✓ Deleted");
      } else {
        console.log("Not found");
      }
    }
  },
  {
    name: "find",
    description: "Find files by name pattern",
    category: "Files",
    aliases: ["search", "locate"],
    args: { required: true, hint: "<pattern>" },
    handler: async (ctx, args) => {
      if (!args) { console.log("Usage: /find <pattern>"); return; }
      const results = [];
      function walk(dir) {
        try {
          fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
            const fp = path.join(dir, item.name);
            if (item.name.includes(args)) results.push(fp);
            if (item.isDirectory() && !item.name.startsWith(".")) walk(fp);
          });
        } catch (e) {}
      }
      walk(ctx.currentDir);
      results.slice(0, 20).forEach(r => console.log("  " + r));
    }
  },
  {
    name: "grep",
    description: "Search for text in files",
    category: "Files",
    aliases: ["searchtext", "findstr"],
    args: { required: true, hint: "<pattern>" },
    handler: async (ctx, args) => {
      if (!args) { console.log("Usage: /grep <pattern>"); return; }
      const results = [];
      function walk(dir) {
        try {
          fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
            const fp = path.join(dir, item.name);
            if (item.isDirectory() && !item.name.startsWith(".")) walk(fp);
            else if (item.isFile()) {
              try {
                fs.readFileSync(fp, "utf8").split("\n").forEach((line, i) => {
                  if (line.includes(args)) results.push(`${fp}:${i+1}: ${line.substring(0, 60)}`);
                });
              } catch (e) {}
            }
          });
        } catch (e) {}
      }
      walk(ctx.currentDir);
      results.slice(0, 30).forEach(r => console.log("  " + r));
    }
  },

  // ═══════════════════════════════════════════════
  // SYSTEM
  // ═══════════════════════════════════════════════
  {
    name: "run",
    description: "Execute a shell command",
    category: "System",
    aliases: ["exec", "sh", "terminal"],
    args: { required: true, hint: "<command>" },
    handler: async (ctx, args) => {
      if (!args) { console.log("Usage: /run <command>"); return; }
      exec(args, { cwd: ctx.currentDir }, (err, stdout) => {
        if (stdout) console.log(stdout);
        if (err) console.log(err.message);
      });
    }
  },
  {
    name: "open",
    description: "Open a file or folder in Explorer",
    category: "System",
    aliases: ["reveal", "show"],
    args: { required: true, hint: "<path>" },
    handler: async (ctx, args) => {
      if (!args) { console.log("Usage: /open <path>"); return; }
      const target = resolvePath(ctx.currentDir, args);
      if (fs.existsSync(target)) {
        exec(`start "" "${target}"`);
      } else {
        console.log("Not found");
      }
    }
  },
  {
    name: "explorer",
    description: "Open current directory in File Explorer",
    category: "System",
    aliases: ["explore", "folder"],
    handler: async (ctx) => {
      exec(`explorer "${ctx.currentDir}"`);
    }
  },
  {
    name: "ip",
    description: "Show network IP addresses",
    category: "System",
    handler: async () => {
      require("os").networkInterfaces().forEach(net => {
        net.forEach(addr => {
          if (addr.family === "IPv4") console.log("  " + addr.address);
        });
      });
    }
  },
  {
    name: "ps",
    description: "List running processes",
    category: "System",
    aliases: ["processes", "tasks"],
    handler: async () => {
      exec("tasklist", (err, stdout) => {
        if (stdout) stdout.split("\n").slice(0, 15).forEach(l => console.log(l.substring(0, 70)));
      });
    }
  },
  {
    name: "pwd",
    description: "Print working directory",
    category: "System",
    aliases: ["cwd", "path"],
    handler: async (ctx) => {
      console.log(ctx.currentDir);
    }
  },
  {
    name: "cd",
    description: "Change directory",
    category: "System",
    aliases: ["chdir", "goto"],
    args: { required: true, hint: "<path>" },
    handler: async (ctx, args) => {
      if (!args) { console.log("Usage: /cd <path>"); return; }
      const newDir = resolvePath(ctx.currentDir, args);
      if (fs.existsSync(newDir) && fs.statSync(newDir).isDirectory()) {
        ctx.currentDir = newDir;
        process.chdir(newDir);
        respond("Changed to: " + newDir);
      } else {
        console.log("Not found");
      }
    }
  },

  // ═══════════════════════════════════════════════
  // GIT & PROJECT
  // ═══════════════════════════════════════════════
  {
    name: "git",
    description: "Run git commands",
    category: "Git",
    args: { hint: "<command>" },
    handler: async (ctx, args) => {
      exec("git " + (args || "status"), { cwd: ctx.currentDir }, (err, stdout) => {
        if (stdout) console.log(stdout);
        if (err) console.log(err.message);
      });
    }
  },
  {
    name: "init",
    description: "Initialize a new project",
    category: "Git",
    aliases: ["scaffold", "start"],
    args: { hint: "<name>" },
    handler: async (ctx, args) => {
      const name = args || "my-project";
      const dir = resolvePath(ctx.currentDir, name);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "README.md"), `# ${name}\n\nCreated with Open Friday`);
      respond("✓ Created: " + dir);
    }
  },
  {
    name: "install",
    description: "Install npm dependencies",
    category: "Git",
    aliases: ["npm", "yarn", "i"],
    args: { hint: "[package]" },
    handler: async (ctx, args) => {
      const cmd = args ? `npm install ${args}` : "npm install";
      exec(cmd, { cwd: ctx.currentDir }, (err, stdout) => {
        if (stdout) console.log(stdout);
        if (err) console.log(err.message);
        else console.log("\n✓ Installed");
      });
    }
  },

  // ═══════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════
  {
    name: "time",
    description: "Show current date and time",
    category: "Utils",
    aliases: ["date", "now", "clock"],
    handler: async () => {
      console.log(new Date().toLocaleString());
    }
  },
  {
    name: "hash",
    description: "Generate MD5 hash of text",
    category: "Utils",
    aliases: ["md5", "checksum"],
    args: { hint: "<text>" },
    handler: async (ctx, args) => {
      const crypto = require("crypto");
      console.log(crypto.createHash("md5").update(args || "").digest("hex"));
    }
  }
];

module.exports = commands;