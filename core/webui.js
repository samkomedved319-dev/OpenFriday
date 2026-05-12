// Open Friday Web UI
const express = require("express");
const path = require("path");
const fs = require("fs");
const { generateCode, generateReply } = require("./builtin");

const app = express();
app.use(express.json());

// Generate code endpoint
app.post("/api/generate", (req, res) => {
  const { prompt, language } = req.body || {};
  const code = generateCode(prompt || "hello world", language || "js");
  res.json({ code });
});

// Generate reply endpoint
app.post("/api/reply", (req, res) => {
  const { message } = req.body || {};
  const reply = generateReply([{ role: "user", content: message }]);
  res.json({ reply });
});

// Create app endpoint
app.post("/api/create-app", (req, res) => {
  const { name } = req.body || {};
  const dir = path.join(__dirname, "..", name || "my-app");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), generateCode(name, "html"));
  fs.writeFileSync(path.join(dir, "style.css"), "body { font-family: Arial; }");
  fs.writeFileSync(path.join(dir, "script.js"), "console.log('App loaded');");
  res.json({ path: dir });
});

// File operations
app.post("/api/file", (req, res) => {
  const { action, path: filePath, content } = req.body || {};
  const resolvedPath = path.resolve(filePath);
  
  try {
    switch (action) {
      case "read":
        if (fs.existsSync(resolvedPath)) {
          res.json({ content: fs.readFileSync(resolvedPath, "utf8") });
        } else {
          res.status(404).json({ error: "File not found" });
        }
        break;
      case "write":
        const dir = path.dirname(resolvedPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(resolvedPath, content || "", "utf8");
        res.json({ success: true });
        break;
      case "list":
        const items = fs.readdirSync(resolvedPath, { withFileTypes: true });
        res.json({ files: items.map(i => ({ name: i.name, isDirectory: i.isDirectory() })) });
        break;
      default:
        res.status(400).json({ error: "Unknown action" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, "..", "webui")));

// Main page
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Open Friday</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      background: linear-gradient(135deg, #0f0f1a, #1a1a2e);
      color: #fff;
      min-height: 100vh;
    }
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    .header {
      text-align: center;
      padding: 40px 0;
      border-bottom: 1px solid #333;
    }
    .header h1 { 
      font-size: 2.5rem; 
      background: linear-gradient(90deg, #00d4ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .prompt {
      display: flex;
      gap: 10px;
      margin: 20px 0;
    }
    .prompt input {
      flex: 1;
      padding: 15px;
      border: 1px solid #333;
      border-radius: 8px;
      background: #1a1a2e;
      color: #fff;
      font-size: 1rem;
    }
    .prompt button {
      padding: 15px 30px;
      border: none;
      border-radius: 8px;
      background: #00d4ff;
      color: #000;
      font-weight: bold;
      cursor: pointer;
    }
    .prompt button:hover { background: #00ffaa; }
    .output {
      background: #0a0a14;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 20px;
      min-height: 300px;
      white-space: pre-wrap;
      font-family: 'Consolas', monospace;
      color: #00d4ff;
      overflow-x: auto;
    }
    .commands {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 20px 0;
    }
    .commands button {
      padding: 8px 16px;
      border: 1px solid #333;
      border-radius: 20px;
      background: transparent;
      color: #888;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .commands button:hover {
      border-color: #00d4ff;
      color: #00d4ff;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 Open Friday</h1>
      <p>Your AI Coding Companion</p>
    </div>
    
    <div class="commands">
      <button onclick="setPrompt('/generate')">/generate</button>
      <button onclick="setPrompt('/app')">/app</button>
      <button onclick="setPrompt('/api')">/api</button>
      <button onclick="setPrompt('/game')">/game</button>
      <button onclick="setPrompt('/help')">/help</button>
    </div>
    
    <div class="prompt">
      <input id="input" placeholder="Describe what you want..." onkeypress="if(event.key==='Enter')send()">
      <button onclick="send()">Generate</button>
    </div>
    
    <div class="output" id="output">Welcome to Open Friday!

Type a description and I'll generate code for you.
Try commands like /generate, /app, /api, /game, or just describe what you need.</div>
  </div>
  
  <script>
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    
    function setPrompt(cmd) {
      input.value = cmd + ' ';
      input.focus();
    }
    
    async function send() {
      const prompt = input.value.trim();
      if (!prompt) return;
      
      output.textContent = 'Generating...';
      
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        output.textContent = data.code || data.error;
      } catch (e) {
        output.textContent = 'Error: ' + e.message;
      }
    }
  </script>
</body>
</html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Open Friday Web UI: http://localhost:${PORT}`);
});