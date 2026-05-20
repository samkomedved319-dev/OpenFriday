/**
 * Open Friday — Obsidian Vault Long-Term Memory
 * 
 * Integrates an Obsidian vault as the AI's persistent memory.
 * - Loads all notes on startup/login as context
 * - Saves conversations as timestamped markdown notes
 * - Enables the AI to "remember" information across sessions
 * 
 * The vault lives at <project_root>/OpenFriday/
 */

"use strict";

const fs = require("fs");
const path = require("path");

// Lazy-load env to avoid circular dependency issues
let _vaultPath = null;
let _memoryDir = null;

function getVaultPath() {
  if (!_vaultPath) {
    try {
      const { getObsidianVaultPath } = require("./env");
      _vaultPath = getObsidianVaultPath();
    } catch {
      _vaultPath = path.join(__dirname, "..", "OpenFriday");
    }
  }
  return _vaultPath;
}

function getMemoryDir() {
  if (!_memoryDir) {
    _memoryDir = path.join(getVaultPath(), "Memory");
  }
  return _memoryDir;
}

// ─── Ensure vault and memory directory exist ───
function ensureVault() {
  const vp = getVaultPath();
  const md = getMemoryDir();
  if (!fs.existsSync(vp)) {
    fs.mkdirSync(vp, { recursive: true });
  }
  if (!fs.existsSync(md)) {
    fs.mkdirSync(md, { recursive: true });
  }
}

// ─── Load all notes from the vault ───
// Returns array of { filename, path, content } for all .md files
function loadAllNotes() {
  ensureVault();
  const notes = [];

  function walkDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip .obsidian directory and hidden files
        if (entry.name.startsWith(".")) continue;

        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            notes.push({
              filename: entry.name,
              path: fullPath,
              relativePath: path.relative(getVaultPath(), fullPath),
              content: content,
            });
          } catch {
            // Skip unreadable files
          }
        }
      }
    } catch {
      // Skip unreadable directories
    }
  }

  walkDir(getVaultPath());
  return notes;
}

// ─── Load only memory notes (from Memory/ subfolder) ───
function loadMemoryNotes() {
  ensureVault();
  const notes = [];

  const md = getMemoryDir();
  if (!fs.existsSync(md)) return notes;

  try {
    const files = fs.readdirSync(md, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile() && file.name.endsWith(".md")) {
        try {
          const fullPath = path.join(getMemoryDir(), file.name);
          const content = fs.readFileSync(fullPath, "utf8");
          notes.push({
            filename: file.name,
            path: fullPath,
            content: content,
          });
        } catch {
          // Skip unreadable
        }
      }
    }
  } catch {
    // Ignore
  }

  return notes;
}

// ─── Helper: extract a short, safe description from content ───
// Takes the first ~6 words, strips special characters, truncates to 50 chars
function makeDescription(text, maxWords = 6, maxChars = 50) {
  if (!text) return "untitled";
  const words = text.trim().split(/\s+/).slice(0, maxWords);
  let desc = words.join("-").replace(/[^a-zA-Z0-9_-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (desc.length > maxChars) desc = desc.slice(0, maxChars);
  return desc || "untitled";
}

// ─── Helper: get formatted timestamp for filenames ───
function getTimestamp() {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

// ─── Save a memory note ───
// Creates a markdown file in the Memory/ subfolder
// Filename format: YYYY-MM-DD_HH-MM-SS_Role_Description.md
// @param {string} role - "user", "assistant", or "system"
// @param {string} content - The content to remember
// @param {string} [title] - Optional title for the note (overrides auto-description)
// @returns {string} The path to the saved note
function saveMemoryNote(role, content, title) {
  ensureVault();

  const ts = getTimestamp();
  const roleLabel = role === "user" ? "User" : role === "assistant" ? "AI" : "System";
  const desc = title ? title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50) : makeDescription(content);
  const filename = `${ts}_${roleLabel}_${desc}.md`;
  const filepath = path.join(getMemoryDir(), filename);

  // Build markdown content with frontmatter
  const markdown = `---
role: ${role}
created: ${new Date().toISOString()}
type: memory
description: ${desc}
---

${content}
`;

  try {
    fs.writeFileSync(filepath, markdown, "utf8");
    return filepath;
  } catch {
    return null;
  }
}

// ─── Save a structured "memory" about the user or project ───
// More semantic than raw conversation - used for important information
// Filename format: YYYY-MM-DD_HH-MM-SS_Topic.md
// @param {string} topic - The topic/category of memory
// @param {string} detail - The information to remember
function saveStructuredMemory(topic, detail) {
  ensureVault();

  const ts = getTimestamp();
  const safeTopic = topic.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase().slice(0, 50);
  const filename = `${ts}_${safeTopic}.md`;
  const filepath = path.join(getMemoryDir(), filename);

  const markdown = `---
topic: ${topic}
created: ${new Date().toISOString()}
type: structured-memory
---

## ${topic}

${detail}
`;

  try {
    fs.writeFileSync(filepath, markdown, "utf8");
    return filepath;
  } catch {
    return null;
  }
}

// ─── Get summary of vault contents ───
function getVaultSummary() {
  ensureVault();
  const allNotes = loadAllNotes();
  const memoryNotes = loadMemoryNotes();

  return {
    totalNotes: allNotes.length,
    memoryNotes: memoryNotes.length,
    vaultPath: getVaultPath(),
    notes: allNotes.map((n) => ({
      name: n.filename,
      path: n.relativePath,
      size: n.content.length,
    })),
  };
}

// ─── Get memory as a formatted context string for the AI prompt ───
function getMemoryContextString(maxNotes = 10, maxChars = 4000) {
  const notes = loadAllNotes();
  if (notes.length === 0) return "";

  let context = "\n\n## Persistent Memory from Your Obsidian Vault\n\n";
  let totalChars = 0;
  let count = 0;

  // Prioritize memory notes first, then other notes
  const sorted = notes.sort((a) => (a.relativePath.startsWith("Memory") ? -1 : 1));

  for (const note of sorted) {
    if (count >= maxNotes) break;
    if (totalChars > maxChars) break;

    const snippet = note.content.substring(0, 500);
    context += `### ${note.relativePath}\n${snippet}\n\n`;
    totalChars += snippet.length;
    count++;
  }

  return context;
}

// ─── Search vault notes for a term ───
function searchVault(query) {
  const notes = loadAllNotes();
  const results = [];

  for (const note of notes) {
    if (note.content.toLowerCase().includes(query.toLowerCase())) {
      // Find the matching context around the query
      const idx = note.content.toLowerCase().indexOf(query.toLowerCase());
      const start = Math.max(0, idx - 100);
      const end = Math.min(note.content.length, idx + query.length + 100);
      const context = (start > 0 ? "..." : "") + note.content.slice(start, end) + (end < note.content.length ? "..." : "");

      results.push({
        filename: note.filename,
        path: note.relativePath,
        context: context,
      });
    }
  }

  return results;
}

// ─── Initialize vault with a welcome/greeting note if empty ───
function initializeVault() {
  ensureVault();

  // Check if vault is essentially empty (no .md files except Welcome.md)
  const notes = loadAllNotes();
  const realNotes = notes.filter(
    (n) => n.filename !== "Welcome.md" && !n.relativePath.startsWith(".obsidian")
  );

  if (realNotes.length === 0) {
    // Create an initial memory note
    saveStructuredMemory(
      "Open-Friday-Initialization",
      "Open Friday AI assistant initialized. This vault serves as persistent long-term memory. All conversations and important information will be stored here as markdown notes."
    );
  }
}

// Module init
initializeVault();

module.exports = {
  loadAllNotes,
  loadMemoryNotes,
  saveMemoryNote,
  saveStructuredMemory,
  getVaultSummary,
  getMemoryContextString,
  searchVault,
  initializeVault,
  ensureVault,
  getVaultPath,
  getMemoryDir,
};
