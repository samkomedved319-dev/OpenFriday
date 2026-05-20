/**
 * Open Friday — Agent Core
 * 
 * Implements an autonomous loop:
 * Sense (Explore) -> Plan (Decompose) -> Act (Execute) -> Verify (Check) -> Iterate
 */

"use strict";

const { chat } = require("./builtin");
const fs = require("fs");
const path = require("path");

class OpenFridayAgent {
  constructor(ctx, registry) {
    this.ctx = ctx;
    this.registry = registry;
    this.history = [];
    this.maxIterations = 10; // Safety limit to prevent infinite loops
    this.currentIteration = 0;
  }

  /**
   * The main autonomous loop
   * @param {string} goal - The high-level objective (e.g., "Implement a login system")
   * @param {Function} onProgress - Callback to update the CLI UI
   */
  async run(goal, onProgress) {
    this.currentIteration = 0;
    this.history = [{ role: "system", content: this.getAgentSystemPrompt() }];
    this.history.push({ role: "user", content: `Goal: ${goal}` });

    while (this.currentIteration < this.maxIterations) {
      this.currentIteration++;
      this.ctx.UI.agentLog(this.currentIteration, "Analyzing and Planning...", "info");
      
      let response;
      try {
        response = await chat(this.formatHistory(), { stream: false });
      } catch (e) {
        this.ctx.UI.error(`AI Error: ${e.message}`);
        break;
      }

      // DEMO MODE: Simulation for offline use
      if (!response.includes("<tool>") && this.currentIteration < 4) {
        const goalText = this.history[1].content.toLowerCase();
        if (goalText.includes("create a file") && this.currentIteration === 1) {
          response = "Thought: I need to create the file requested.\n<tool>touch hello.txt</tool>";
        } else if (goalText.includes("create a file") && this.currentIteration === 2) {
          response = "Thought: Now I will add content to it.\n<tool>run echo hello > hello.txt</tool>";
        } else if (goalText.includes("create a file") && this.currentIteration === 3) {
          response = "Thought: Let me verify the content.\n<tool>cat hello.txt</tool>";
        } else if (goalText.includes("create a file") && this.currentIteration === 4) {
          response = "I have created the file and verified the content. Task complete!";
        }
      }

      const toolCall = this.parseToolCall(response);

      if (!toolCall) {
        this.ctx.UI.aiBubble(response);
        return { status: "completed", finalResponse: response };
      }

      const { command, args } = toolCall;
      this.ctx.UI.agentLog(this.currentIteration, `Executing /${command} ${args}`, "info");

      try {
        const resolved = this.registry.resolve(command);
        if (!resolved) {
          throw new Error(`Command /${command} not found in registry`);
        }

        const cmd = this.registry.get(resolved);
        let result = "";
        const originalLog = console.log;
        const logs = [];
        console.log = (...args) => { logs.push(args.join(" ")); };

        const output = await cmd.handler(this.ctx, args);
        console.log = originalLog;
        
        result = logs.join("\n") || (typeof output === "string" ? output : "Command executed successfully");
        this.ctx.UI.agentLog(this.currentIteration, result.substring(0, 100) + (result.length > 100 ? "..." : ""), "obs");
        
        this.history.push({ role: "assistant", content: `Thought: ${response}\nAction: /${command} ${args}` });
        this.history.push({ role: "user", content: `Observation: ${result}` });

      } catch (err) {
        this.ctx.UI.error(`Step ${this.currentIteration} failed: ${err.message}`);
        this.history.push({ role: "user", content: `Error: ${err.message}` });
      }
    }

    this.ctx.UI.error("Agent reached maximum iterations.");
    return { status: "timeout", finalResponse: "Task exceeded maximum iterations." };
  }

      onProgress(`🤖 AI: ${response.substring(0, 100)}${response.length > 100 ? "..." : ""}`);
      
      // DEMO MODE: If AI is offline (returning fallback strings), 
      // we simulate some tool calls for common tasks to show the loop works.
      if (!response.includes("<tool>") && this.currentIteration < 4) {
        const goalText = this.history[1].content.toLowerCase();
        if (goalText.includes("create a file") && this.currentIteration === 1) {
          response = "Thought: I need to create the file requested.\n<tool>touch hello.txt</tool>";
        } else if (goalText.includes("create a file") && this.currentIteration === 2) {
          response = "Thought: Now I will add content to it.\n<tool>run echo hello > hello.txt</tool>";
        } else if (goalText.includes("create a file") && this.currentIteration === 3) {
          response = "Thought: Let me verify the content.\n<tool>cat hello.txt</tool>";
        } else if (goalText.includes("create a file") && this.currentIteration === 4) {
          response = "I have created the file and verified the content. Task complete!";
        }
      }

      // Parse the response for tool calls
      const toolCall = this.parseToolCall(response);

      if (!toolCall) {
        // AI has decided it's finished or is asking a question
        onProgress(`\n🤖 Agent: ${response}`);
        return { status: "completed", finalResponse: response };
      }

      // 2. ACT: Execute the tool
      const { command, args } = toolCall;
      onProgress(`\n⚙️  Action: /${command} ${args}`);

      try {
        const resolved = this.registry.resolve(command);
        if (!resolved) {
          throw new Error(`Command /${command} not found in registry`);
        }

        const cmd = this.registry.get(resolved);
        
        // Execute the command handler
        // We wrap the result in a string since handlers might just log to console
        let result = "";
        const originalLog = console.log;
        const logs = [];
        console.log = (...args) => {
          logs.push(args.join(" "));
        };

        const output = await cmd.handler(this.ctx, args);
        console.log = originalLog;
        
        result = logs.join("\n") || (typeof output === "string" ? output : "Command executed successfully");
        onProgress(`📝 Observation: ${result.substring(0, 200)}${result.length > 200 ? "..." : ""}`);
        
        // Add the action and observation to history
        this.history.push({ role: "assistant", content: `Thought: ${response}\nAction: /${command} ${args}` });
        this.history.push({ role: "user", content: `Observation: ${result}` });

      } catch (err) {
        onProgress(`❌ Error: ${err.message}`);
        this.history.push({ role: "user", content: `Error: ${err.message}` });
      }
    }

    onProgress("\n⚠️  Agent reached maximum iterations. Returning current state.");
    return { status: "timeout", finalResponse: "Task exceeded maximum iterations." };
  }

  /**
   * Extract tool calls from AI response.
   * Expects format: <tool>command args</tool>
   */
  parseToolCall(text) {
    const match = text.match(/<tool>([\s\S]*?)<\/tool>/);
    if (!match) return null;

    const content = match[1].trim();
    const spaceIdx = content.indexOf(" ");
    const command = spaceIdx >= 0 ? content.slice(0, spaceIdx).toLowerCase() : content.toLowerCase();
    const args = spaceIdx >= 0 ? content.slice(spaceIdx + 1).trim() : "";

    return { command, args };
  }

  formatHistory() {
    // We format the history as a single block for the AI
    return this.history.map(m => `${m.role === "system" ? "SYSTEM" : m.role === "assistant" ? "AGENT" : "USER"}: ${m.content}`).join("\n\n");
  }

  getAgentSystemPrompt() {
    return `You are the Open Friday Autonomous Coding Agent.
Your goal is to achieve the user's objective by using the available tools.

CORE LOOP:
1. SENSE: Use tools to explore the codebase (ls, cat, grep).
2. PLAN: Break the goal into small, verifiable steps.
3. ACT: Execute one tool at a time.
4. VERIFY: Check if the tool did what was expected.
5. ITERATE: Based on the observation, decide the next step.

TOOL USE FORMAT:
When you want to use a tool, you MUST use this exact format:
<tool>command args</tool>

Example:
Thought: I need to see the project structure.
<tool>ls</tool>

Example:
Thought: I need to read the server.js file to understand the API.
<tool>cat server.js</tool>

IMPORTANT:
- Do NOT guess file paths. Use /ls and /find first.
- Do NOT assume a command worked. Read the output.
- If you are finished, simply respond with your final conclusion without any <tool> tags.
- One tool call per turn.
`;
  }
}

module.exports = OpenFridayAgent;
