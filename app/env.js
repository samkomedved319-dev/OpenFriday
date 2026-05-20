const fs = require("fs");
const path = require("path");
const {
  DEFAULT_PROVIDER,
  DEFAULT_OLLAMA_MODEL,
  DEFAULT_OPENROUTER_MODEL,
  DEFAULT_OLLAMA_BASE_URL,
  DEFAULT_BUILTIN_MODEL,
  BUILTIN_MODEL,
} = require("../config/constants");

const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env");
const envExamplePath = path.join(projectRoot, ".env.example");

function template() {
  return [
    "# Easiest: use Ollama locally (no API key required)",
    `AI_PROVIDER=${DEFAULT_PROVIDER}`,
    `OLLAMA_BASE_URL=${DEFAULT_OLLAMA_BASE_URL}`,
    `OLLAMA_MODEL=${DEFAULT_OLLAMA_MODEL}`,
    `BUILTIN_MODEL=${DEFAULT_BUILTIN_MODEL}`,
    "",
    "# Optional: use OpenRouter cloud models",
    "OPENROUTER_API_KEY=your_openrouter_key_here",
    `OPENROUTER_MODEL=${DEFAULT_OPENROUTER_MODEL}`,
    "",
  ].join("\n");
}

function ensureEnvFiles() {
  if (!fs.existsSync(envExamplePath)) {
    fs.writeFileSync(envExamplePath, template(), "utf8");
  }
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, template(), "utf8");
  }
}

function loadDotEnv() {
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!key) continue;
    process.env[key] = value;
  }
}

function getModel() {
  const provider = getProvider();
  if (provider === "openrouter") {
    return process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;
  }
  if (provider === "builtin") {
    return process.env.BUILTIN_MODEL || DEFAULT_BUILTIN_MODEL;
  }
  return process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
}

function getProvider() {
  const raw = (process.env.AI_PROVIDER || DEFAULT_PROVIDER).trim().toLowerCase();
  if (raw === "openrouter") return "openrouter";
  if (raw === "builtin" || raw === "godcoder") return "builtin";
  return "ollama";
}

function getOpenRouterApiKey() {
  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey || apiKey === "your_openrouter_key_here") return "";
  return apiKey;
}

function getOllamaBaseUrl() {
  return (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL).trim();
}

function getObsidianVaultPath() {
  const customPath = (process.env.OBSIDIAN_VAULT_PATH || "").trim();
  if (customPath) return customPath;
  return path.join(projectRoot, "vault");
}

module.exports = {
  ensureEnvFiles,
  loadDotEnv,
  getModel,
  getProvider,
  getOpenRouterApiKey,
  getOllamaBaseUrl,
  getObsidianVaultPath,
  envPath,
};
