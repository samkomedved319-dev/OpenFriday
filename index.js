#!/usr/bin/env node
"use strict";
/**
 * Open Friday v3.0 — Real AI + Smart CLI
 *  - Real AI via Ollama (local LLM) with rule-based fallback
 *  - Streaming AI responses with typewriter effect
 *  - ESC to interrupt responses mid-type
 *  - Ctrl+P command palette (categorized, filterable)
 *  - Tab to complete command names
 *  - Conversation memory with context
 *  - Polished terminal experience
 */

if (process.argv[2] === "--version" || process.argv[2] === "-v") {
  console.log("v3.0"); process.exit(0);
}

const fs = require("fs");
const http = require("http");
const path = require("path");
const readline = require("readline");
const { exec } = require("child_process");
const { IDENTITY, chat, chatSync, generateCode, interpretCommand, clearHistory, checkOllamaHealth } = require("./core/builtin");
const auth = require("./core/auth");
const authServer = require("./core/auth-server");
const obsidianMemory = require("./core/obsidian-memory");
const { CommandRegistry, CommandContext } = require("./commands/registry");
const commandDefs = require("./commands/index");

const PORT = 3456;
const SESSION_PATH = path.join(__dirname, "core", "session.json");

// ─── Terminal colors & UI ───
const C = { 
  reset: "\x1b[0m", 
  bold: "\x1b[1m", 
  dim: "\x1b[2m", 
  italic: "\x1b[3m", 
  cyan: "\x1b[36m", 
  green: "\x1b[32m", 
  yellow: "\x1b[33m", 
  red: "\x1b[31m", 
  gray: "\x1b[90m", 
  blue: "\x1b[34m", 
  magenta: "\x1b[35m",
  bgBlue: "\x1b[44m",
  bgCyan: "\x1b[46m"
};

const UI = {
  prompt: () => `${C.cyan}${C.bold}OpenFriday${C.reset} ${C.magenta}❯${C.reset} `,
  divider: () => console.log(`${C.gray}${"─".repeat(process.stdout.columns || 50)}${C.reset}`),
  header: (text) => console.log(`\n${C.bold}${C.cyan} ⚡ ${text}${C.reset}\n`),
  error: (text) => console.log(`\n${C.red}${C.bold}  ✗ Error:${C.reset} ${C.red}${text}${C.reset}\n`),
  success: (text) => console.log(`\n${C.green}${C.bold}  ✓ ${text}${C.reset}\n`),
  aiBubble: (text) => {
    const lines = text.split("\n");
    console.log(`${C.blue}╭${C.reset} ${C.bold}Open Friday${C.reset}`);
    lines.forEach((line, i) => {
      const prefix = i === 0 ? "│ " : "│ ";
      console.log(`${C.blue}${prefix}${C.reset}${line}`);
    });
    console.log(`${C.blue}╰${C.reset} ${C.gray}AI Assistant${C.reset}\n`);
  },
  agentLog: (step, action, status = "info") => {
    const icons = { info: "⚙️", success: "✅", error: "❌", obs: "📝" };
    const icon = icons[status] || "⚙️";
    console.log(`${C.gray}[Step ${step}]${C.reset} ${icon} ${C.bold}${action}${C.reset}`);
  }
};

function col(s, c) { return `${C[c]||""}${s}${C.reset}`; }
function log(s, c) { console.log(c ? col(s, c) : s); }

// ─── Response state for ESC interrupt ───
let isResponding = false;
let abortResponse = false;

function showBanner() {
  console.clear();
  log(IDENTITY.icon, "cyan");
  log(` ${IDENTITY.name} v3.0`, "cyan");
  log(` ${IDENTITY.tagline}`, "dim");
  log(col("  ESC to interrupt · Ctrl+P commands · Tab complete", "gray") + "\n");
}

function showLogin() {
  log("╔══════════════════════════════════════════════╗","cyan");
  log("║        🔐 LOGIN REQUIRED                     ║","cyan");
  log(`║  📎 ${col(`http://localhost:${PORT}`,"green")}                        ║`,"cyan");
  log("╚══════════════════════════════════════════════╝\n","cyan");
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  showBanner();

  // ─── Authentication ───
  let user = auth.getCurrentUser();
  if (!user) {
    showLogin();
    try {
      await authServer.start();
      exec(`start "" "http://localhost:${PORT}"`);
    } catch(e) {
      UI.error(`Failed to start login server: ${e.message}`);
    }
    log("⏳ Waiting...\n","dim");
    user = await authServer.waitForLogin();
    console.log(""); UI.success(`Welcome, ${col(user.name,"green")}!`); log("Type / for commands or just chat.\n","dim");
  } else {
    UI.success(`Logged in as ${col(user.name,"green")} (${user.email})`);
    log(col("  ESC to interrupt · Ctrl+P commands · Tab complete","gray") + "\n");
  }

  // ─── Load Obsidian Vault Memory ───
  try {
    const vaultSummary = obsidianMemory.getVaultSummary();
    if (vaultSummary.totalNotes > 0) {
      log(col(`  📓 Obsidian Vault: ${vaultSummary.totalNotes} notes loaded (${vaultSummary.memoryNotes} memory)`, "dim"));
    }
  } catch (e) {
    // Non-blocking
  }

  // ─── Init ───
  const registry = new CommandRegistry();
  registry.registerAll(commandDefs);
  let currentDir = process.cwd();
  const ctx = new CommandContext({ currentDir, rl: null, auth, builtin: { chat, generateCode }, fs, path, exec, registry, UI });
  const allCommands = registry.getAll();

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════

  function showHelp() {
    console.log("");
    for (const cat of registry.getCategories()) {
      log(`[${cat}]`,"yellow");
      const cmds = registry.getCategory(cat);
      for (const c of cmds) {
        const hint = c.args && c.args.hint ? ` ${col(c.args.hint,"gray")}` : "";
        const aliases = c.aliases && c.aliases.length ? col(` (${c.aliases.slice(0,3).join(", ")})`, "gray") : "";
        log(`  /${col(c.name.padEnd(14),"cyan")} ${col(c.description,"dim")}${hint}${aliases}`);
      }
      console.log("");
    }
    log(`  ${col(allCommands.length,"green")} commands total`,"dim");
    console.log("");
  }

  // ─── Categorized command list (for / and Ctrl+P) ───
  function showCommandList(filter) {
    const shown = filter
      ? registry.search(filter).map(r => r.command)
      : allCommands;

    if (filter && shown.length === 0) {
      log(col(`\n  No commands matching "${filter}"`,"yellow"));
      return;
    }

    const cats = registry.getCategories();
    let count = 0;
    console.log("");
    for (const cat of cats) {
      const cmds = shown.filter(c => c.category === cat);
      if (cmds.length === 0) continue;
      log(`  ${cat}`,"yellow");
      for (const c of cmds) {
        const hint = c.args && c.args.hint ? ` ${col(c.args.hint,"gray")}` : "";
        log(`    ${col("/"+c.name.padEnd(14),"cyan")} ${col(c.description,"dim")}${hint}`);
        count++;
      }
    }
    if (filter) {
      log(col(`  ${count} of ${allCommands.length} commands match "${filter}"`,"dim"));
    } else {
      log(col(`  ${allCommands.length} commands total — type /filter to narrow`,"dim"));
    }
    console.log("");
  }

  // ─── Typewriter with ESC interrupt ───
  async function typeResponse(text) {
    if (!text) return;
    isResponding = true;
    abortResponse = false;
    for (let i = 0; i < text.length; i++) {
      if (abortResponse) break;
      process.stdout.write(text[i]);
      await new Promise(r => setTimeout(r, 5));
    }
    if (abortResponse) {
      log(col(" ⏹ interrupted","yellow"));
    }
    console.log("\n");
    isResponding = false;
  }

  async function runCmd(cmdName, args) {
    const resolved = registry.resolve(cmdName);
    if (!resolved) {
      // Try AI interpretation
      const intent = interpretCommand(cmdName + (args ? " " + args : ""));
      const sug = registry.search(cmdName);
      if (intent && registry.resolve(intent.command)) {
        const ic = registry.resolve(intent.command);
        log(`\n🤖 ${col("/"+ic,"cyan")} ${intent.args ? col(intent.args,"dim") : ""}`, "green");
        return await runCmd(ic, intent.args);
      }
      if (sug.length > 0 && sug[0].score > 20 && sug[0].command.name !== cmdName) {
        log(`\nUnknown /${cmdName}. Did you mean ${col("/"+sug[0].command.name,"cyan")}?`, "yellow");
        return;
      }
      // Last resort: natural language
      log(`\n🤔 Let me help with that...\n`, "yellow");
      const resp = await chat(`The user wants to: ${cmdName} ${args || ""}`.trim());
      await typeResponse(resp);
      return;
    }
    const cmd = registry.get(resolved);
    if (cmd.args && cmd.args.required && !args) {
      log(`\nUsage: /${cmd.name} ${cmd.args.hint||"<required>"}`, "yellow");
      log(col("  add the required argument after the command name","dim") + "\n");
      return;
    }
    try {
      log("");  // spacing
      const result = await cmd.handler(ctx, args);
      if (result === "SHOW_HELP") showHelp();
      if (result === "SHOW_BANNER") showBanner();
      if (result === "WAIT_LOGIN") {
        log(col("⏳ Waiting for login in browser...","dim") + "\n");
        const srv = require("./core/auth-server");
        const u = await srv.waitForLogin();
        UI.success(`Welcome, ${u.name}!`);
      }
      if (ctx.currentDir !== currentDir) { currentDir = ctx.currentDir; process.chdir(currentDir); }
    } catch(e) { UI.error(e.message); }
  }

  async function chatResponse(msg) {
    if (!msg.trim()) return;

    const spinners = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let spinIdx = 0;
    const spinner = setInterval(() => {
      process.stdout.write(`\r${col(spinners[spinIdx % 10], "yellow")} Thinking...`);
      spinIdx++;
    }, 80);

    try {
      let fullResponse = "";
      let aiMode = false;

      const result = await chat(msg, {
        stream: true,
        onChunk: (chunk) => {
          if (!aiMode) {
            clearInterval(spinner);
            process.stdout.write("\r" + " ".repeat(20) + "\r");
            aiMode = true;
            isResponding = true;
            abortResponse = false;
          }
          if (abortResponse) return;
          process.stdout.write(chunk);
          fullResponse += chunk;
        },
        onDone: () => {
          if (aiMode) {
            console.log("\n");
            isResponding = false;
          }
        },
        onError: () => { },
      });

      if (!aiMode && result) {
        clearInterval(spinner);
        process.stdout.write("\r" + " ".repeat(20) + "\r");
        UI.aiBubble(result);
      }
    } catch (e) {
      clearInterval(spinner);
      process.stdout.write("\r" + " ".repeat(20) + "\r");
      UI.error(`AI error: ${e.message}`);
      log(col("  Using offline mode", "dim") + "\n");
      UI.aiBubble(chatSync(msg));
    }
  }

  // ═══════════════════════════════════════════════
  // READLINE INTERFACE
  // ═══════════════════════════════════════════════
  // READLINE INTERFACE
  // ═══════════════════════════════════════════════

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: UI.prompt(),
    completer: (line) => {
      if (!line.startsWith("/")) return [[], line];
      const partial = line.slice(1).toLowerCase();
      const hits = allCommands
        .filter(c => c.name.startsWith(partial) || (c.aliases || []).some(a => a.startsWith(partial)))
        .map(c => "/" + c.name);
      return [hits.length ? hits : [], line];
    }
  });

  function safePrompt() {
    try { rl.prompt(); } catch (e) { /* readline already closed (e.g., piped input) */ }
  }

  rl.on("close", () => {
    console.log("\n");
    process.exit(0);
  });

  rl.prompt();

  // ═══════════════════════════════════════════════
  // KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════════
  // readline binds Ctrl+P to "previous history" internally.
  // Our keypress listener fires AFTER readline's internal one.
  // For Ctrl+P we undo readline's history nav and show our palette instead.

  process.stdin.on("keypress", (str, key) => {
    if (!key) return;

    // ESC — abort typewriter response mid-type
    if (key.name === "escape" && isResponding) {
      abortResponse = true;
      return;
    }

    // Ctrl+P — show command palette
    if (key.ctrl && key.name === "p" && !isResponding) {
      // By now readline may have changed the line to a history entry.
      // Undo on next tick to let readline finish visually.
      setImmediate(() => {
        rl.line = "";
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        showCommandList();
        safePrompt();
      });
      return;
    }
  });

  // ═══════════════════════════════════════════════
  // LINE HANDLER
  // ═══════════════════════════════════════════════

  rl.on("line", async (input) => {
    const line = input.trim();
    if (!line) { safePrompt(); return; }

    // "/" alone — show all commands categorized
    if (line === "/") {
      showCommandList();
      safePrompt();
      return;
    }

    // "/filter" — show matching commands (no spaces = category/search, not command+args)
    if (line.startsWith("/") && !line.includes(" ")) {
      const maybeCmd = line.slice(1).toLowerCase();
      // If it matches an exact command, run it (with empty args)
      if (registry.resolve(maybeCmd)) {
        await runCmd(maybeCmd, "");
        safePrompt();
        return;
      }
      // If search produces results, show filtered list
      const results = registry.search(maybeCmd);
      if (results.length > 0) {
        showCommandList(maybeCmd);
        safePrompt();
        return;
      }
    }

    // "/command [args]" — run a command
    if (line.startsWith("/")) {
      const parts = line.slice(1).split(" ");
      const cmdName = parts[0].toLowerCase();
      const args = parts.slice(1).join(" ");
      await runCmd(cmdName, args);
      safePrompt();
      return;
    }

    // Natural language chat
    await chatResponse(line);
    safePrompt();
  });

  // ─── Ctrl+C ───
  process.on("SIGINT", () => {
    if (isResponding) {
      abortResponse = true;
    } else {
      console.log("\n"); process.exit(0);
    }
  });
}

main();
