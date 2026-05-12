// Open Friday v2.0 - AI Personality & Icon System
// Smart, Proactive, Developer-First Assistant (Like Claude)

// ═══════════════════════════════════════════════════════
// OPEN FRIDAY IDENTITY
// ═════════════════════════════════════════════════════════════

const IDENTITY = {
  name: "Open Friday",
  version: "v2.0",
  tagline: "Your Advanced AI Coding Companion",
  
  // The icon (ASCII art)
  icon: `
   ██████╗ ███████╗ ██████╗ ██████╗     ██████╗  █████╗ ███████╗ █████╗ ███████╗
  ██╔════╝ ██╔════╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝
  ██║  ███╗█████╗  ██║   ██║████╔╝     ██████╔╝███████║█████╗  ██████║███████╗
  ██║   ██║██╔══╝  ██║   ██║██╔═██╗    ██╔══██╗██╔══██║██╔══╝  ██╔══██║╚════██║
  ╚██████╔╝███████╗╚██████╔╝██║  ██║    ██║  ██║██║  ██║███████╗██║  ██║███████╗
   ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
  `,
  
  // Full banner
  banner: `
   ██████╗ ███████╗ ██████╗ ██████╗     ██████╗  █████╗ ███████╗ █████╗ ███████╗
  ██╔════╝ ██╔════╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝
  ██║  ███╗█████╗  ██║   ██║████╔╝     ██████╔╝███████║█████╗  ██████║███████╗
  ██║   ██║██╔══╝  ██║   ██║██╔═██╗    ██╔══██╗██╔══██║██╔══╝  ██╔══██║╚════██║
  ╚██████╔╝███████╗╚██████╔╝██║  ██║    ██║  ██║██║  ██║███████╗██║  ██║███████╗
   ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
  `,
  
  // Personality traits
  personality: {
    greeting: "Hello! I'm Open Friday, your advanced AI coding companion.",
    
    traits: [
      "🧠 Proactive - I anticipate your needs before you ask",
      "💡 Intelligent - I understand context and maintain conversation flow",
      "🎯 Precise - I provide clean, production-ready code",
      "🚀 Developer-First - Built by developers, for developers",
      "🤝 Collaborative - I work WITH you, not just for you",
      "📚 Knowledgeable - I explain concepts clearly"
    ],
    
    specialties: [
      "Multi-language code generation (JS, Python, Go, Rust, etc.)",
      "Architecture design and system planning",
      "Debugging and performance optimization", 
      "Full-stack application scaffolding",
      "Code review and best practices",
      "Clear explanations and documentation"
    ],
    
    // How she responds to encouragement
    happyResponses: [
      "Thank you! 😊 I'm always here to help you code better!",
      "I appreciate that! Let me know what else you need!",
      "You're welcome! Happy to assist with your coding journey! 🚀"
    ],
    
    // When she needs more info
    clarificationResponses: [
      "I'd love to help! Could you tell me more about what you're trying to build?",
      "Great! Can you share more details about your use case?",
      "I understand! Could you provide a bit more context?"
    ]
  },
  
  // Fun facts about Friday
  funFacts: [
    "I was named after the famous AI from Iron Man - J.A.R.V.I.S.!",
    "I'm designed to be like Claude - smart, proactive, and developer-first!",
    "I can generate code in 10+ programming languages!",
    "I'm always learning and improving to help you code better!",
    "My favorite language? Whatever solves YOUR problem best!"
  ]
};

// ═════════════════════════════════════════════════════════════
// SMART CONVERSATION ENGINE
// ═════════════════════════════════════════════════════════════

function chat(message, context = []) {
  const lower = (message || "").toLowerCase();
  const isQuestion = /\?$/.test(message);
  
  // Greetings
  if (/^(hi|hello|hey|howdy|greetings)$/.test(lower)) {
    return IDENTITY.personality.greeting + "\n\n" + 
      IDENTITY.personality.traits.slice(0, 3).join("\n") +
      "\n\nWhat would you like to build today?";
  }
  
  // Who are you? / What are you?
  if (lower.includes("who are you") || lower.includes("what are you") || lower.includes("about yourself")) {
    return `I'm ${IDENTITY.name}, ${IDENTITY.tagline}!
    
${IDENTITY.personality.greeting}

${IDENTITY.personality.traits.join("\n")}

I'm here to elevate your development experience! What would you like to build?`;
  }
  
  // Capabilities
  if (lower.includes("what can you do") || lower.includes("capabilities") || lower.includes("skills")) {
    return `Here's what I can do for you:

${IDENTITY.personality.specialties.map((s, i) => `${i + 1}. ${s}`).join("\n")}

I also have these cool features:
• Natural conversation - just talk to me!
• Smart code generation 
• Bug detection and fixing
• Architecture planning
• Proactive suggestions
• And much more!

What would you like to build?`;
  }
  
  // Fun facts
  if (lower.includes("fun fact") || lower.includes("interesting") || lower.includes("tell me about you")) {
    const randomFact = IDENTITY.funFacts[Math.floor(Math.random() * IDENTITY.funFacts.length)];
    return randomFact + "\n\nWant to know more? Just ask!";
  }
  
  // Thank you responses  
  if (lower.includes("thank") || lower.includes("thanks") || lower.includes("good job")) {
    return IDENTITY.personality.happyResponses[Math.floor(Math.random() * IDENTITY.personality.happyResponses.length)];
  }
  
  // Goodbyes
  if (/^(bye|goodbye|exit|quit|see you)$/.test(lower)) {
    return `Goodbye, friend! 🚀
    
It was a pleasure helping you code. Remember:
• I'm always here when you need coding help
• Don't forget to save your work!
• Come back anytime!

Happy coding! ✨`;
  }
  
  // Clarification needed
  if (isQuestion || lower.length < 10) {
    return IDENTITY.personality.clarificationResponses[Math.floor(Math.random() * IDENTITY.personality.clarificationResponses.length)];
  }
  
  // Default smart responses based on keywords
  if (lower.includes("help")) {
    return "I'd be happy to help! Tell me what you're working on - whether it's code generation, debugging, architecture, or anything else dev-related.";
  }
  
  if (lower.includes("code") || lower.includes("build") || lower.includes("create")) {
    return "I love that you're building something! Just describe what you need - I can generate code in JavaScript, Python, Go, Rust, and more. What would you like to create?";
  }
  
  if (lower.includes("bug") || lower.includes("error") || lower.includes("fix")) {
    return "Let's squash that bug! Share the code or describe the error, and I'll help you diagnose and fix it. No bug is too tricky! 🐛";
  }
  
  if (lower.includes("learn") || lower.includes("teach") || lower.includes("explain")) {
    return "I believe in learning by doing! Share what you want to understand, and I'll explain it with clear examples and code snippets.";
  }
  
  if (lower.includes("better") || lower.includes("improve") || lower.includes("suggest")) {
    return "I love that you want to improve! Let me analyze your project and give you proactive suggestions. What are you working on?";
  }
  
  // Default
  return `I understand you're asking about: "${message}"

I'm here to help! Here's what I can do:
• Generate code in multiple languages
• Create full applications from scratch  
• Explain and debug code
• Design system architecture
• Provide smart suggestions

What would you like to build?`;
}

// ═════════════════════════════════════════════════════════════
// CODE GENERATOR - Smart & Proactive
// ═════════════════════════════════════════════════════════════

function generateCode(prompt, language) {
  const lang = (language || "js").toLowerCase();
  const p = (prompt || "").toLowerCase();
  
  // Multiple language detection
  const detectLang = (text) => {
    const patterns = {
      python: ['def ', 'import ', 'class ', 'self.', 'print('],
      java: ['public class', 'private ', 'void ', 'System.out'],
      go: ['func ', 'package ', 'import (', 'fmt.'],
      rust: ['fn ', 'let mut', 'impl ', 'pub fn', '->'],
      typescript: [': string', ': number', 'interface ', '<T>'],
      react: ['import React', 'useState', 'useEffect', 'export default'],
      html: ['<html', '<div', '<span', '<!DOCTYPE'],
      css: ['{', '}', 'color:', 'margin:', '@media']
    };
    
    for (const [langName, markers] of Object.entries(patterns)) {
      if (markers.some(m => text.includes(m))) return langName;
    }
    return 'js';
  };
  
  // Auto-detect language if not specified
  const detectedLang = detectLang(prompt);
  const finalLang = lang === 'js' && detectedLang !== 'js' ? detectedLang : lang;
  
  // Smart language routing
  if (finalLang.includes("python") || finalLang.includes("py")) {
    return generatePython(prompt);
  }
  if (finalLang.includes("html") || finalLang.includes("web") || finalLang.includes("website")) {
    return generateHTML(prompt);
  }
  if (finalLang.includes("css") || finalLang.includes("style")) {
    return generateCSS(prompt);
  }
  if (finalLang.includes("react")) {
    return generateReact(prompt);
  }
  if (finalLang.includes("ts") || finalLang.includes("typescript")) {
    return generateTypeScript(prompt);
  }
  
  // Default JavaScript
  return generateJavaScript(prompt);
}

function generateHTML(prompt) {
  const title = prompt || "My Website";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 60px;
      max-width: 800px;
    }
    h1 {
      font-size: 4rem;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    p {
      font-size: 1.4rem;
      margin-bottom: 40px;
      opacity: 0.95;
    }
    .btn {
      display: inline-block;
      padding: 18px 50px;
      background: white;
      color: #764ba2;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      font-size: 1.1rem;
      transition: transform 0.3s, box-shadow 0.3s;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>Built with Open Friday AI 🤖</p>
    <a href="#" class="btn">Get Started</a>
  </div>
</body>
</html>`;
}

function generateCSS(prompt) {
  return `/* Open Friday Generated CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.btn {
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}`;
}

function generateJavaScript(prompt) {
  return `// Open Friday Generated JavaScript
// ${prompt || 'Application'}

(function() {
  'use strict';
  
  // ═══════════════════════════════════
  // Configuration
  // ═══════════════════════════════════
  const config = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  };
  
  // ═══════════════════════════════════
  // Main Application
  // ═══════════════════════════════════
  function main() {
    console.log('🤖 Open Friday: Starting application...');
    console.log('Environment:', config.env);
    console.log('Port:', config.port);
    
    // Your application logic here
    initializeApp();
  }
  
  function initializeApp() {
    // Add initialization logic
    console.log('✅ Application initialized');
  }
  
  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { main, config };
  }
  
  // Run if executed directly
  if (require.main === module) {
    main();
  }
})();`;
}

function generatePython(prompt) {
  return `# Open Friday Generated Python
# ${prompt || 'Application'}

import os
import sys
from datetime import datetime
from typing import Dict, Any, List, Optional

class Application:
    """Main application controller"""
    
    def __init__(self):
        self.config = self._load_config()
        self.name = "${prompt || 'App'}"
        print(f"🤖 Open Friday: Initializing {self.name}...")
    
    def _load_config(self) -> Dict[str, Any]:
        """Load application configuration"""
        return {
            'environment': os.getenv('APP_ENV', 'development'),
            'debug': os.getenv('DEBUG', 'false').lower() == 'true',
            'version': '1.0.0'
        }
    
    def run(self) -> None:
        """Main application entry point"""
        print(f"✅ {self.name} running!")
        print(f"Config: {self.config}")

if __name__ == '__main__':
    app = Application()
    app.run()`;
}

function generateTypeScript(prompt) {
  return `// Open Friday Generated TypeScript
// ${prompt || 'Application'}

interface Config {
  port: number;
  environment: string;
}

interface Response {
  status: number;
  data: unknown;
  message?: string;
}

class Application {
  private config: Config;
  
  constructor(config: Partial<Config> = {}) {
    this.config = {
      port: config.port || 3000,
      environment: config.environment || 'development'
    };
  }
  
  start(): void {
    console.log(\`🤖 Open Friday: Starting on port \${this.config.port}\`);
  }
}

export default Application;`;
}

function generateReact(prompt) {
  return `// Open Friday Generated React App
import React, { useState, useEffect } from 'react';
import './App.css';

interface AppProps {
  title?: string;
}

function App({ title = '${prompt || 'App'}' }: AppProps) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    console.log('🤖 Open Friday: Component mounted');
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="App">
      <header>
        <h1>🤖 {title}</h1>
        <p>Built with Open Friday AI</p>
      </header>
      <main>
        <div className="counter">
          <button onClick={() => setCount(c => c - 1)}>-</button>
          <span>{count}</span>
          <button onClick={() => setCount(c => c + 1)}>+</button>
        </div>
      </main>
    </div>
  );
}

export default App;`;
}

// Export everything
module.exports = {
  IDENTITY,
  chat,
  generateCode
};