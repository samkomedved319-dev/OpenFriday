/**
 * Open Friday v3.0 — Real AI Client
 * 
 * Multi-provider AI client supporting:
 * - Ollama (local LLM)
 * - OpenRouter (cloud models)
 * - Obsidian Vault as long-term memory
 * 
 * Features:
 * - Streaming responses (character-by-character)
 * - Conversation memory with context window
 * - Automatic model detection and health checks
 * - Graceful fallback to rule-based AI
 * - Obsidian vault memory integration
 */

"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const { loadDotEnv, getProvider, getModel, getOpenRouterApiKey, getOllamaBaseUrl } = require("./env");
const obsidianMemory = require("./obsidian-memory");

const HISTORY_PATH = path.join(__dirname, "conversation.json");

// Load .env on module init
loadDotEnv();

// ─── Load config from .env (multi-provider) ───
function loadConfig() {
  const provider = getProvider();
  const model = getModel();
  const ollamaBaseUrl = getOllamaBaseUrl();
  const openRouterKey = getOpenRouterApiKey();

  return {
    provider,
    model,
    ollamaBaseUrl,
    openRouterApiKey: openRouterKey,
    temperature: 0.7,
    maxTokens: 4096,
  };
}

// ─── Conversation Memory ───
function loadHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_PATH, "utf8"));
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    const trimmed = history.slice(-50);
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(trimmed, null, 2));
  } catch {
    // Ignore write errors
  }
}

function addToHistory(role, content) {
  const history = loadHistory();
  history.push({ role, content, timestamp: new Date().toISOString() });
  saveHistory(history);

  // Also persist to Obsidian vault as a memory note
  try {
    const prefix = role === "user" ? "Q" : "A";
    obsidianMemory.saveMemoryNote(role, content);
  } catch {
    // Non-blocking: vault write failures shouldn't break chat
  }

  return history;
}

function getContextWindow(maxMessages = 20) {
  const history = loadHistory();
  return history.slice(-maxMessages);
}

function clearHistory() {
  try {
    fs.writeFileSync(HISTORY_PATH, "[]");
  } catch {
    // Ignore
  }
}

// ─── OpenAI-compatible / OpenRouter API Client ───
function openRouterRequest(config, body) {
  return new Promise((resolve, reject) => {
    const apiKey = config.openRouterApiKey;
    if (!apiKey) {
      reject(new Error("OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env"));
      return;
    }

    const url = new URL("https://openrouter.ai/api/v1/chat/completions");
    const data = JSON.stringify({
      model: config.model || "openai/gpt-4o-mini",
      messages: body.messages || [],
      stream: false,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 4096,
    });

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/samkomedved319-dev/OpenFriday",
        "X-Title": "Open Friday",
        "Content-Length": Buffer.byteLength(data),
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.error) {
            reject(new Error(parsed.error.message || "OpenRouter API error"));
            return;
          }
          resolve({
            message: {
              content: parsed.choices?.[0]?.message?.content || "",
            },
          });
        } catch {
          reject(new Error("Invalid JSON response from OpenRouter"));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("OpenRouter request timed out (30s)"));
    });
    req.write(data);
    req.end();
  });
}

// ─── OpenRouter Streaming ───
function openRouterStream(config, body, onChunk, onDone, onError) {
  const apiKey = config.openRouterApiKey;
  if (!apiKey) {
    onError(new Error("OpenRouter API key not configured"));
    return;
  }

  const url = new URL("https://openrouter.ai/api/v1/chat/completions");
  const data = JSON.stringify({
    model: config.model || "openai/gpt-4o-mini",
    messages: body.messages || [],
    stream: true,
    temperature: config.temperature ?? 0.7,
    max_tokens: config.maxTokens ?? 4096,
  });

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://github.com/samkomedved319-dev/OpenFriday",
      "X-Title": "Open Friday",
      "Content-Length": Buffer.byteLength(data),
    },
    timeout: 60000,
  };

  const req = https.request(options, (res) => {
    let buffer = "";
    let streamDone = false;

    function finishStream() {
      if (streamDone) return;
      streamDone = true;
      onDone();
    }

    res.on("data", (chunk) => {
      buffer += chunk.toString();
      // SSE format: data: {...}\n\n
      const parts = buffer.split("\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed || trimmed === "data: [DONE]") {
          if (trimmed === "data: [DONE]") finishStream();
          continue;
        }
        if (trimmed.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content) {
              onChunk(content);
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    });

    res.on("end", () => {
      finishStream();
    });
  });

  req.on("error", (err) => {
    onError(err);
  });

  req.on("timeout", () => {
    req.destroy();
    onError(new Error("OpenRouter streaming timed out (60s)"));
  });

  req.write(data);
  req.end();
}

// ─── Ollama API Client ───
function ollamaRequest(config, body) {
  return new Promise((resolve, reject) => {
    const baseUrl = config.ollamaBaseUrl || "http://127.0.0.1:11434";
    const url = new URL(baseUrl + "/api/chat");
    const data = JSON.stringify({
      model: config.model || "llama3.2:latest",
      messages: body.messages || [],
      stream: false,
      options: {
        temperature: config.temperature ?? 0.7,
        num_predict: config.maxTokens ?? 4096,
      },
    });

    const options = {
      hostname: url.hostname,
      port: url.port || 11434,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
      timeout: 30000,
    };

    const req = http.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(responseData));
        } catch {
          reject(new Error("Invalid JSON response from AI"));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("AI request timed out (30s)"));
    });
    req.write(data);
    req.end();
  });
}

// ─── Streaming Ollama API ───
function ollamaStream(config, body, onChunk, onDone, onError) {
  const baseUrl = config.ollamaBaseUrl || "http://127.0.0.1:11434";
  const url = new URL(baseUrl + "/api/chat");
  const data = JSON.stringify({
    model: config.model || "llama3.2:latest",
    messages: body.messages || [],
    stream: true,
    options: {
      temperature: config.temperature ?? 0.7,
      num_predict: config.maxTokens ?? 4096,
    },
  });

  const options = {
    hostname: url.hostname,
    port: url.port || 11434,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
    timeout: 60000,
  };

  const req = http.request(options, (res) => {
    let buffer = "";
    let streamDone = false;

    function finishStream() {
      if (streamDone) return;
      streamDone = true;
      onDone();
    }

    res.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.message && parsed.message.content) {
            onChunk(parsed.message.content);
          }
          if (parsed.done) {
            finishStream();
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    });

    res.on("end", () => {
      if (!streamDone && buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.message && parsed.message.content) {
            onChunk(parsed.message.content);
          }
        } catch {
          // Ignore
        }
      }
      finishStream();
    });
  });

  req.on("error", (err) => {
    onError(err);
  });

  req.on("timeout", () => {
    req.destroy();
    onError(new Error("AI streaming timed out (60s)"));
  });

  req.write(data);
  req.end();
}

// ─── Health Check ───
async function checkHealth(config) {
  const provider = config.provider || "ollama";

  if (provider === "openrouter") {
    const apiKey = config.openRouterApiKey;
    if (!apiKey || apiKey === "your_openrouter_key_here") {
      return { available: false, provider: "openrouter", error: "API key not configured" };
    }
    // OpenRouter doesn't have a simple health endpoint, but if key exists we assume it works
    return { available: true, provider: "openrouter", model: config.model };
  }

  // Ollama health check
  return checkOllamaHealth(config);
}

function checkOllamaHealth(config) {
  return new Promise((resolve) => {
    const baseUrl = config.ollamaBaseUrl || "http://127.0.0.1:11434";
    const url = new URL(baseUrl + "/api/tags");
    const options = {
      hostname: url.hostname,
      port: url.port || 11434,
      path: url.pathname,
      method: "GET",
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const models = parsed.models || [];
          const hasModel = models.some((m) => m.name === config.model);
          resolve({
            available: true,
            provider: "ollama",
            models: models.map((m) => m.name),
            hasModel,
            modelCount: models.length,
          });
        } catch {
          resolve({ available: false, provider: "ollama", error: "Invalid response" });
        }
      });
    });

    req.on("error", () => resolve({ available: false, provider: "ollama", error: "Connection failed" }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ available: false, provider: "ollama", error: "Timeout" });
    });
    req.end();
  });
}

// ─── System Prompt with Obsidian Memory Context ───
function getSystemPrompt() {
  // Load obsidian memory notes to include in the system prompt
  let memoryContext = "";
  try {
    const notes = obsidianMemory.loadAllNotes();
    if (notes.length > 0) {
      memoryContext = "\n\n## Your Obsidian Vault Memory (context from your notes):\n" +
        notes.map((n, i) => `[Memory ${i + 1}]: ${n.content.substring(0, 500)}`).join("\n\n");
    }
  } catch {
    // Non-blocking
  }

  return `You are Open Friday, an expert AI coding assistant that lives in the terminal.
You have access to an Obsidian Vault for long-term memory - you can remember past conversations and information.

Your personality:
- Direct, helpful, and technical
- You write production-grade code with error handling
- You explain concepts clearly with practical examples
- You catch edge cases and suggest improvements
- You're concise but thorough

Rules:
- Always provide complete, working code
- Include error handling and edge cases
- Use modern best practices
- Explain your reasoning briefly
- Format code with proper indentation
- Keep responses focused and actionable
- You have persistent memory via the Obsidian vault - reference past learnings when relevant

You can help with:
- Writing code in any language
- Debugging and fixing errors
- Explaining concepts and technologies
- Code review and optimization
- Architecture and design
- Best practices and patterns

When asked to write code, ALWAYS provide the full implementation, not just snippets.${memoryContext}`;
}

// ─── Main AI Chat Function ───
async function aiChat(message, options = {}) {
  const { stream = false, onChunk = null, onDone = null, onError = null } = options;
  const config = loadConfig();
  const provider = config.provider;

  // Check AI health
  const health = await checkHealth(config);

  if (!health.available) {
    return {
      mode: "fallback",
      text: null,
      error: health.error || `AI provider "${provider}" is not available`,
    };
  }

  if (provider === "ollama" && !health.hasModel) {
    return {
      mode: "fallback",
      text: null,
      error: `Model "${config.model}" not found. Available: ${health.models.join(", ") || "none"}`,
    };
  }

  // Build messages with system prompt, history, and obsidian memory
  const messages = [
    { role: "system", content: getSystemPrompt() },
    ...getContextWindow(options.maxContext || 20),
    { role: "user", content: message },
  ];

  if (stream && onChunk) {
    let fullResponse = "";

    return new Promise((resolve) => {
      const onStreamChunk = (chunk) => {
        fullResponse += chunk;
        if (onChunk) onChunk(chunk);
      };

      const onStreamDone = () => {
        addToHistory("user", message);
        addToHistory("assistant", fullResponse);
        if (onDone) onDone();
        resolve({ mode: "ai", text: fullResponse, error: null });
      };

      const onStreamError = (err) => {
        if (onError) onError(err);
        resolve({ mode: "fallback", text: null, error: err.message });
      };

      if (provider === "openrouter") {
        openRouterStream(config, { messages }, onStreamChunk, onStreamDone, onStreamError);
      } else {
        ollamaStream(config, { messages }, onStreamChunk, onStreamDone, onStreamError);
      }
    });
  }

  // Non-streaming mode
  try {
    let response;
    if (provider === "openrouter") {
      response = await openRouterRequest(config, { messages });
    } else {
      response = await ollamaRequest(config, { messages });
    }

    const text = response.message?.content || "";

    // Save to history
    addToHistory("user", message);
    addToHistory("assistant", text);

    return { mode: "ai", text, error: null };
  } catch (err) {
    return { mode: "fallback", text: null, error: err.message };
  }
}

// ─── AI Code Generation ───
async function aiGenerateCode(prompt, language) {
  const config = loadConfig();
  const provider = config.provider;
  const health = await checkHealth(config);

  if (!health.available || (provider === "ollama" && !health.hasModel)) {
    return null;
  }

  const systemPrompt = `You are an expert code generator. Write complete, production-ready code.

Rules:
- Provide ONLY the code, no explanations
- Include error handling
- Use modern best practices
- Proper indentation and formatting
- Add comments for complex logic
- The code should be ready to run`;

  const userPrompt = `Write ${language || "JavaScript"} code for: ${prompt}

Language: ${language || "JavaScript"}
Requirements: Complete, working, production-ready code.`;

  try {
    let response;
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    if (provider === "openrouter") {
      response = await openRouterRequest(config, { messages });
    } else {
      response = await ollamaRequest(config, { messages });
    }

    return response.message?.content || null;
  } catch {
    return null;
  }
}

// ─── Public API ───
module.exports = {
  // AI Chat
  aiChat,
  aiGenerateCode,

  // Conversation Memory
  loadHistory,
  saveHistory,
  addToHistory,
  getContextWindow,
  clearHistory,

  // Health & Config
  checkOllamaHealth,
  checkHealth,
  loadConfig,

  // System
  getSystemPrompt,
};
