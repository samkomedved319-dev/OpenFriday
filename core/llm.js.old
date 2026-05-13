const http = require("http");
const https = require("https");
const { URL } = require("url");
const {
  getProvider,
  getModel,
  getOpenRouterApiKey,
  getOllamaBaseUrl,
} = require("./env");
const { generateReply } = require("./builtin");

function parseJsonOrText(body) {
  try {
    return JSON.parse(body);
  } catch (_) {
    return body;
  }
}

function requestJson(urlString, { method = "POST", headers = {}, body = "" } = {}) {
  const url = new URL(urlString);
  const client = url.protocol === "http:" ? http : https;

  return new Promise((resolve, reject) => {
    const req = client.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method,
        headers,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          const parsed = parseJsonOrText(raw);
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const details =
              typeof parsed === "object"
                ? JSON.stringify(parsed)
                : String(parsed || "Unknown error");
            reject(new Error(`API ${res.statusCode}: ${details}`));
            return;
          }
          resolve(parsed);
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });
    if (body) req.write(body);
    req.end();
  });
}

async function requestOllama(messages) {
  const payload = JSON.stringify({
    model: getModel(),
    messages,
    stream: false,
  });

  const baseUrl = getOllamaBaseUrl().replace(/\/+$/, "");
  const data = await requestJson(`${baseUrl}/api/chat`, {
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
    body: payload,
  });

  const text = data?.message?.content?.trim();
  if (!text) {
    throw new Error(
      "Ollama returned no text. Make sure Ollama is running and model exists (try: ollama pull llama3.2:latest)."
    );
  }
  // Sanitize potentially markdown/code styled responses to plain text
  const { sanitizeAIResponse } = require("../utils/format");
  return sanitizeAIResponse(text);
}

async function requestOpenRouter(messages) {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY in .env.");
  }

  const payload = JSON.stringify({
    model: getModel(),
    messages,
    temperature: 0.3,
  });

  const data = await requestJson("https://openrouter.ai/api/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      Authorization: `Bearer ${apiKey}`,
    },
    body: payload,
  });

  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenRouter returned no assistant text.");
  }
  return text;
}

async function requestAssistant(messages) {
  // Built-in path handled above; this is for external providers
  try {
    const provider = getProvider();
    if (provider === "builtin") {
      const text = generateReply(messages);
      return text;
    }
    const task = provider === "openrouter" ? requestOpenRouter(messages) : requestOllama(messages);
    const result = await task;
    const text = typeof result === "string" ? result : result?.message?.content?.trim();
    if (!text) {
      throw new Error("Empty response from AI model.");
    }
    return text;
  } catch (err) {
    const msg = err?.message || String(err);
    // Return a friendly message instead of throwing
    return `OpenFRIDAY encountered an error: ${msg}`;
  }
}

module.exports = {
  requestAssistant,
};
