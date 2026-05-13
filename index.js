#!/usr/bin/env node
"use strict";
/**
 * Open Friday v2.0 — Rock-Solid CLI
 * Uses readline for reliable cross-platform input
 * Commands always work - simple, clean, robust
 */

if (process.argv[2] === "--version" || process.argv[2] === "-v") {
  console.log("v2.0"); process.exit(0);
}

const fs = require("fs");
const path = require("path");
const http = require("http");
const readline = require("readline");
const { exec } = require("child_process");
const { IDENTITY, chat, generateCode, interpretCommand } = require("./core/builtin");
const auth = require("./core/auth");
const { CommandRegistry, CommandContext } = require("./commands/registry");
const commandDefs = require("./commands/index");

const PORT = 3456;
const SESSION_PATH = path.join(__dirname, "core", "session.json");

const C = { reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m", cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", gray: "\x1b[90m" };
function col(s, c) { return `${C[c]||""}${s}${C.reset}`; }
function log(s, c) { console.log(c ? col(s, c) : s); }

function showBanner() { console.clear(); log(IDENTITY.icon,"cyan"); log(` ${IDENTITY.name} ${IDENTITY.version}`,"cyan"); log(` ${IDENTITY.tagline}\n`,"dim"); }

function showLogin() {
  log("╔══════════════════════════════════════════════╗","cyan");
  log("║        🔐 LOGIN REQUIRED                     ║","cyan");
  log(`║  📎 ${col(`http://localhost:${PORT}`,"green")}                        ║`,"cyan");
  log("╚══════════════════════════════════════════════╝\n","cyan");
}

function startLoginServer() {
  const W = path.join(__dirname,"webui");
  return new Promise(r=>{
    const s=http.createServer((req,res)=>{
      if (req.url.startsWith("/auth-callback")) {
        const u=new URL(req.url,`http://localhost:${PORT}`);
        const n=u.searchParams.get("name")||"User",e=u.searchParams.get("email")||"user";
        try{fs.writeFileSync(SESSION_PATH,JSON.stringify({userId:Date.now(),email:e,name:n,loginAt:new Date().toISOString()},null,2));}catch(ex){}
        res.writeHead(200,{"Content-Type":"text/html"});
        res.end(`<!DOCTYPE html><body style="background:#08080e;color:#00d4aa;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;"><div><h1>✓ Authenticated!</h1><p style="color:#8888aa;">Welcome ${n}. Close this tab.</p><script>window.close()</script></div></body>`);
        return;
      }
      if (req.url==="/"||req.url==="/login.html") {
        const lf=path.join(W,"login.html");
        if (fs.existsSync(lf)) { let h=fs.readFileSync(lf,"utf8"); h=h.replace("</body>",`<script>const hL=handleLogin;handleLogin=function(e){e.preventDefault();const em=document.getElementById('loginEmail').value;window.location.href='/auth-callback?name='+encodeURIComponent(em.split('@')[0])+'&email='+encodeURIComponent(em);};const hR=handleRegister;handleRegister=function(e){e.preventDefault();const nm=document.getElementById('registerName').value;const em=document.getElementById('registerEmail').value;window.location.href='/auth-callback?name='+encodeURIComponent(nm)+'&email='+encodeURIComponent(em);};</script></body>`); res.writeHead(200,{"Content-Type":"text/html"});res.end(h);return; }
      }
      const ex=path.extname(req.url);
      if (ex===".css"||ex===".js") { const fp=path.join(W,req.url.replace(/^\//,"")); if (fs.existsSync(fp)) { res.writeHead(200,{"Content-Type":ex===".css"?"text/css":"application/javascript"});res.end(fs.readFileSync(fp));return; } }
      res.writeHead(404);res.end("Nope");
    });
    s.listen(PORT,()=>r(s));
  });
}

function waitForLogin() {
  return new Promise(r=>{
    const sp=["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];let i=0;
    const si=setInterval(()=>{process.stdout.write(`\r${col(sp[i%10],"yellow")} Waiting...`);i++;},100);
    const po=()=>{ const u=auth.getCurrentUser(); if(u){clearInterval(si);process.stdout.write("\r"+" ".repeat(30)+"\r");r(u);return;} try{const d=JSON.parse(fs.readFileSync(SESSION_PATH,"utf8"));if(d.email){clearInterval(si);process.stdout.write("\r"+" ".repeat(30)+"\r");r(d);return;}}catch(ex){} setTimeout(po,500); }; po();
  });
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  showBanner();

  let user = auth.getCurrentUser();
  if (!user) {
    showLogin();
    try { const s = await startLoginServer(); exec(`start "" "http://localhost:${PORT}"`); } catch(e) {}
    log("⏳ Waiting...\n","dim");
    user = await waitForLogin();
    console.log(""); log(`✓ Welcome, ${col(user.name,"green")}!`); log("Type / for commands or just chat.\n","dim");
  } else {
    log(`✓ Logged in as ${col(user.name,"green")} (${user.email})`); log("Type / for commands or just chat.\n","dim");
  }

  // ─── Init ───
  const registry = new CommandRegistry();
  registry.registerAll(commandDefs);
  let currentDir = process.cwd();
  const ctx = new CommandContext({ currentDir, rl: null, auth, builtin: { chat, generateCode }, fs, path, exec });

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════

  function showHelp() {
    console.log("");
    for (const cat of registry.getCategories()) {
      log(`[${cat}]`,"yellow");
      for (const c of registry.getCategory(cat)) {
        const h = c.args && c.args.hint ? ` ${col(c.args.hint,"gray")}` : "";
        log(`  /${col(c.name.padEnd(14),"cyan")} ${col(c.description,"dim")}${h}`);
      }
      console.log("");
    }
  }

  async function runCmd(cmdName, args) {
    const resolved = registry.resolve(cmdName);
    if (!resolved) {
      // Try AI interpretation
      const intent = interpretCommand(cmdName + (args ? " " + args : ""));
      const sug = registry.search(cmdName);
      if (intent && registry.resolve(intent.command)) {
        const ic = registry.resolve(intent.command);
        log(`\n🤖 Interpreting as ${col("/"+ic,"cyan")} ${intent.args ? col(intent.args,"dim") : ""}`, "green");
        log("", "reset");
        return await runCmd(ic, intent.args);
      }
      if (sug.length > 0 && sug[0].score > 20 && sug[0].command.name !== cmdName) {
        log(`\nUnknown /${cmdName}. Did you mean ${col("/"+sug[0].command.name,"cyan")}?`, "yellow");
        log("", "reset");
        return;
      }
      // Last resort: natural language
      log(`\nI don't recognize /${cmdName}. Let me help...\n`, "yellow");
      const resp = chat(`The user wants to: ${cmdName} ${args || ""}`.trim());
      for (let i = 0; i < resp.length; i++) { process.stdout.write(resp[i]); await new Promise(r => setTimeout(r, 5)); }
      console.log("\n");
      return;
    }
    const cmd = registry.get(resolved);
    if (cmd.args && cmd.args.required && !args) {
      log(`\nUsage: /${cmd.name} ${cmd.args.hint||"<required>"}`, "yellow");
      log("", "reset");
      return;
    }
    try {
      const result = await cmd.handler(ctx, args);
      if (result === "SHOW_HELP") showHelp();
      if (result === "SHOW_BANNER") showBanner();
      if (ctx.currentDir !== currentDir) { currentDir = ctx.currentDir; process.chdir(currentDir); }
    } catch(e) { log(`\nError: ${e.message}`, "red"); }
  }

  async function chatResponse(msg) {
    if (!msg.trim()) return;
    console.log("");
    const resp = chat(msg);
    for (let i = 0; i < resp.length; i++) { process.stdout.write(resp[i]); await new Promise(r => setTimeout(r, 5)); }
    console.log("\n");
  }

  function showCommandSuggestions(filter) {
    const all = filter ? registry.search(filter) : registry.getAll().map(c => ({ command: c, score: 0 }));
    const shown = (filter ? all.map(r => r.command) : all).slice(0, 8);
    console.log(col("  Commands:", "cyan"));
    shown.forEach(cmd => console.log(`    ${col("/"+cmd.name.padEnd(14), "bold")} ${col(cmd.description, "gray")}`));
    if (all.length > 8) console.log(col(`    ... and ${all.length - 8} more`, "gray"));
    if (filter) console.log(col(`  Filtered by: "${filter}"`, "dim"));
    console.log("");
  }

  // ═══════════════════════════════════════════════
  // READLINE INTERFACE
  // ═══════════════════════════════════════════════

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: `${col(">","green")} `,
  });

  rl.prompt();

  rl.on("line", async (input) => {
    const line = input.trim();
    if (!line) { rl.prompt(); return; }

    if (line === "/") {
      // Show command palette
      console.log(col("\n  All Commands:", "cyan"));
      const all = registry.getAll();
      all.slice(0, 10).forEach(cmd => console.log(`    ${col("/"+cmd.name.padEnd(14), "bold")} ${col(cmd.description, "gray")}`));
      if (all.length > 10) console.log(col(`    ... and ${all.length - 10} more`, "gray"));
      console.log(col("  Type the full command, e.g. /fix my bug", "dim"));
      console.log("");
      rl.prompt();
      return;
    }

    if (line.startsWith("/")) {
      const parts = line.slice(1).split(" ");
      const cmdName = parts[0].toLowerCase();
      const args = parts.slice(1).join(" ");
      await runCmd(cmdName, args);
      rl.prompt();
      return;
    }

    await chatResponse(line);
    rl.prompt();
  });

  process.on("SIGINT", () => { console.log("\n"); process.exit(0); });
}

main();