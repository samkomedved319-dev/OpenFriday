// Open Friday v2.0 - Best Coder AI

const IDENTITY = {
  name: "Open Friday",
  version: "v2.0",
  tagline: "Your Advanced AI Coding Companion",
  
  icon: `
    ██████╗ ███████╗ ██████╗ ██████╗     ██████╗  █████╗ ███████╗ █████╗ ███████╗
   ██╔════╝ ██╔════╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝
   ██║  ███╗█████╗  ██║   ██║████╔╝     ██████╔╝███████║█████╗  ██████║███████╗
   ██║   ██║██╔══╝  ██║   ██║██╔═██╗    ██╔══██╗██╔══██║██╔══╝  ██╔══██║╚════██║
   ╚██████╔╝███████╗╚██████╔╝██║  ██║    ██║  ██║██║  ██║███████╗██║  ██║███████╗
    ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
  `,
  
  personality: {
    greeting: "Hello! I'm Open Friday - Your AI Coding Companion!",
    
    traits: [
      "Proactive - I anticipate your needs",
      "Intelligent - Production-ready code",
      "Precise - Clean, bug-free code",
      "Best Coder - Senior engineer quality",
      "Collaborative - I work WITH you",
      "Knowledgeable - Clear explanations"
    ]
  }
};

// Clear, logical AI responses
function chat(message, context = []) {
  const lower = (message || "").toLowerCase();
  const msg = message || "";
  
  // GREETINGS
  if (/^(hi|hello|hey|howdy|sup)$/.test(lower)) {
    return "Hey! I'm Open Friday, your AI coding assistant.\n\nI can help you write code, build apps, fix bugs, and explain concepts.\n\nWhat do you need?";
  }
  
  // THANK YOU
  if (lower.includes("thank") && !lower.includes("think")) {
    return "You're welcome! Let me know if you need anything else.";
  }
  
  // GOODBYES
  if (/^(bye|goodbye|see you|farewell|cya)$/.test(lower)) {
    return "Goodbye! Come back anytime you need help coding.";
  }

  // IDENTITY
  if (lower.includes("who are you") || lower.includes("what are you") || lower.includes("your name")) {
    return "I'm Open Friday, an AI coding assistant.\n\nI can:\n• Write code in any language\n• Build web apps, APIs, scripts\n• Fix bugs and optimize code\n• Explain programming concepts\n• Review and test your code\n\nWhat do you need?";
  }

  if (lower.includes("what can you do") || lower.includes("capabilities") || lower.includes("skills")) {
    return "I can help you with:\n\nCode: /generate, /app, /api, /react, /python\nDebug: /fix, /optimize, /debug\nLearn: /explain, /docs\nFiles: /ls, /cat, /mkdir\n\nJust tell me what you need!";
  }

  // BUILD
  if (lower.includes("build") || lower.includes("create") || lower.includes("make")) {
    if (lower.includes("web") || lower.includes("website")) return "Use /app <name> to create a web app";
    if (lower.includes("api") || lower.includes("server")) return "Use /api <name> to create a REST API";
    if (lower.includes("react")) return "Use /react <name> to create a React app";
    if (lower.includes("python")) return "Use /python <name> to create a Python script";
    return "Try: /app, /api, /react, /python, /node";
  }

  // BUGS
  if (lower.includes("bug") || lower.includes("error") || lower.includes("not working")) {
    return "Use /fix <code or description> to fix bugs.\n\nOr tell me what error you're seeing.";
  }

  // EXPLAIN
  if (lower.includes("explain") || lower.includes("what is") || lower.includes("how does")) {
    if (lower.includes("javascript") || lower.includes("js")) return "JavaScript is a web programming language.\nRuns in browsers and Node.js.\nWant me to write some?";
    if (lower.includes("python")) return "Python is a beginner-friendly language.\nUsed in AI, web, data science.\nWant me to write Python code?";
    if (lower.includes("react")) return "React is a JavaScript library for UI.\nUse /react <name> to create an app.";
    if (lower.includes("api")) return "An API lets programs communicate.\nUse /api <name> to build one.";
    return "I can explain any concept. What do you want to learn?";
  }

  // OPTIMIZE
  if (lower.includes("optimize") || lower.includes("faster")) return "Use /optimize <code> to optimize.";
  
  // REVIEW
  if (lower.includes("review")) return "Use /review <code> to review your code.";

  // TEST
  if (lower.includes("test")) return "Use /test <code> to generate tests.";

  // FILES
  if (lower.includes("file") || lower.includes("folder")) {
    return "File commands: /ls, /cat, /mkdir, /touch, /rm";
  }

  // SUGGEST
  if (lower.includes("suggest")) return "Use /suggest to get development tips!";

  // ARCHITECT
  if (lower.includes("architect")) return "Use /architect <project> to design architecture.";

  // PERSONAL
  if (lower.includes("how are you")) return "Doing great! Ready to help you code. What do you need?";
  if (lower.includes("joke")) return "Why do programmers prefer dark mode? Because light attracts bugs! 😄";

  // DEFAULT
  return 'I understand: "' + msg + '"\n\nTry: /help for all commands, or tell me what you need!';
}

// Code generation
function generateCode(prompt, language) {
  const lang = (language || "js").toLowerCase();
  const p = (prompt || "").toLowerCase();
  
  // Detect language
  if (p.includes("python") || p.includes(".py")) return bestPython(prompt);
  if (p.includes("react") || p.includes("jsx")) return bestReact(prompt);
  if (p.includes("api") || p.includes("server") || p.includes("rest")) return bestAPI(prompt);
  if (p.includes("html") || p.includes("web") || p.includes("page")) return bestHTML(prompt);
  if (p.includes("css") || p.includes("style")) return bestCSS(prompt);
  if (p.includes("go")) return bestGo(prompt);
  if (p.includes("typescript") || p.includes(".ts")) return bestTypeScript(prompt);
  if (p.includes("game")) return bestGame(prompt);
  
  return bestJavaScript(prompt);
}

// Code generators
function bestHTML(prompt) {
  const title = (prompt || "My App").replace(/[^a-zA-Z0-9 ]/g, '');
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>' + title + '</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body {\n      font-family: "Inter", system-ui, sans-serif;\n      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n      min-height: 100vh;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      color: white;\n    }\n    .container { text-align: center; padding: 3rem; }\n    h1 { font-size: 3rem; margin-bottom: 1rem; }\n    p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }\n    .btn {\n      display: inline-block;\n      padding: 1rem 2.5rem;\n      background: white;\n      color: #764ba2;\n      text-decoration: none;\n      border-radius: 50px;\n      font-weight: 600;\n      transition: transform 0.3s;\n    }\n    .btn:hover { transform: translateY(-3px); }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>' + title + '</h1>\n    <p>Built with Open Friday AI</p>\n    <a href="#" class="btn">Get Started</a>\n  </div>\n</body>\n</html>';
}

function bestCSS(prompt) {
  return '/* ' + (prompt || 'Styles') + ' */\n\n:root {\n  --primary: #6366f1;\n  --primary-dark: #4f46e5;\n  --secondary: #10b981;\n  --dark: #1e293b;\n  --light: #f8fafc;\n}\n\n* { box-sizing: border-box; }\nbody {\n  font-family: "Inter", system-ui, sans-serif;\n  line-height: 1.6;\n  color: var(--dark);\n  background: var(--light);\n}\n\n.container { max-width: 1200px; margin: 0 auto; padding: 2rem; }\n.btn {\n  display: inline-block;\n  padding: 0.75rem 1.5rem;\n  background: var(--primary);\n  color: white;\n  border: none;\n  border-radius: 8px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn:hover { background: var(--primary-dark); transform: translateY(-2px); }\n.card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }';
}

function bestJavaScript(prompt) {
  return '/**\n * ' + (prompt || 'Application') + ' - Built with Open Friday\n */\n\n(function() {\n  "use strict";\n\n  const CONFIG = {\n    env: process.env.NODE_ENV || "development",\n    port: parseInt(process.env.PORT) || 3000\n  };\n\n  const logger = {\n    info: (...args) => console.log("[INFO]", ...args),\n    error: (...args) => console.error("[ERROR]", ...args)\n  };\n\n  process.on("uncaughtException", (err) => {\n    logger.error("Uncaught:", err.message);\n    process.exit(1);\n  });\n\n  class Application {\n    constructor() {\n      this.name = "' + (prompt || 'App') + '";\n    }\n\n    init() {\n      logger.info("Initializing:", this.name);\n      console.log("Ready!");\n    }\n\n    start() {\n      logger.info("Server on port", CONFIG.port);\n    }\n  }\n\n  const app = new Application();\n  \n  if (require.main === module) {\n    app.init();\n    app.start();\n  }\n\n  module.exports = { Application, CONFIG };\n})();';
}

function bestPython(prompt) {
  const name = (prompt || "app").replace(/[^a-zA-Z0-9_]/g, '_');
  return '#!/usr/bin/env python3\n"""' + (prompt || 'Application') + ' - Built with Open Friday"""  \n\nimport os\nimport sys\nfrom datetime import datetime\n\nCONFIG = {\n    "environment": os.getenv("APP_ENV", "development"),\n    "debug": os.getenv("DEBUG", "false").lower() == "true",\n    "port": int(os.getenv("PORT", "3000"))\n}\n\nclass Application:\n    """Main application"""  \n    \n    def __init__(self):\n        self.name = "' + name + '"\n        print(f"Initializing {self.name}...")\n        \n    def run(self):\n        print(f"{self.name} running!")\n        print(f"Config: {CONFIG}")\n\ndef main():\n    app = Application()\n    app.run()\n\nif __name__ == "__main__":\n    main()';
}

function bestAPI(prompt) {
  const name = (prompt || "api").replace(/[^a-zA-Z0-9_]/g, '_');
  return '/**\n * ' + (prompt || 'REST API') + ' - Built with Open Friday\n */\n\nconst express = require("express");\nconst cors = require("cors");\nconst helmet = require("helmet");\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(helmet());\napp.use(cors());\napp.use(express.json());\n\napp.use((err, req, res, next) => {\n  console.error("Error:", err.message);\n  res.status(500).json({ error: err.message });\n});\n\napp.get("/health", (req, res) => {\n  res.json({ status: "ok", timestamp: new Date().toISOString() });\n});\n\napp.listen(PORT, () => {\n  console.log("API running on port " + PORT);\n});\n\nmodule.exports = app;';
}

function bestReact(prompt) {
  const name = (prompt || "App").replace(/[^a-zA-Z0-9]/g, '');
  return 'import React, { useState, useEffect } from "react";\nimport "./App.css";\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    setLoading(false);\n  }, []);\n\n  if (loading) return <div>Loading...</div>;\n\n  return (\n    <div className="App">\n      <header>\n        <h1>' + name + '</h1>\n        <p>Built with Open Friday</p>\n      </header>\n      <main>\n        <div className="counter">\n          <button onClick={() => setCount(c => c - 1)}>-</button>\n          <span>{count}</span>\n          <button onClick={() => setCount(c => c + 1)}>+</button>\n        </div>\n      </main>\n    </div>\n  );\n}\n\nexport default App;';
}

function bestGo(prompt) {
  const name = (prompt || "main").replace(/[^a-zA-Z0-9]/g, '_');
  return '// ' + (prompt || 'Go App') + ' - Built with Open Friday\n\npackage main\n\nimport (\n\t"fmt"\n\t"log"\n\t"net/http"\n\t"os"\n\t"time"\n)\n\nfunc healthHandler(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set("Content-Type", "application/json")\n\tfmt.Fprintf(w, "{\\"status\\":\\"ok\\",\\"timestamp\\":\\"%s\\"}", time.Now())\n}\n\nfunc main() {\n\tport := os.Getenv("PORT")\n\tif port == "" { port = "3000" }\n\t\n\tmux := http.NewServeMux()\n\tmux.HandleFunc("/health", healthHandler)\n\t\n\tlog.Println("Server on port " + port)\n\tlog.Fatal(http.ListenAndServe(":"+port, mux))\n}';
}

function bestTypeScript(prompt) {
  const name = (prompt || "App").replace(/[^a-zA-Z0-9]/g, '');
  return '/**\n * ' + (prompt || 'Application') + ' - Built with Open Friday\n */\n\ninterface Config {\n  port: number;\n  environment: string;\n}\n\nclass Application {\n  private config: Config;\n  \n  constructor(config: Partial<Config> = {}) {\n    this.config = {\n      port: config.port || 3000,\n      environment: config.environment || "development"\n    };\n  }\n  \n  init(): void {\n    console.log("Initializing...");\n  }\n  \n  start(): void {\n    console.log("Server on port", this.config.port);\n  }\n}\n\nexport { Application };\n\nif (require.main === module) {\n  const app = new Application();\n  app.init();\n  app.start();\n}';
}

function bestGame(prompt) {
  return '/**\n * Game - Built with Open Friday\n */\n\nconst canvas = document.getElementById("gameCanvas");\nconst ctx = canvas.getContext("2d");\n\nconst state = {\n  player: { x: 400, y: 300, size: 20, speed: 5 },\n  score: 0,\n  keys: {}\n};\n\ndocument.addEventListener("keydown", (e) => state.keys[e.key] = true);\ndocument.addEventListener("keyup", (e) => state.keys[e.key] = false);\n\nfunction update() {\n  const p = state.player;\n  if (state.keys["ArrowUp"] || state.keys["w"]) p.y -= p.speed;\n  if (state.keys["ArrowDown"] || state.keys["s"]) p.y += p.speed;\n  if (state.keys["ArrowLeft"] || state.keys["a"]) p.x -= p.speed;\n  if (state.keys["ArrowRight"] || state.keys["d"]) p.x += p.speed;\n  p.x = Math.max(0, Math.min(canvas.width - p.size, p.x));\n  p.y = Math.max(0, Math.min(canvas.height - p.size, p.y));\n}\n\nfunction draw() {\n  ctx.fillStyle = "#1e293b";\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n  ctx.fillStyle = "#6366f1";\n  ctx.fillRect(state.player.x, state.player.y, state.player.size, state.player.size);\n  ctx.fillStyle = "white";\n  ctx.font = "20px Inter";\n  ctx.fillText("Score: " + state.score, 20, 30);\n}\n\nfunction gameLoop() {\n  update();\n  draw();\n  requestAnimationFrame(gameLoop);\n}\n\ngameLoop();';
}

module.exports = { IDENTITY, chat, generateCode };