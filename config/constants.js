const DEFAULT_PROVIDER = "ollama";
const DEFAULT_OLLAMA_MODEL = "llama3.2:latest";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";
const DEFAULT_BUILTIN_MODEL = "godcoder";
const BUILTIN_MODEL = "godcoder";
const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434";

const SYSTEM_PROMPT =
  "You are Open Friday, an expert coding assistant. Be concise, accurate, and practical.";

module.exports = {
  DEFAULT_PROVIDER,
  DEFAULT_OLLAMA_MODEL,
  DEFAULT_OPENROUTER_MODEL,
  DEFAULT_OLLAMA_BASE_URL,
  DEFAULT_BUILTIN_MODEL,
  BUILTIN_MODEL,
  SYSTEM_PROMPT,
};
