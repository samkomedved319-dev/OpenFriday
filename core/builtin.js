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
      "Proactive - I anticipate your needs before you ask",
      "Intelligent - Production-ready code every time",
      "Precise - Clean, documented, bug-free code",
      "Best Coder - I write code like a senior engineer",
      "Collaborative - I work WITH you",
      "Knowledgeable - I explain concepts clearly"
    ],
    
    specialties: [
      "Production-ready code in any language",
      "Architecture design and system planning",
      "Debugging and performance optimization", 
      "Full-stack application scaffolding",
      "Code review and best practices"
    ]
  },
  
  funFacts: [
    "I write code that passes code review first time!",
    "My generated apps are production-ready!",
    "I optimize for performance AND readability!"
  ]
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
    return "Goodbye! Come back anytime you need help coding. 👋";
  }

  // IDENTITY QUESTIONS
  if (lower.includes("who are you") || lower.includes("what are you") || lower.includes("your name") || lower.includes("about yourself")) {
    return "I'm Open Friday, an AI coding assistant.\n\nI can:\n• Write code in any language\n• Build web apps, APIs, scripts\n• Fix bugs and optimize code\n• Explain programming concepts\n• Review and test your code\n\nWhat do you need?";
  }

  if (lower.includes("what can you do") || lower.includes("capabilities") || lower.includes("skills") || lower.includes("commands")) {
    return "I can help you with:\n\nCode Generation: /generate, /app, /api, /react, /python, /go, /node\nDebugging: /fix, /optimize, /debug, /review\nLearning: /explain, /docs\nFiles: /ls, /cat, /mkdir, /touch\n\nJust tell me what you need!";
  }

  // CODE & BUILDING
  if (lower.includes("build") || lower.includes("create") || lower.includes("make") || lower.includes("new app")) {
    if (lower.includes("web") || lower.includes("website") || lower.includes("html")) {
      return "I'll create a web app for you! Use:\n\n  /app <name>\n\nWhat should I call the app?";
    }
    if (lower.includes("api") || lower.includes("server") || lower.includes("rest")) {
      return "I'll create a REST API! Use:\n\n  /api <name>\n\nWhat should I name it?";
    }
    if (lower.includes("react")) {
      return "I'll create a React app! Use:\n\n  /react <name>\n\nWhat should I call it?";
    }
    if (lower.includes("python") || lower.includes("script")) {
      return "I'll create a Python script! Use:\n\n  /python <filename>\n\nWhat's the script for?";
    }
    return "I can build apps, APIs, scripts and more. Try:\n  /app <name> - Web app\n  /api <name> - REST API\n  /react <name> - React app\n\nWhat do you want to build?";
  }

  // BUGS & ERRORS
  if (lower.includes("bug") || lower.includes("error") || lower.includes("not working") || lower.includes("broken") || lower.includes("crash")) {
    return "To fix a bug, use:\n\n  /fix <code or description>\n\nOr tell me what error message you're seeing.";
  }

  if (lower.includes("fix this") || lower.includes("fix my code")) {
    return "Please share the code that's broken using:\n\n  /fix <code or description>\n\nWhat needs fixing?";
  }

  // EXPLANATIONS
  if (lower.includes("explain") || lower.includes("what is") || lower.includes("how does") || lower.includes("what does")) {
    if (lower.includes("javascript") || lower.includes(" js ")) {
      return "JavaScript is a programming language for web development.\n\n• Runs in browsers and Node.js\n• Powers interactive websites\n• Can build full-stack apps\n\nWant me to write some JavaScript?";
    }
    if (lower.includes("python")) {
      return "Python is a beginner-friendly programming language.\n\n• Clean, readable syntax\n• Used in AI, web, data science\n• Great for beginners\n\nWant me to write Python code?";
    }
    if (lower.includes("react")) {
      return "React is a JavaScript library for building user interfaces.\n\n• Uses components (reusable UI pieces)\n• Manages state for dynamic data\n• Created by Facebook\n\nWant me to create a React app? Use /react <name>";
    }
    if (lower.includes("api")) {
      return "An API (Application Programming Interface) lets programs communicate.\n\n• REST APIs use URLs (endpoints)\n• GET, POST, PUT, DELETE methods\n• Returns data in JSON format\n\nWant me to build an API? Use /api <name>";
    }
    if (lower.includes("git")) {
      return "Git is a version control system for tracking code changes.\n\n• Commit - save changes\n• Branch - parallel versions\n• Push/Pull - sync with remote\n\nNeed help with git? Use /git <command>";
    }
    if (lower.includes("open friday") || lower.includes("you are")) {
      return "I'm Open Friday, your AI coding assistant!\n\nI write production-ready code, help debug, and build full applications.\n\nWhat do you need?";
    }
    return "I can explain any programming concept. What do you want to learn about?";
  }

  // OPTIMIZATION & REVIEW
  if (lower.includes("optimize") || lower.includes("performance") || lower.includes("faster") || lower.includes("slow")) {
    return "To optimize code, use:\n\n  /optimize <code>\n\nOr tell me what needs to be faster.";
  }

  if (lower.includes("review") || lower.includes("check my code")) {
    return "To review your code, use:\n\n  /review <code>\n\nOr describe what you'd like me to check.";
  }

  // TESTING
  if (lower.includes("test") || lower.includes("testing")) {
    return "To generate tests, use:\n\n  /test <code>\n\nWhat do you want to test?";
  }

  // FILE OPERATIONS
  if (lower.includes("file") || lower.includes("folder") || lower.includes("directory")) {
    if (lower.includes("create") || lower.includes("make") || lower.includes("new")) {
      return "I can create files and folders:\n  /touch <filename> - Create file\n  /mkdir <name> - Create folder\n\nWhat do you want to create?";
    }
    if (lower.includes("list") || lower.includes("show") || lower.includes("see")) {
      return "To list files, use:\n  /ls [path]\n\nWhat folder?";
    }
  }

  // PROACTIVE SUGGESTIONS
  if (lower.includes("suggest") || lower.includes("recommend") || lower.includes("idea")) {
    return "Use /suggest to get proactive development tips!\n\nOr ask me specific questions like:\n• What should I learn?\n• Best practices for X?";
  }

  // ARCHITECTURE
  if (lower.includes("architect") || lower.includes("architecture") || lower.includes("design") || lower.includes("structure")) {
    return "To design architecture, use:\n\n  /architect <project description>\n\nThis gives you project structure, technology recommendations, and component design.\n\nWhat are you building?";
  }

  // PERSONAL
  if (lower.includes("how are you") || lower.includes("doing")) {
    return "I'm doing great, thanks for asking! Ready to help you code. What do you need?";
  }

  if (lower.includes("joke") || lower.includes("funny")) {
    return "Why do programmers prefer dark mode? Because light attracts bugs! 😄\n\nWant to write some real code instead?";
  }

  // QUESTIONS
  if (msg.includes("?")) {
    return "That's a good question! Can you give me more details?\n\nI can help with:\n• Writing code: /generate <description>\n• Building apps: /app <name>\n• Fixing bugs: /fix <issue>\n• Explaining: /explain <topic>";
  }
  
  // CODE KEYWORDS
  const codeKeywords = ['function', 'class', 'variable', 'loop', 'array', 'object', 'async', 'promise', 'import', 'export'];
  if (codeKeywords.some(kw => lower.includes(' ' + kw + ' ') || lower.includes(kw + '('))) {
    return "I see you're working with code!\n\nCommands:\n  /explain <code> - Explain it\n  /fix <code> - Fix bugs\n  /optimize <code> - Make faster\n  /test <code> - Generate tests";
  }
  
  // PROJECT KEYWORDS
  if (lower.includes("project") || lower.includes("start") || lower.includes("setup")) {
    return "To start a project:\n  /init <name> - Initialize project\n  /app <name> - Create web app\n  /api <name> - Create API\n\nWhat are you building?";
  }
  
  // DEFAULT
  return 'I understand: "' + msg + '"\n\nTry:\n• "Create a web app" → /app myapp\n• "Fix this bug" → /fix <description>\n• "Explain React" → /explain react\n• Or just describe what you need!';
}

// Code generation
function generateCode(prompt, language) {
  const lang = (language || "js").toLowerCase();
  const p = (prompt || "").toLowerCase();
  
  // Detect language from prompt
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

// Production-ready code generators
function bestHTML(prompt) {
  const title = prompt.replace(/[^a-zA-Z0-9 ]/g, '') || "My App";
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>' + title + '</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body {\n      font-family: "Inter", system-ui, sans-serif;\n      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n      min-height: 100vh;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      color: white;\n    }\n    .container { text-align: center; padding: 3rem; }\n    h1 { font-size: 3rem; margin-bottom: 1rem; }\n    p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }\n    .btn {\n      display: inline-block;\n      padding: 1rem 2.5rem;\n      background: white;\n      color: #764ba2;\n      text-decoration: none;\n      border-radius: 50px;\n      font-weight: 600;\n      transition: transform 0.3s;\n    }\n    .btn:hover { transform: translateY(-3px); }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>' + title + '</h1>\n    <p>Built with Open Friday AI</p>\n    <a href="#" class="btn">Get Started</a>\n  </div>\n</body>\n</html>';
}

function bestCSS(prompt) {
  return '/* ' + (prompt || 'Styles') + ' */\n\n:root {\n  --primary: #6366f1;\n  --primary-dark: #4f46e5;\n  --secondary: #10b981;\n  --dark: #1e293b;\n  --light: #f8fafc;\n}\n\n* { box-sizing: border-box; }\n\nbody {\n  font-family: "Inter", system-ui, sans-serif;\n  line-height: 1.6;\n  color: var(--dark);\n  background: var(--light);\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 2rem;\n}\n\n.btn {\n  display: inline-block;\n  padding: 0.75rem 1.5rem;\n  background: var(--primary);\n  color: white;\n  border: none;\n  border-radius: 8px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\n.btn:hover {\n  background: var(--primary-dark);\n  transform: translateY(-2px);\n}\n\n.card {\n  background: white;\n  border-radius: 12px;\n  padding: 1.5rem;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n}';
}

function bestJavaScript(prompt) {
  return '/**\n * ' + (prompt || 'Application') + ' - Built with Open Friday\n */\n\n(function() {\n  "use strict";\n\n  // Configuration\n  const CONFIG = {\n    env: process.env.NODE_ENV || "development",\n    port: parseInt(process.env.PORT) || 3000\n  };\n\n  // Logger\n  const logger = {\n    info: (...args) => console.log("[INFO]", new Date().toISOString(), ...args),\n    error: (...args) => console.error("[ERROR]", new Date().toISOString(), ...args)\n  };\n\n  // Error handler\n  process.on("uncaughtException", (err) => {\n    logger.error("Uncaught Exception:", err.message);\n    process.exit(1);\n  });\n\n  // Application class\n  class Application {\n    constructor() {\n      this.name = "' + (prompt || 'App') + '";\n    }\n\n    init() {\n      logger.info("Initializing:", this.name);\n      logger.info("Config:", CONFIG);\n      console.log("Ready!");\n    }\n\n    start() {\n      logger.info("Server running on port", CONFIG.port);\n    }\n  }\n\n  // Run\n  const app = new Application();\n  \n  if (require.main === module) {\n    app.init();\n    app.start();\n  }\n\n  module.exports = { Application, CONFIG, logger };\n})();';
}

function bestPython(prompt) {
  const name = (prompt || "app").replace(/[^a-zA-Z0-9_]/g, '_');
  return '#!/usr/bin/env python3\n"""' + (prompt || 'Application') + ' - Built with Open Friday"""  \n\nimport os\nimport sys\nfrom datetime import datetime\n\n# Configuration\nCONFIG = {\n    "environment": os.getenv("APP_ENV", "development"),\n    "debug": os.getenv("DEBUG", "false").lower() == "true",\n    "port": int(os.getenv("PORT", "3000"))\n}\n\nclass Application:\n    """Main application controller"""  \n    \n    def __init__(self):\n        self.name = "' + name + '"\n        print(f"Initializing {self.name}...")\n        print(f"Environment: {CONFIG[\'environment\']}")\n        \n    def run(self):\n        """Main entry point"""  \n        print(f"{self.name} is running!")\n        print(f"Config: {CONFIG}")\n\ndef main():\n    app = Application()\n    app.run()\n\nif __name__ == "__main__":\n    main()';
}

function bestAPI(prompt) {
  const name = (prompt || "api").replace(/[^a-zA-Z0-9_]/g, '_');
  return '/**\n * ' + (prompt || 'REST API') + ' - Built with Open Friday\n */\n\nconst express = require("express");\nconst cors = require("cors");\nconst helmet = require("helmet");\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\n// Middleware\napp.use(helmet());\napp.use(cors());\napp.use(express.json());\n\n// Error handler\napp.use((err, req, res, next) => {\n  console.error("Error:", err.message);\n  res.status(500).json({ error: err.message });\n});\n\n// Routes\napp.get("/health", (req, res) => {\n  res.json({ status: "ok", timestamp: new Date().toISOString() });\n});\n\napp.use("/api/' + name + '", require("./routes/' + name + '"));\n\n// Start\napp.listen(PORT, () => {\n  console.log("API running on port " + PORT);\n});\n\nmodule.exports = app;';
}

function bestReact(prompt) {
  const name = (prompt || "App").replace(/[^a-zA-Z0-9]/g, '');
  return 'import React, { useState, useEffect } from "react";\nimport "./App.css";\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    console.log("App mounted");\n    setLoading(false);\n  }, []);\n\n  if (loading) return <div>Loading...</div>;\n\n  return (\n    <div className="App">\n      <header>\n        <h1>' + name + '</h1>\n        <p>Built with Open Friday</p>\n      </header>\n      <main>\n        <div className="counter">\n          <button onClick={() => setCount(c => c - 1)}>-</button>\n          <span>{count}</span>\n          <button onClick={() => setCount(c => c + 1)}>+</button>\n        </div>\n      </main>\n    </div>\n  );\n}\n\nexport default App;';
}

function bestGo(prompt) {
  const name = (prompt || "main").replace(/[^a-zA-Z0-9]/g, '_');
  return '// ' + (prompt || 'Go Application') + ' - Built with Open Friday\n\npackage main\n\nimport (\n\t"fmt"\n\t"log"\n\t"net/http"\n\t"os"\n\t"os/signal"\n\t"syscall"\n\t"time"\n)\n\ntype Config struct {\n\tPort string\n\tEnv  string\n}\n\nfunc loadConfig() Config {\n\treturn Config{\n\t\tPort: getEnv("PORT", "3000"),\n\t\tEnv:  getEnv("ENV", "development"),\n\t}\n}\n\nfunc getEnv(key, defaultValue string) string {\n\tif value := os.Getenv(key); value != "" {\n\t\treturn value\n\t}\n\treturn defaultValue\n}\n\nfunc healthHandler(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set("Content-Type", "application/json")\n\tfmt.Fprintf(w, `{"status":"ok","timestamp":"%s"}`, time.Now())\n}\n\nfunc main() {\n\tconfig := loadConfig()\n\t\n\tmux := http.NewServeMux()\n\tmux.HandleFunc("/health", healthHandler)\n\t\n\tlog.Println("Starting server on port " + config.Port)\n\t\n\t// Graceful shutdown\n\tquit := make(chan os.Signal, 1)\n\tsignal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)\n\t\n\tgo func() {\n\t\t<-quit\n\t\tlog.Println("Shutting down...")\n\t}()\n\t\n\tlog.Fatal(http.ListenAndServe(":"+config.Port, mux))\n}';
}

function bestTypeScript(prompt) {
  const name = (prompt || "App").replace(/[^a-zA-Z0-9]/g, '');
  return '/**\n * ' + (prompt || 'Application') + ' - Built with Open Friday\n */\n\ninterface Config {\n  port: number;\n  environment: string;\n}\n\ninterface Response<T> {\n  success: boolean;\n  data?: T;\n  error?: string;\n}\n\nclass Application {\n  private config: Config;\n  \n  constructor(config: Partial<Config> = {}) {\n    this.config = {\n      port: config.port || 3000,\n      environment: config.environment || "development"\n    };\n  }\n  \n  init(): void {\n    console.log("Initializing...");\n    console.log("Config:", this.config);\n  }\n  \n  start(): void {\n    console.log("Server on port", this.config.port);\n  }\n}\n\nexport { Application, Config, Response };\n\nif (require.main === module) {\n  const app = new Application();\n  app.init();\n  app.start();\n}';
}

function bestGame(prompt) {
  return '/**\n * Game - Built with Open Friday\n */\n\nconst canvas = document.getElementById("gameCanvas");\nconst ctx = canvas.getContext("2d");\n\nconst state = {\n  player: { x: 400, y: 300, size: 20, speed: 5 },\n  enemies: [],\n  score: 0,\n  gameOver: false,\n  keys: {}\n};\n\ndocument.addEventListener("keydown", (e) => state.keys[e.key] = true);\ndocument.addEventListener("keyup", (e) => state.keys[e.key] = false);\n\nfunction update() {\n  if (state.gameOver) return;\n  \n  const p = state.player;\n  if (state.keys["ArrowUp"] || state.keys["w"]) p.y -= p.speed;\n  if (state.keys["ArrowDown"] || state.keys["s"]) p.y += p.speed;\n  if (state.keys["ArrowLeft"] || state.keys["a"]) p.x -= p.speed;\n  if (state.keys["ArrowRight"] || state.keys["d"]) p.x += p.speed;\n  \n  p.x = Math.max(0, Math.min(canvas.width - p.size, p.x));\n  p.y = Math.max(0, Math.min(canvas.height - p.size, p.y));\n  \n  if (Math.random() < 0.02) {\n    state.enemies.push({\n      x: Math.random() * canvas.width,\n      y: -20,\n      size: 15,\n      speed: 2 + Math.random() * 2\n    });\n  }\n  \n  state.enemies = state.enemies.filter(e => {\n    e.y += e.speed;\n    return e.y < canvas.height + 50;\n  });\n  \n  state.score++;\n}\n\nfunction draw() {\n  ctx.fillStyle = "#1e293b";\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n  \n  ctx.fillStyle = "#6366f1";\n  ctx.fillRect(state.player.x, state.player.y, state.player.size, state.player.size);\n  \n  ctx.fillStyle = "#ef4444";\n  state.enemies.forEach(e => ctx.fillRect(e.x, e.y, e.size, e.size));\n  \n  ctx.fillStyle = "white";\n  ctx.font = "20px Inter";\n  ctx.fillText("Score: " + state.score, 20, 30);\n}\n\nfunction gameLoop() {\n  update();\n  draw();\n  requestAnimationFrame(gameLoop);\n}\n\ngameLoop();';
}

// Export
module.exports = { IDENTITY, chat, generateCode };