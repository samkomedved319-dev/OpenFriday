const readline = require("readline");
const { ensureEnvFiles, loadDotEnv, getModel, getProvider, envPath } = require("./env");
const { createSession, getAssistantReply } = require("./assistant");
const { COMMANDS, helpText } = require("../commands");
const { openCommandMenu } = require("../ui/menu");
const { typeOut } = require("../utils/typing");
const { bold, cyan, gray, green, yellow, separator } = require("../utils/format");

function renderHeader() {
  console.clear();
  console.log(cyan(bold("Welcome to Open Friday")));
  console.log(gray("A Claude-style coding CLI with slash command menu"));
  console.log(separator());
  console.log(gray("Type / to open command menu. Ctrl+C or /exit to quit.\n"));
}

// Helper: update .env value and in-memory env var
function updateEnvValue(key, value) {
  const fs = require("fs");
  const path = require("path");
  // Resolve env path from imported value if available
  const envPath = require("./env").envPath;
  if (!envPath || !fs.existsSync(envPath)) {
    process.env[key] = value;
    return;
  }
  let lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  let found = false;
  lines = lines.map((ln) => {
    if (ln.trim().startsWith(key + "=")) {
      found = true;
      return `${key}=${value}`;
    }
    return ln;
  });
  if (!found) lines.push(`${key}=${value}`);
  fs.writeFileSync(envPath, lines.join("\n"), "utf8");
  process.env[key] = value;
}

// 1) Set model flow
async function setModelFlow(rl) {
  const { execSync, exec } = require("child_process");
  let output = "";
  try {
    output = execSync("ollama list", { encoding: "utf8" });
  } catch (e) {
    console.log("Failed to list Ollama models. Make sure Ollama is installed and running.");
    return;
  }
  const lines = output.split(/\r?\n/).filter((l) => l.trim() && l.indexOf("NAME") !== 0);
  const models = lines.map((l) => l.trim().split(/\s+/)[0]).filter((n) => !!n);
  console.log("Available models:");
  models.forEach((m, i) => console.log(`${i + 1}. ${m}`));
  const choiceRaw = await new Promise((resolve) => rl.question("Choose model number (or enter exact name): ", resolve));
  const choice = choiceRaw.trim();
  let selectedModel = null;
  if (/^\d+$/.test(choice)) {
    const idx = parseInt(choice, 10) - 1;
    selectedModel = models[idx];
  } else {
    selectedModel = choice;
  }
  if (!selectedModel) {
    console.log("No model selected.");
    return;
  }
  const inList = models.includes(selectedModel);
  if (!inList) {
    const pullYn = await new Promise((resolve) => rl.question(`Model ${selectedModel} not found. Pull it? (y/n): `, resolve));
    if (pullYn.trim().toLowerCase() === "y") {
      console.log(`Pulling ${selectedModel}...`);
      try {
        exec(`ollama pull ${selectedModel}`, (err, stdout, stderr) => {
          if (err) {
            console.log(`Failed to pull ${selectedModel}: ${err.message}`);
          } else {
            console.log(stdout || stderr);
          }
        });
      } catch (e) {
        console.log("Pull command failed.");
      }
    } else {
      return;
    }
  }
  // Persist and apply according to selection
  if (selectedModel === "builtin" || selectedModel.toLowerCase().includes("godcoder")) {
    updateEnvValue("AI_PROVIDER", "builtin");
    updateEnvValue("BUILTIN_MODEL", "godcoder");
    console.log("Switched to built-in GodCoder model.");
  } else {
    updateEnvValue("AI_PROVIDER", "ollama");
    updateEnvValue("OLLAMA_MODEL", selectedModel);
    console.log(`Model updated to ${selectedModel}.`);
  }
}

// 2) Open preview/open file helper
async function openPathPreview(target) {
  const fs = require("fs");
  const path = require("path");
  const { spawn, exec } = require("child_process");
  if (!fs.existsSync(target)) {
    console.log(`Path not found: ${target}`);
    return;
  }
  const ext = path.extname(target).toLowerCase();
  if (ext === ".html" || ext === ".htm") {
    const dir = path.dirname(path.resolve(target));
    console.log(`Starting Live Server preview for ${target}...`);
    spawn("npx", ["live-server", "--port", "5500", "--open"], { cwd: dir, stdio: "inherit", shell: true });
  } else {
    if (process.platform === "win32") {
      exec(`start "" "${path.resolve(target)}"`);
    } else if (process.platform === "darwin") {
      exec(`open "${path.resolve(target)}"`);
    } else {
      exec(`xdg-open "${path.resolve(target)}"`);
    }
  }
}

function getCommandByName(name) {
  return COMMANDS.find((cmd) => cmd.name === name) || null;
}

async function askLine(rl, label) {
  return new Promise((resolve) => rl.question(label, resolve));
}

async function runApp() {
  ensureEnvFiles();
  loadDotEnv();
  const session = createSession();
  let selectedCommand = null;

  renderHeader();
  console.log(gray(`Using provider: ${getProvider()}`));
  console.log("OpenFRIDAY");
  console.log("-----------------");
  console.log(`Model: ${getModel()}`);
  console.log("Ready. Type your question and press Enter. Type 'exit' to quit.");
  console.log(gray(`Env file: ${envPath}\n`));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    historySize: 100,
  });

  // Simple local agent for file operations and searches (sanboxed)
  const pathModule = require("path");
  const fs = require("fs");
  async function agentOpenFlow(rl, target) {
    const yn = await new Promise((resolve) => rl.question(`Open '${target}'? (y/n): `, resolve));
    if (yn.trim().toLowerCase() === 'y') {
      await openPathPreview(target);
    } else {
      console.log("Cancelled.");
    }
  }
  async function agentSearchFlow(rl, startDir, query) {
    const results = [];
    function walk(dir) {
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        const full = pathModule.join(dir, e.name);
        if (e.isDirectory()) {
          walk(full);
        } else {
          try {
            const content = fs.readFileSync(full, 'utf8');
            if (content.includes(query)) {
              results.push(full);
            }
          } catch {
            // ignore binary files
          }
        }
      }
    }
    walk(startDir);
    return results;
  }

  while (true) {
    const userInput = (await askLine(rl, `${green("You")} > `)).trim();
    if (!userInput) continue;

    if (userInput.startsWith("/")) {
      const direct = getCommandByName(userInput);
      if (direct && userInput !== "/") {
        // continue below and execute as direct command
      } else {
        if (userInput === "/setmodel") {
          // Interactive model selection flow
          await setModelFlow(rl);
          continue;
        }
        if (userInput.startsWith("/agent")) {
          // Very small local agent syntax: /agent open <path> or /agent search <startDir> <query>
          const parts = userInput.split(" ").slice(1);
          const action = parts[0];
          if (action === "open" && parts[1]) {
            await agentOpenFlow(rl, parts.slice(1).join(" "));
          } else if (action === "search" && parts.length >= 3) {
            const startDir = parts[1];
            const q = parts.slice(2).join(" ");
            console.log(`Searching for '${q}' in ${startDir}...`);
            const results = await agentSearchFlow(rl, startDir, q);
            if (results && results.length) {
              console.log("Found:");
              results.forEach((p) => console.log(p));
            } else {
              console.log("No matches found.");
            }
          } else {
            console.log("Unknown agent command. Use: /agent open <path> or /agent search <startDir> <query>");
          }
          continue;
        }
        if (userInput.startsWith("/open ")) {
          const target = userInput.slice(6).trim();
          await openPathPreview(target);
          continue;
        }
        const picked = await openCommandMenu(COMMANDS, userInput.slice(1));
        if (picked) {
          console.log(`${yellow("Selected")} ${picked}`);
          selectedCommand = picked;
        }
        continue;
      }
    }

    if (userInput === "/help") {
      console.log(helpText());
      continue;
    }
    if (userInput === "/clear") {
      renderHeader();
      session.length = 1;
      continue;
    }
    if (userInput === "/exit") {
      break;
    }

    const command = getCommandByName(userInput);
    if (command) {
      selectedCommand = command.name;
      const detail = await askLine(rl, `${gray("Prompt for")} ${command.name} > `);
      if (!detail.trim()) continue;
    console.log(`\n${cyan("OpenFRIDAY")} >`);
    try {
      const reply = await getAssistantReply(session, selectedCommand, detail.trim());
      await typeOut(reply);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
    console.log(separator());
      continue;
    }

    console.log(`\n${cyan("OpenFRIDAY")} >`);
    try {
      const reply = await getAssistantReply(session, selectedCommand, userInput);
      await typeOut(reply);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
    console.log(separator());
  }

  rl.close();
  console.log(gray("Goodbye."));
}

module.exports = {
  runApp,
};
