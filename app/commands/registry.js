/**
 * Open Friday — Command Registry
 * 
 * Central command registry with:
 * - Fuzzy matching for autocomplete
 * - Command metadata (name, desc, aliases, args, handler)
 * - Keyboard navigation support
 * - Modular architecture for adding new commands
 */

"use strict";

// ─── Fuzzy Scoring ───
// Implements substring + character-order matching with scoring
function fuzzyScore(query, target) {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  
  if (t === q) return 100;          // exact match
  if (t.startsWith(q)) return 80;   // prefix match
  if (t.includes(q)) return 60;     // substring match
  
  // Character order match (e.g., "gt" matches "generate test")
  let qi = 0;
  let score = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      score += 10;
      qi++;
    }
  }
  if (qi === q.length) return score;
  
  return 0;
}

// ─── Alias Expansion ───
// Expands aliases for each command at registration time
function expandAliases(commands) {
  const aliasMap = {};
  commands.forEach(cmd => {
    if (cmd.aliases) {
      cmd.aliases.forEach(alias => {
        aliasMap[alias] = cmd.name;
      });
    }
  });
  return aliasMap;
}

// ─── Command Registry ───
class CommandRegistry {
  constructor() {
    this.commands = new Map();    // name → command
    this.aliases = new Map();    // alias → name
    this.categories = new Map(); // category → [names]
  }

  /**
   * Register a command with full metadata
   * 
   * @param {Object} cmd - Command definition
   * @param {string} cmd.name - Command name (after /)
   * @param {string} cmd.description - Short description for preview
   * @param {string} [cmd.category] - Category for grouping
   * @param {string[]} [cmd.aliases] - Alternative names
   * @param {Object} [cmd.args] - Argument specification
   * @param {Function} cmd.handler - Async handler (args, context) => void
   * @param {boolean} [cmd.requiresAuth] - Whether login is required
   */
  register(cmd) {
    const { name, description, category = "General", aliases = [], args = null, handler, requiresAuth = false } = cmd;
    
    const entry = { name, description, category, aliases, args, handler, requiresAuth };
    this.commands.set(name, entry);
    
    // Register aliases
    aliases.forEach(alias => {
      this.aliases.set(alias, name);
    });
    
    // Add to category
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category).push(name);
    
    return this;
  }

  /**
   * Bulk register commands
   */
  registerAll(cmds) {
    cmds.forEach(cmd => this.register(cmd));
    return this;
  }

  /**
   * Resolve name or alias to canonical command name
   */
  resolve(input) {
    const name = input.toLowerCase().trim();
    if (this.commands.has(name)) return name;
    if (this.aliases.has(name)) return this.aliases.get(name);
    return null;
  }

  /**
   * Get command by name
   */
  get(name) {
    const resolved = this.resolve(name);
    return resolved ? this.commands.get(resolved) : null;
  }

  /**
   * Fuzzy search commands by query
   * Returns sorted array of { command, score }
   */
  search(query) {
    if (!query || query.trim() === "") {
      // Return all commands (for initial "/" display)
      return Array.from(this.commands.values()).map(cmd => ({ command: cmd, score: 0 }));
    }
    
    const q = query.toLowerCase().trim();
    const results = [];
    
    this.commands.forEach((cmd, name) => {
      let maxScore = fuzzyScore(q, name);
      
      // Also score description
      const descScore = fuzzyScore(q, cmd.description) * 0.5;
      if (descScore > maxScore) maxScore = descScore;
      
      // Score aliases
      cmd.aliases.forEach(alias => {
        const aliasScore = fuzzyScore(q, alias) * 0.8;
        if (aliasScore > maxScore) maxScore = aliasScore;
      });
      
      if (maxScore > 0) {
        results.push({ command: cmd, score: maxScore });
      }
    });
    
    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    return results;
  }

  /**
   * Get all commands in a category
   */
  getCategory(category) {
    const names = this.categories.get(category);
    if (!names) return [];
    return names.map(name => this.commands.get(name)).filter(Boolean);
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories.keys());
  }

  /**
   * Get all commands (flat)
   */
  getAll() {
    return Array.from(this.commands.values());
  }

  /**
   * Count of registered commands
   */
  get count() {
    return this.commands.size;
  }
}

// ─── Context Object ───
// Passed to every command handler
class CommandContext {
  constructor({ currentDir, rl, auth, builtin, fs, path, exec, registry, UI }) {
    this.currentDir = currentDir;
    this.rl = rl;
    this.auth = auth;
    this.builtin = builtin;
    this.fs = fs;
    this.path = path;
    this.exec = exec;
    this.registry = registry;
    this.UI = UI;
  }
}

// Export
module.exports = { CommandRegistry, CommandContext, fuzzyScore };