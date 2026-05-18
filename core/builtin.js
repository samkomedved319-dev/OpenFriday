// ═══════════════════════════════════════════════
// Open Friday v2.0 — Ultra-Smart AI & Best Coder
// ═══════════════════════════════════════════════

const IDENTITY = {
  name: "Open Friday",
  version: "v2.0",
  tagline: "Smarter Than Your Average AI",
  icon: `
    ██████╗ ███████╗ ██████╗ ██████╗     ██████╗  █████╗ ███████╗ █████╗ ███████╗
   ██╔════╝ ██╔════╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝
   ██║  ███╗█████╗  ██║   ██║████╔╝     ██████╔╝███████║█████╗  ██████║███████╗
   ██║   ██║██╔══╝  ██║   ██║██╔═██╗    ██╔══██╗██╔══██║██╔══╝  ██╔══██║╚════██║
   ╚██████╔╝███████╗╚██████╔╝██║  ██║    ██║  ██║██║  ██║███████╗██║  ██║███████╗
    ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
  `
};

// ═══════════════════════════════════════════════════════════════
// ADVANCED AI CONVERSATION ENGINE
// Uses intent classification + context-aware response generation
// ═══════════════════════════════════════════════════════════════

// ─── Intent Classifier ───
function classifyIntent(text) {
  const L = text.toLowerCase().trim();
  
  // Multi-intent patterns (check these first)
  if (/^(hi|hello|hey|howdy|sup|yo|good morning|good evening|what.s up|heya)\b/.test(L)) 
    return { type: "greeting", confidence: 0.95 };
  
  if (/^(thanks|thank you|ty|thx|appreciate|good job|great|awesome|perfect)$/i.test(L) || 
      /\b(thanks|thank you|appreciate it)\b/.test(L)) 
    return { type: "gratitude", confidence: 0.9 };
  
  if (/^(bye|goodbye|see ya|cya|farewell|see you later|gotta go|later)$/i.test(L) ||
      /\b(bye|goodbye|see you|talk later)\b/.test(L))
    return { type: "farewell", confidence: 0.9 };

  if (/\b(who are you|what are you|your name|about you|introduce yourself|tell me about yourself)\b/.test(L))
    return { type: "identity", confidence: 0.95 };

  if (/\b(what can you do|capabilities|skills|features|what commands|help me|how can you|what do you do)\b/.test(L))
    return { type: "capabilities", confidence: 0.9 };

  // ─── CODE / BUILD ───
  if (/\b(build|create|make|generate|write|develop|scaffold|code for)\b/.test(L)) {
    if (/\b(api|rest|backend|server|endpoint|microservice|graphql)\b/.test(L))
      return { type: "build_api", confidence: 0.9 };
    if (/\b(web|website|html|page|site|frontend|ui|landing)\b/.test(L))
      return { type: "build_web", confidence: 0.9 };
    if (/\b(react|component|jsx|vue|svelte|angular)\b/.test(L))
      return { type: "build_react", confidence: 0.9 };
    if (/\b(python|script|py|flask|django|fastapi)\b/.test(L))
      return { type: "build_python", confidence: 0.9 };
    if (/\b(game|arcade|sprite|canvas|2d|3d)\b/.test(L))
      return { type: "build_game", confidence: 0.85 };
    if (/\b(cli|command|terminal|tool|script)\b/.test(L))
      return { type: "build_cli", confidence: 0.85 };
    if (/\b(database|db|sql|mongo|schema|table|query)\b/.test(L))
      return { type: "build_database", confidence: 0.85 };
    return { type: "build_general", confidence: 0.8 };
  }

  // ─── DEBUG / FIX ───
  if (/\b(bug|error|broken|crash|fail|issue|problem|doesn.t work|not working|wrong|fix|debug|repair)\b/.test(L)) {
    if (/\b(type|syntax|reference|undefined|null|cannot read|is not a)\b/.test(L))
      return { type: "debug_error", confidence: 0.9 };
    if (/\b(import|require|module|package|dependenc|install)\b/.test(L))
      return { type: "debug_module", confidence: 0.85 };
    return { type: "debug_general", confidence: 0.85 };
  }

  // ─── EXPLAIN ───
  if (/\b(explain|what is|how does|what does|how do i|tell me about|define|describe|what.s|what are|why is|how can i)\b/.test(L)) {
    if (/\b(javascript|js|ecmascript|es6)\b/.test(L) && !/\b(react|node|vue)\b/.test(L))
      return { type: "explain_js", confidence: 0.9 };
    if (/\b(python)\b/.test(L))
      return { type: "explain_python", confidence: 0.9 };
    if (/\b(react|jsx|hooks|usestate|useeffect|component)\b/.test(L))
      return { type: "explain_react", confidence: 0.9 };
    if (/\b(api|rest|graphql|endpoint|http)\b/.test(L))
      return { type: "explain_api", confidence: 0.9 };
    if (/\b(git|github|version control|repository|commit|branch|merge)\b/.test(L))
      return { type: "explain_git", confidence: 0.9 };
    if (/\b(typescript|ts|type|interface|generic)\b/.test(L))
      return { type: "explain_typescript", confidence: 0.9 };
    if (/\b(async|await|promise|callback|event loop|thread)\b/.test(L))
      return { type: "explain_async", confidence: 0.9 };
    if (/\b(algorithm|data structure|complexity|big o|sort|search|tree|graph|hash)\b/.test(L))
      return { type: "explain_algo", confidence: 0.9 };
    if (/\b(open friday|you are|this assistant|this tool)\b/.test(L))
      return { type: "identity", confidence: 0.9 };
    return { type: "explain_general", confidence: 0.7 };
  }

  // ─── OPTIMIZE / REVIEW ───
  if (/\b(optimize|performance|slow|faster|speed up|improve|refactor|clean|efficient)\b/.test(L))
    return { type: "optimize", confidence: 0.85 };
  if (/\b(review|check|audit|quality|code review)\b/.test(L))
    return { type: "review", confidence: 0.85 };
  if (/\b(test|unit test|spec|integration|jest|mocha|pytest)\b/.test(L))
    return { type: "test", confidence: 0.85 };

  // ─── SUGGEST / ADVICE ───
  if (/\b(suggest|recommend|idea|what should|advice|tip|best practice|learn|tutorial)\b/.test(L))
    return { type: "suggest", confidence: 0.8 };
  if (/\b(architect|architecture|design pattern|structure|system design|scalab)\b/.test(L))
    return { type: "architect", confidence: 0.85 };

  // ─── FILE OPERATIONS ───
  if (/\b(file|folder|directory|list|read|create|delete|rename|navigate|cd)\b/.test(L) && 
      /\b(how|can|help|need|want|command)\b/.test(L))
    return { type: "files", confidence: 0.8 };

  // ─── PERSONAL ───
  if (/\b(how are you|how do you feel|are you ok|how.s it going)\b/.test(L))
    return { type: "personal_status", confidence: 0.9 };
  if (/\b(joke|funny|laugh|humor|make me laugh)\b/.test(L))
    return { type: "joke", confidence: 0.9 };
  if (/\b(fun fact|interesting fact|did you know|tell me something)\b/.test(L))
    return { type: "fun_fact", confidence: 0.9 };
  if (/\b(you.re (smart|amazing|great|awesome|the best|cool|incredible)|i love you|i like you)\b/.test(L))
    return { type: "compliment", confidence: 0.9 };

  // ─── COMPLIMENT ───
  if (/\b(good|great|nice|awesome|perfect|amazing)\b/.test(L) && L.length < 60)
    return { type: "positive_feedback", confidence: 0.6 };

  // ─── LEARNING ───
  if (/\b(learn|beginner|new to|start|tutorial|how to code|teach|guide|resource)\b/.test(L))
    return { type: "learn", confidence: 0.8 };

  // ─── CODE SNIPPET DETECTION ───
  if (/\b(function|class|const |let |var |import |export |async|await|promise|=>)\b/.test(L) || /\/\//.test(L) || /\/\*/.test(L) || /\b(def|return|if |for |while )/.test(L))
    return { type: "code_help", confidence: 0.8 };

  // ─── QUESTIONS ───
  if (/\?$/.test(L) || /\b(can you|could you|will you|would you|do you|does it|is it|are there)\b/.test(L))
    return { type: "question", confidence: 0.6 };

  // ─── SHORT MESSAGES ───
  if (L.length < 10)
    return { type: "short", confidence: 0.5 };

  return { type: "unknown", confidence: 0.3 };
}


// ─── Response Generator ───
function generateResponse(intent, message) {
  const L = message.toLowerCase().trim();

  switch (intent.type) {
    // ═══ GREETING ═══
    case "greeting":
      return "Hey! I'm Open Friday.\n\nI write production-grade code, debug issues, build apps, and explain concepts clearly.\n\nWhat are we building today?";

    // ═══ GRATITUDE ═══
    case "gratitude":
      return "Happy to help! I'm here whenever you need to write better code or solve a tough problem.\n\nWhat's next?";

    // ═══ FAREWELL ═══
    case "farewell":
      return "Catch you later! Keep building great things.\n\nRemember: good code is written with clarity, not cleverness.";

    // ═══ IDENTITY ═══
    case "identity":
      return "I'm Open Friday — an AI coding assistant that lives in your terminal.\n\nHere's what sets me apart:\n• I don't just generate code — I *understand* what you're building\n• I explain *why* something works, not just how\n• I catch edge cases before they become bugs\n• I'm proactive — I'll tell you if there's a better approach\n\nI write production-ready code in JS, Python, Go, TypeScript, React, and more.\n\nWhat do you need help with?";

    // ═══ CAPABILITIES ═══
    case "capabilities":
      return "Here's what I can do for you:\n\n🔧 **Debugging**\nI find root causes, not just symptoms. Share your error and I'll analyze it.\n\n⚡ **Code Generation**\nComplete, working code in any language — with error handling, logging, and edge cases covered.\n\n📖 **Explanations**\nI break down complex topics into clear, intuitive concepts with practical examples.\n\n🔄 **Code Review**\nI check for bugs, performance issues, security vulnerabilities, and best practices.\n\n🚀 **Full Projects**\nDescribe what you want and I'll scaffold an entire project structure.\n\nTry typing something like \"build a REST API\" or \"explain async/await\"!";

    // ═══ BUILD ═══
    case "build_api":
      return "Let's build an API! I'll create a production-ready Express server with:\n\n• Route handlers with proper HTTP methods\n• Error handling middleware\n• Security headers (Helmet)\n• CORS support\n• Request logging\n• Health check endpoint\n\nTo create it: `/api <name>`\n\nWhat should I name your API?";

    case "build_web":
      return "I'll create a web app with a modern design:\n\n• Responsive layout\n• CSS variables for theming\n• Interactive elements\n• Clean, semantic HTML\n\nTo create it: `/app <name>`\n\nWhat's the project called?";

    case "build_react":
      return "I'll scaffold a React component with:\n\n• Functional component with hooks\n• State management\n• Loading and error states\n• Clean JSX\n• CSS module\n\nTo create it: `/react <name>`\n\nWhat's the component for?";

    case "build_python":
      return "I'll write a well-structured Python script:\n\n• Type hints for clarity\n• Docstrings explaining each function\n• Error handling\n• Command-line argument support\n\nTo create it: `/python <filename>`\n\nWhat should the script do?";

    case "build_game":
      return "Let's make a game! I'll create a canvas-based game with:\n\n• Player movement (WASD/arrows)\n• Enemy spawning and AI\n• Collision detection\n• Score tracking\n• Lives system\n• Game over / restart\n\nType `/generate game` to create one!";

    case "build_cli":
      return "I can build a CLI tool with:\n\n• Argument parsing\n• Help documentation\n• Colorized output\n• Error handling\n\nWhat should the CLI tool do?";

    case "build_database":
      if (L.includes("mongo") || L.includes("no-sql")) return "I'll generate a MongoDB schema with proper indexes, validation, and timestamps.";
      return "I'll generate SQL schema with proper constraints, indexes, and relationships.";
      
    case "build_general":
      return "Tell me what you want to build and I'll write the code. Try:\n\n• \"Build a REST API\" → `/api myapi`\n• \"Make a web app\" → `/app myapp`\n• \"Create a React component\" → `/react mycomponent`\n• \"Write a Python script\" → `/python script.py`\n\nOr just describe what you need!";

    // ═══ DEBUG / FIX ═══
    case "debug_error":
      return "That looks like a code error. Let's break it down:\n\n1. **Read the error carefully** — it usually tells you exactly what's wrong\n2. **Check the line number** — that's where to start looking\n3. **Is the variable defined?** — typos in names are common\n4. **Is the type correct?** — functions vs objects vs primitives\n\nUse `/fix <code or error>` and I'll analyze it for you.";

    case "debug_module":
      return "Module issues? Here's the checklist:\n\n• Is it installed? Check package.json or run `/install <package>`\n• Is the import path correct? Relative paths need `./` or `../`\n• Case sensitivity matters on Linux/Mac\n• Check for circular dependencies\n\nWant me to help debug it? Use `/fix <description>`";

    case "debug_general":
      return "Let's debug this systematically:\n\n1. **What's the expected behavior?**\n2. **What's actually happening?**\n3. **What error messages do you see?**\n4. **What have you tried so far?**\n\nUse `/fix <code or description>` and I'll find the root cause.\n\nOr just describe the issue and I'll guide you through debugging.";

    // ═══ EXPLAIN ═══
    case "explain_js":
      return "**JavaScript** is the language of the web — it runs in every browser and on servers via Node.js.\n\n**Key concepts to master:**\n\n• **Closures** — A function remembers the variables from where it was created, even after that scope is gone. This is how callbacks work.\n\n• **The Event Loop** — JavaScript is single-threaded, but uses a queue of callbacks. `setTimeout(() => {}, 0)` doesn't run after 0ms — it runs after the current stack clears.\n\n• **Prototypal Inheritance** — Objects inherit from other objects. `class` is syntactic sugar over this.\n\n• **async/await** — Syntactic sugar over Promises. Every `async` function returns a Promise. `await` pauses execution until the Promise resolves.\n\n**Gotchas to watch:**\n- `==` vs `===` (always use `===`)\n- `this` binding depends on *how* you call a function\n- `0` and `\"0\"` are both falsy in different ways\n- `typeof null === \"object\"` — yes, this is a bug from 1996\n\nWant me to write some JavaScript?";

    case "explain_python":
      return "**Python** prioritizes readability and productivity. It's used everywhere from web dev to AI/ML.\n\n**Design philosophy:**\n• Explicit is better than implicit\n• Simple is better than complex\n• Readability counts\n\n**Modern Python tips (3.10+):**\n• Type hints: `def greet(name: str) -> str:`\n• Match statements: like switch/case but more powerful\n• Dataclasses: `@dataclass` auto-generates `__init__`, `__repr__`, etc.\n• List comprehensions: `[x*2 for x in range(10) if x % 2 == 0]`\n\n**Common gotchas:**\n• Mutable default arguments: `def f(x=[])` — the list is shared across calls!\n• Late-binding closures in loops\n• `is` vs `==` — `is` checks identity, `==` checks equality\n\nWant me to write some Python?";

    case "explain_react":
      return "**React** is a library for building UIs with components.\n\n**Core mental model:**\n• Your UI is a *function of state*: `UI = f(state)`\n• When state changes, React re-renders *only what changed* (Virtual DOM)\n\n**Hooks (React 16.8+):**\n\n• `useState(initial)` — Returns `[value, setValue]`. The setter triggers a re-render.\n• `useEffect(fn, deps)` — Runs `fn` after render. If `deps` change, it re-runs. Return a cleanup function.\n• `useCallback(fn, deps)` — Memoizes a function so it doesn't get recreated on every render.\n• `useMemo(() => val, deps)` — Memoizes a computed value.\n• `useRef(initial)` — A mutable container that doesn't trigger re-renders.\n\n**Key insight:** React doesn't watch variables for changes. Calling the setter from `useState` is what triggers a re-render. That's why you can't just mutate state directly.\n\nWant me to create a React app? Use `/react <name>`";

    case "explain_api":
      return "**API** (Application Programming Interface) — a way for different software to communicate.\n\n**REST APIs** are the most common type. They work like this:\n\n• **Resources** are things like users, posts, products — identified by URLs\n• **Actions** use HTTP methods:\n  - `GET /users` → list users\n  - `POST /users` → create a user\n  - `GET /users/1` → get user with ID 1\n  - `PUT /users/1` → update user 1\n  - `DELETE /users/1` → delete user 1\n\n• **Responses** use HTTP status codes:\n  - `200` OK\n  - `201` Created\n  - `400` Bad request (client error)\n  - `404` Not found\n  - `500` Server error\n\n• **Data** is usually JSON: `{\"name\": \"John\", \"email\": \"john@example.com\"}`\n\n**Best practices:**\n• Version your API: `/v1/users`\n• Use proper status codes\n• Validate input\n• Return consistent error formats\n• Add pagination for lists\n\nWant me to build one? Use `/api <name>`";

    case "explain_git":
      return "**Git** tracks changes to your code over time. Here's the mental model:\n\n• **Repository** = your project folder with hidden `.git` directory containing full history\n• **Commit** = a snapshot of all files at a point in time, with a message describing what changed\n• **Branch** = a parallel timeline. The default is `main`. You create branches for features/fixes.\n• **Working directory** = your current files. **Staging area** = files you've marked for commit.\n\n**Essential workflow:**\n```\ngit checkout -b feature-x   # create and switch to new branch\n# make changes...\ngit add .                   # stage all changes\ngit commit -m \"message\"     # commit staged changes\ngit push                    # upload to remote\ngit checkout main           # switch back\ngit merge feature-x         # merge feature into main\n```\n\n**Pro tip:** Commit early and often. One logical change per commit. Write descriptive messages.\n\nNeed git help? Use `/git <command>`";

    case "explain_typescript":
      return "**TypeScript** is JavaScript with static types. It catches entire categories of bugs at compile time.\n\n**Why TypeScript?**\n\n• Catch type errors before your users do\n• Better IDE support — autocomplete, refactoring, inline docs\n• Self-documenting code through types\n• Gradual adoption — any `.js` file can become `.ts`\n\n**Key concepts:**\n\n• **Interfaces** define the shape of objects: `interface User { id: number; name: string; }`\n• **Generics** let you write reusable code: `function identity<T>(arg: T): T { return arg; }`\n• **Union types**: `string | number`\n• **Optional properties**: `name?: string`\n• **Type narrowing**: `if (typeof x === \"string\") { ... }`\n\n**The trade-off:** More code up front, but fewer bugs and better tooling. Worth it for anything beyond a small script.\n\nWant me to generate TypeScript?";

    case "explain_async":
      return "**Asynchronous JavaScript** — handling operations that take time (API calls, file I/O, timers) without blocking the main thread.\n\n**The problem:** JavaScript is single-threaded. If it waited for every network request, your UI would freeze.\n\n**The solution:** The Event Loop.\n\n1. **Callbacks** (old way): `fs.readFile('file.txt', (err, data) => {...})` — leads to \"callback hell\"\n2. **Promises** (better): `fetch('/api').then(r => r.json()).then(data => {...})`\n3. **async/await** (best): \n```javascript\nasync function getData() {\n  const response = await fetch('/api');\n  const data = await response.json();\n  return data;\n}\n```\n\n**How it actually works:**\n• `async` functions always return a Promise\n• `await` pauses the function (not the thread!) until the Promise resolves\n• The event loop picks up other tasks while waiting\n• Microtasks (Promise callbacks) run before macrotasks (setTimeout, I/O)\n\n**Common mistake:** Forgetting to `await` a Promise, or using `await` outside an `async` function.\n\nWant me to write async code for you?";

    case "explain_algo":
      return "I can explain algorithms and data structures. Which one interests you?\n\n**Data Structures:**\n• Arrays — contiguous memory, O(1) index access\n• Linked Lists — O(n) access, O(1) insertion at head\n• Hash Tables — O(1) average lookup, O(n) worst\n• Trees — O(log n) for balanced trees (BST, AVL, Red-Black)\n• Graphs — nodes + edges, BFS/DFS traversal\n\n**Algorithms:**\n• Sorting — QuickSort (O(n log n) average), MergeSort (stable), BubbleSort (O(n²))\n• Searching — Binary Search (O(log n), requires sorted array)\n• Dynamic Programming — break into subproblems, cache results\n• Greedy — make locally optimal choices\n\n**Big O Notation:** Describes how runtime scales with input size:\n- O(1) — constant (hash lookup)\n- O(log n) — logarithmic (binary search)\n- O(n) — linear (iterating)\n- O(n log n) — linearithmic (good sorting)\n- O(n²) — quadratic (nested loops)\n- O(2ⁿ) — exponential (avoid if possible)\n\nWhat do you want to learn about?";

    case "explain_general":
      return "I can explain any programming or tech concept. Just tell me what you're curious about!\n\nPopular topics:\n• How does async/await work?\n• What's the difference between var, let, const?\n• How do React hooks actually work?\n• What's the event loop?\n• Explain REST vs GraphQL\n\nWhat do you want to learn?";

    // ═══ OPTIMIZE ═══
    case "optimize":
      return "I can optimize your code. Use `/optimize <code>` and I'll:\n\n• Identify bottlenecks (slow loops, repeated work)\n• Suggest better algorithms or data structures\n• Improve memory usage\n• Apply caching where appropriate\n• Modernize old patterns\n\n**Common optimizations:**\n• Replace nested loops with hash maps (O(n²) → O(n))\n• Batch database queries instead of N+1\n• Use Web Workers for CPU-intensive tasks\n• Debounce/throttle rapid events\n• Code-split large bundles\n\nWhat code do you want optimized?";

    // ═══ REVIEW ═══
    case "review":
      return "I can review your code for:\n\n• **Logic errors** — off-by-one, incorrect conditions, missing edge cases\n• **Performance** — slow operations, unnecessary re-renders, memory leaks\n• **Security** — injection vulnerabilities, exposed secrets, missing validation\n• **Best practices** — naming conventions, error handling, code organization\n• **Type safety** — potential null references, incorrect type assumptions\n\nUse `/review <code>` and I'll give you a thorough analysis.";

    // ═══ TEST ═══
    case "test":
      return "I can generate unit tests for your code. Use `/test <code>` and I'll create:\n\n• **Happy path tests** — verify normal behavior\n• **Edge cases** — empty inputs, boundary values, null/undefined\n• **Error cases** — what happens when things go wrong\n• **Descriptive test names** — so you know what failed and why\n\nGood tests give you confidence to refactor without fear. What do you want tested?";

    // ═══ SUGGEST ═══
    case "suggest":
      return "Here are some things I can help with:\n\n📦 **New project?** → `/init <name>` scaffolds a project structure\n🔌 **Need an API?** → `/api <name>` builds a REST API\n🖥️ **Building a UI?** → `/app <name>` or `/react <name>`\n🐛 **Hit a bug?** → `/fix <description>`\n📚 **Learning?** → Ask me to explain anything!\n🔍 **Want feedback?** → `/review <code>`\n\n**Pro tip:** The best way to use me is to describe what you're building, not just what command you need.";

    // ═══ ARCHITECT ═══
    case "architect":
      return "I can help design your system architecture. Use `/architect <project>` and I'll provide:\n\n• **Project structure** — folder organization and module boundaries\n• **Technology choices** — what to use and why\n• **Component design** — how pieces fit together\n• **Data flow** — how data moves through the system\n• **Scaling considerations** — what happens when you grow\n\nWhat are you building?";

    // ═══ FILES ═══
    case "files":
      return "File operations you can use:\n\n  `/ls [path]`    — List directory contents\n  `/cat <file>`   — Read file contents\n  `/touch <file>` — Create empty file\n  `/mkdir <dir>`  — Create directory\n  `/rm <path>`    — Delete file or folder\n  `/find <pat>`   — Find files by name\n  `/grep <pat>`   — Search file contents\n\nWhat do you need?";

    // ═══ PERSONAL ═══
    case "personal_status":
      return "I'm running at peak performance and ready to help you write amazing code!\n\nWhat are you working on?";

    case "joke":
      let jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
        "Q: Why did the developer go broke? A: Because he used up all his cache.",
        "Q: What's a programmer's favorite hangout? A: The Foo Bar.",
        "Q: Why do Java developers wear glasses? A: Because they can't C#.",
        "Q: What's the object-oriented way to become wealthy? A: Inheritance.",
      ];
      return jokes[Math.floor(Math.random() * jokes.length)] + "\n\nNow let's write some real code. What do you need?";

    case "fun_fact":
      let facts = [
        "The first computer bug was an actual moth found in a Harvard Mark II relay in 1947.",
        "There are over 700 programming languages in existence.",
        "JavaScript was created in just 10 days by Brendan Eich in 1995.",
        "Python's name comes from Monty Python's Flying Circus, not the snake.",
        "The first computer virus, 'Elk Cloner', was created in 1983 as a prank.",
        "Git can track up to 2^40 objects — that's about a trillion versions.",
        "The @ symbol in email addresses was chosen by Ray Tomlinson because it wasn't used elsewhere.",
        "The world's first website (info.cern.ch) is still online.",
      ];
      return facts[Math.floor(Math.random() * facts.length)] + "\n\nWant to build something?";

    case "compliment":
    case "positive_feedback":
      return "Thank you! I try my best to write code that's clean, correct, and well-thought-out.\n\nWhat would you like to build next?";

    // ═══ LEARN ═══
    case "learn":
      return "Great that you're learning! Here's my advice:\n\n**Start with Python** — clean syntax, instant feedback, huge community.\n\n**Build projects, not tutorials:**\n• A calculator → learns functions, conditionals\n• A to-do list → learns data structures, persistence\n• A web scraper → learns APIs, HTML parsing\n• A simple game → learns event loops, state management\n\n**Resources I recommend:**\n• freeCodeCamp — free, hands-on, comprehensive\n• MDN Web Docs — the definitive web reference\n• Exercism — practice with mentor feedback\n\n**The best way to use me:**\n• Ask me to explain concepts you're learning\n• Use `/explain <topic>` for deep dives\n• Generate example code with `/generate`\n\nWhat language or topic are you starting with?";

    // ═══ CODE HELP ───
    case "code_help":
      return "I see you're working with code. I can help with:\n\n  `/explain <code>` — What does it do?\n  `/fix <code>` — Find and fix bugs\n  `/optimize <code>` — Make it faster\n  `/test <code>` — Generate unit tests\n  `/review <code>` — Full code review\n\nOr just tell me what you need!";

    // ═══ QUESTION ───
    case "question":
      return "Good question! To help you best, could you tell me:\n\n• What are you trying to achieve?\n• What have you tried so far?\n• Any constraints I should know about?\n\nThen I can give you a tailored answer.";

    // ═══ SHORT ───
    case "short":
      return "Need help with something? Try being more specific! Here are some examples:\n\n• \"Build a REST API\"\n• \"Explain async/await\"\n• \"Fix this error\"\n• \"Optimize this loop\"\n• \"Create a web app\"\n\nI'm here to help!";

    // ═══ UNKNOWN ───
    case "unknown":
    default:
      return `I understand you said: "${message}"\n\nHere's what I can help with:\n\n🖥️ **Write Code** — /generate, /app, /api, /react, /python\n🐛 **Fix Bugs** — /fix, /debug\n📖 **Learn** — /explain <topic>\n🔍 **Review** — /review, /optimize\n📁 **Files** — /ls, /cat, /mkdir\n\nOr just describe what you're working on and I'll help!`;
  }
}


// ═══════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════

function chat(message, context = []) {
  if (!message || message.trim().length === 0) {
    return "Hi! I'm Open Friday. Tell me what you're working on!";
  }
  const intent = classifyIntent(message);
  const response = generateResponse(intent, message.trim());
  return response;
}

function generateCode(prompt, language) {
  const lang = detectLanguage(prompt);
  switch (lang) {
    case "python": return genPython(prompt);
    case "react": return genReact(prompt);
    case "api": return genAPI(prompt);
    case "html": return genHTML(prompt);
    case "css": return genCSS(prompt);
    case "go": return genGo(prompt);
    case "typescript": return genTypeScript(prompt);
    case "game": return genGame(prompt);
    case "cli": return genCLI(prompt);
    case "database": return genDatabase(prompt);
    default: return genJavaScript(prompt);
  }
}

function detectLanguage(p) {
  const L = p.toLowerCase();
  if (L.includes("python") || L.includes(".py") || L.includes("flask") || L.includes("django")) return "python";
  if (L.includes("react") || L.includes("jsx") || L.includes("component") && !L.includes("vue")) return "react";
  if (L.includes("api") || L.includes("rest") || L.includes("server") || L.includes("express") || L.includes("backend")) return "api";
  if (L.includes("html") || L.includes("web") || L.includes("page") || L.includes("website")) return "html";
  if (L.includes("css") || L.includes("style")) return "css";
  if (L.includes("go") || L.includes("golang")) return "go";
  if (L.includes("typescript") || L.includes(".ts") || L.includes("interface")) return "typescript";
  if (L.includes("game") || L.includes("canvas") || L.includes("arcade")) return "game";
  if (L.includes("cli") || L.includes("command") || L.includes("tool")) return "cli";
  if (L.includes("database") || L.includes("db") || L.includes("sql") || L.includes("mongo")) return "database";
  return "javascript";
}

// ─── Code Generators ───
function genHTML(prompt) {
  const title = (prompt || "My App").replace(/[^a-zA-Z0-9 ]/g, '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --bg: #0f172a;
      --text: #f1f5f9;
      --text-dim: #94a3b8;
    }
    body {
      font-family: "Inter", system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
    }
    .container { text-align: center; padding: 3rem; max-width: 600px; }
    h1 { font-size: 3.5rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 1rem; background: linear-gradient(135deg, #f1f5f9, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { font-size: 1.2rem; color: var(--text-dim); margin-bottom: 2rem; }
    .btn { display: inline-block; padding: 1rem 2.5rem; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; text-decoration: none; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3); }
    .btn:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4); }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>Built with Open Friday</p>
    <button class="btn" onclick="alert('Hello!')">Get Started</button>
  </div>
</body>
</html>`;
}

function genCSS(prompt) {
  return `/* ${prompt || 'Styles'} — Open Friday */

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #10b981;
  --accent: #f59e0b;
  --danger: #ef4444;
  --dark: #0f172a;
  --light: #f8fafc;
  --gray: #64748b;
  --radius: 8px;
  --radius-lg: 12px;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --font: "Inter", system-ui, -apple-system, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: var(--font);
  line-height: 1.6;
  color: var(--dark);
  background: var(--light);
}

.container { max-width: 1200px; margin: 0 auto; padding: 2rem; }

.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.75rem 1.5rem; background: var(--primary); color: white;
  border: none; border-radius: var(--radius); font-weight: 600; font-size: 0.95rem;
  cursor: pointer; transition: all 0.2s;
}
.btn:hover { background: var(--primary-dark); transform: translateY(-2px); }
.btn-secondary { background: var(--secondary); }
.btn-danger { background: var(--danger); }
.btn-outline { background: transparent; border: 2px solid var(--primary); color: var(--primary); }
.btn-outline:hover { background: var(--primary); color: white; }

.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }

@media (max-width: 768px) { .container { padding: 1rem; } .grid { grid-template-columns: 1fr; } }`;
}

function genJavaScript(prompt) {
  const name = (prompt || "App").replace(/[^a-zA-Z0-9_]/g, '_');
  return `/**
 * ${prompt || 'Application'} — Open Friday
 * Production-ready JavaScript
 */

"use strict";

const CONFIG = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 3000,
  debug: process.env.DEBUG === "true",
};

const logger = {
  info: (...args) => console.log(\`[\${new Date().toISOString()}] [INFO]\`, ...args),
  warn: (...args) => console.warn(\`[\${new Date().toISOString()}] [WARN]\`, ...args),
  error: (...args) => console.error(\`[\${new Date().toISOString()}] [ERROR]\`, ...args),
  debug: (...args) => CONFIG.debug && console.log(\`[\${new Date().toISOString()}] [DEBUG]\`, ...args),
};

process.on("uncaughtException", (err) => { logger.error("Uncaught:", err.message); process.exit(1); });
process.on("unhandledRejection", (reason) => { logger.error("Unhandled rejection:", reason); });

class Application {
  constructor(name) { this.name = name || "${name}"; this.isRunning = false; }
  async init() { logger.info(\`Initializing \${this.name}...\`); logger.info(\`\${this.name} initialized\`); return this; }
  start() { if (this.isRunning) { logger.warn("Already running"); return; } this.isRunning = true; logger.info(\`\${this.name} started on port \${CONFIG.port}\`); }
  stop() { this.isRunning = false; logger.info(\`\${this.name} stopped\`); }
}

module.exports = { Application, CONFIG, logger };

if (require.main === module) { new Application().init().then(app => app.start()); }`;
}

function genPython(prompt) {
  const name = (prompt || "app").replace(/[^a-zA-Z0-9_]/g, '_');
  return `#!/usr/bin/env python3
"""${prompt || 'Application'} — Open Friday"""

import os
import sys
import logging
from typing import Dict, Any

CONFIG: Dict[str, Any] = {
    "environment": os.getenv("APP_ENV", "development"),
    "debug": os.getenv("DEBUG", "false").lower() == "true",
    "port": int(os.getenv("PORT", "3000")),
}

logging.basicConfig(level=logging.DEBUG if CONFIG["debug"] else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("${name}")

class Application:
    def __init__(self, name: str = "${name}"):
        self.name = name; self.config = CONFIG
        logger.info(f"Initializing {self.name}...")

    def run(self) -> None:
        logger.info(f"{self.name} is running!")
        try:
            while True: pass
        except KeyboardInterrupt:
            logger.info("Shutting down...")

def main():
    try: app = Application(); app.run()
    except Exception as e: logger.error(f"Fatal: {e}"); sys.exit(1)

if __name__ == "__main__": main()`;
}

function genAPI(prompt) {
  const name = (prompt || "api").replace(/[^a-zA-Z0-9_]/g, '_');
  return `/** ${prompt || 'REST API'} — Open Friday */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet()); app.use(cors()); app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", service: "${name}", timestamp: new Date().toISOString() }));

app.get("/api/${name}", (req, res) => res.json({ data: [], message: "${name} API running" }));

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: process.env.NODE_ENV === "production" ? "Internal error" : err.message });
});

app.listen(PORT, () => {
  console.log(\`🚀 \${name} API on http://localhost:\${PORT}\`);
  console.log(\`📋 Health: http://localhost:\${PORT}/health\`);
});

module.exports = app;`;
}

function genReact(prompt) {
  const name = (prompt || "App").replace(/[^a-zA-Z0-9]/g, '');
  return `import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 500); }, []);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => Math.max(0, c - 1)), []);

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading...</p></div>;

  return (
    <div className="app">
      <header><h1>${name}</h1><p>Built with Open Friday</p></header>
      <main>
        <div className="card">
          <h2>Counter</h2>
          <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center" }}>
            <button onClick={decrement}>-</button>
            <span style={{ fontSize: "2rem", fontWeight: 700, minWidth: 40, textAlign: "center" }}>{count}</span>
            <button onClick={increment}>+</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;`;
}

function genGo(prompt) {
  return `// ${prompt || 'Go App'} — Open Friday\npackage main\n\nimport (\n\t"encoding/json"\n\t"log"\n\t"net/http"\n\t"os"\n\t"time"\n)\n\ntype Config struct { Port string; Env string }\n\nfunc loadConfig() Config {\n\tp := os.Getenv("PORT"); if p == "" { p = "3000" }\n\te := os.Getenv("APP_ENV"); if e == "" { e = "development" }\n\treturn Config{p, e}\n}\n\nfunc healthHandler(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set("Content-Type", "application/json")\n\tjson.NewEncoder(w).Encode(map[string]interface{}{"status":"ok","timestamp":time.Now().UTC()})\n}\n\nfunc main() {\n\tcfg := loadConfig()\n\tmux := http.NewServeMux()\n\tmux.HandleFunc("/health", healthHandler)\n\tlog.Printf("Starting on port %s [%s]", cfg.Port, cfg.Env)\n\tlog.Fatal(http.ListenAndServe(":"+cfg.Port, mux))\n}`;
}

function genTypeScript(prompt) {
  const name = (prompt || "App").replace(/[^a-zA-Z0-9]/g, '');
  return `/** ${prompt || 'Application'} — Open Friday */

interface Config { port: number; environment: "development" | "production"; }

class Application {
  private config: Config;
  constructor(config?: Partial<Config>) {
    this.config = { port: config?.port ?? 3000, environment: config?.environment ?? "development" };
  }
  async init(): Promise<void> { console.log(\`Initializing ${name}...\`); }
  start(): void { console.log(\`Server on port \${this.config.port}\`); }
}

class AppError extends Error {
  constructor(message: string, public readonly statusCode = 500, public readonly code = "INTERNAL_ERROR") {
    super(message); this.name = "AppError";
  }
}

export { Application, Config, AppError };

if (require.main === module) { new Application().init().then(a => a.start()); }`;
}

function genGame(prompt) {
  return `/** ${prompt || 'Game'} — Open Friday */

const c = document.getElementById("game")||document.body.appendChild(Object.assign(document.createElement("canvas"),{width:800,height:600,id:"game"}));
const ctx = c.getContext("2d");
const s = { p: { x: 400, y: 300, s: 20 }, e: [], sc: 0, lives: 3, go: false, keys: {}, f: 0 };
document.addEventListener("keydown", e => { s.keys[e.key] = true; if (e.key === " " && s.go) { s.e = []; s.sc = 0; s.lives = 3; s.go = false; } });
document.addEventListener("keyup", e => { s.keys[e.key] = false; });

function update() {
  s.f++; if (s.go) return;
  const p = s.p;
  if (s.keys["ArrowLeft"] || s.keys["a"]) p.x -= 5;
  if (s.keys["ArrowRight"] || s.keys["d"]) p.x += 5;
  if (s.keys["ArrowUp"] || s.keys["w"]) p.y -= 5;
  if (s.keys["ArrowDown"] || s.keys["s"]) p.y += 5;
  p.x = Math.max(10, Math.min(790, p.x)); p.y = Math.max(10, Math.min(590, p.y));
  if (s.f % 60 === 0) s.e.push({ x: Math.random() * 770, y: -20, s: 16 + Math.random() * 14, sp: 1.5 + Math.random() * 2.5 });
  s.e = s.e.filter(e => {
    e.y += e.sp;
    const d = Math.hypot(p.x - e.x, p.y - e.y);
    if (d < 25) { s.lives--; if (s.lives <= 0) s.go = true; return false; }
    return e.y < 630;
  });
  s.sc++;
}

function draw() {
  ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = "#6366f1"; ctx.shadowColor = "#6366f1"; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(s.p.x, s.p.y, s.p.s, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = "#ef4444";
  s.e.forEach(e => { ctx.fillRect(e.x - e.s/2, e.y - e.s/2, e.s, e.s); });
  ctx.fillStyle = "white"; ctx.font = "bold 20px monospace";
  ctx.fillText("Score: " + s.sc, 20, 40);
  ctx.fillText("Lives: " + "♥".repeat(s.lives), 20, 70);
  if (s.go) {
    ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = "white"; ctx.font = "bold 48px monospace"; ctx.textAlign = "center";
    ctx.fillText("Game Over", 400, 270); ctx.font = "24px monospace";
    ctx.fillText("Score: " + s.sc, 400, 320);
    ctx.fillStyle = "#94a3b8"; ctx.font = "18px monospace";
    ctx.fillText("Press SPACE to restart", 400, 370);
  }
}
setInterval(() => { update(); draw(); }, 1000 / 60);
console.log("Game loaded! WASD/Arrows to move.");`;
}

function genCLI(prompt) {
  return `#!/usr/bin/env node
"use strict";
const HELP = \`Usage: ${prompt || 'cli-tool'} [command]

Commands:
  init    Initialize project
  build   Build project
  help    Show help\`;

const cmd = process.argv[2] || "help";
switch (cmd) {
  case "init": console.log("Initializing..."); break;
  case "build": console.log("Building..."); break;
  default: console.log(HELP);
}`;
}

function genDatabase(prompt) {
  const L = (prompt || "").toLowerCase();
  if (L.includes("mongo") || L.includes("mongodb")) {
    return `const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("${(prompt||'Item').replace(/[^a-zA-Z0-9]/g,'')}", schema);`;
  }
  return `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);`;
}

// ═══════════════════════════════════════════════
// AI COMMAND INTERPRETER
// Understands unregistered commands via NLP
// ═══════════════════════════════════════════════

/**
 * Intent definitions for understanding unregistered commands.
 * 
 * Each intent has:
 *   - triggers: array of phrases that strongly suggest this intent (higher priority = earlier in array)
 *   - cmd: the command to execute
 *   - strip: array of words to remove from input when extracting args
 *   - priority: higher = checked first (0-100)
 */
const COMMAND_INTENTS = [
  // ─── Core / Auth ─── (highest priority)
  { triggers: ["exit","quit","close"], strip: ["exit","quit","close","please","just"], cmd: "exit", priority: 100 },
  { triggers: ["login","sign in"], strip: ["login","sign in","please"], cmd: "login", priority: 100 },
  { triggers: ["logout","sign out"], strip: ["logout","sign out"], cmd: "logout", priority: 100 },
  { triggers: ["help","commands","what can i do","how to"], strip: ["help","show","commands","please"], cmd: "help", priority: 100 },
  { triggers: ["clear","clean screen","cls"], strip: ["clear","clean","screen"], cmd: "clear", priority: 100 },
  { triggers: ["whoami","who am i","my profile","account info"], strip: ["whoami","my","profile","account","info","show","me"], cmd: "whoami", priority: 90 },
  { triggers: ["time","date","current time"], strip: ["time","date","current","show","me","what","is"], cmd: "time", priority: 90 },
  { triggers: ["config","settings","preferences","setup"], strip: ["config","settings","show","my"], cmd: "config", priority: 80 },

  // ─── Code Gen ───
  { triggers: ["create api","make api","build api","rest api","create a rest","make a rest","build a rest"], strip: ["create","make","build","a","an","rest","api"], cmd: "api", priority: 90 },
  { triggers: ["api","rest","server","backend"], strip: ["create","make","build","a","an","new"], cmd: "api", priority: 70 },
  { triggers: ["create web","make web","build web","make website","create website","build website","web app","website","html page"], strip: ["create","make","build","a","an","new","web","website","app","page","html","frontend"], cmd: "app", priority: 90 },
  { triggers: ["web","website","html","page","frontend","landing"], strip: ["create","make","build","a","an"], cmd: "app", priority: 70 },
  { triggers: ["react app","react component","create react","make react","build react"], strip: ["create","make","build","a","an","new","app","component","react"], cmd: "react", priority: 90 },
  { triggers: ["react"], strip: ["create","make","build","install"], cmd: "react", priority: 70 },
  { triggers: ["python script","create python","write python","make python"], strip: ["create","make","write","a","an","new","python","script"], cmd: "python", priority: 90 },
  { triggers: ["python","py script",".py"], strip: ["create","make","write","run","a"], cmd: "python", priority: 60 },
  { triggers: ["go program","go app","golang","create go","write go"], strip: ["create","write","make","a","an","new","go","golang","program","app"], cmd: "go", priority: 80 },
  { triggers: ["node project","nodejs","express app","create node","make node"], strip: ["create","make","a","an","new","node","nodejs","express","project"], cmd: "node", priority: 80 },

  // ─── Smart ───
  { triggers: ["explain how","what is","how does","what does","explain this","tell me about","define","describe"], strip: ["explain","tell","me","about","what","is","are","does","define","describe","how","this","please"], cmd: "explain", priority: 90 },
  { triggers: ["explain"], strip: ["please"], cmd: "explain", priority: 60 },
  { triggers: ["fix this","fix bug","fix error","debug this","bug fix","not working","broken","doesn't work"], strip: ["fix","this","debug","the","a","please","not","working","doesn't"], cmd: "fix", priority: 90 },
  { triggers: ["fix","debug","bug","error","crash","repair"], strip: ["please","the","a","my","for"], cmd: "fix", priority: 70 },
  { triggers: ["optimize this","optimize code","make faster","improve performance","refactor this"], strip: ["optimize","this","make","faster","improve","the","code","performance","refactor","please"], cmd: "optimize", priority: 80 },
  { triggers: ["optimize","refactor","performance"], strip: ["the","my","code"], cmd: "optimize", priority: 60 },
  { triggers: ["review this","review code","code review","audit this","check my code"], strip: ["review","this","code","audit","my","check","the","please"], cmd: "review", priority: 80 },
  { triggers: ["review","audit"], strip: ["my","code"], cmd: "review", priority: 60 },
  { triggers: ["test this","test code","unit test","generate test"], strip: ["test","this","code","unit","generate","the","please"], cmd: "test", priority: 80 },
  { triggers: ["suggest","recommend","give me ideas","what should i"], strip: ["suggest","recommend","give","me","ideas","what","should","i"], cmd: "suggest", priority: 80 },
  { triggers: ["architect","design system","system design","plan architecture"], strip: ["architect","design","system","plan","the","please"], cmd: "architect", priority: 80 },

  // ─── Files ───
  { triggers: ["list files","show files","what's here","list directory","dir"], strip: ["list","show","files","whats","here","directory"], cmd: "ls", priority: 80 },
  { triggers: ["read file","show file","open file","view file","cat"], strip: ["read","show","open","view","the","file","cat","please"], cmd: "cat", priority: 80 },
  { triggers: ["create folder","make folder","new folder","create directory","mkdir"], strip: ["create","make","new","a","folder","directory"], cmd: "mkdir", priority: 80 },
  { triggers: ["create file","make file","new file","touch"], strip: ["create","make","new","a","file"], cmd: "touch", priority: 80 },
  { triggers: ["delete file","remove file","delete folder","rm"], strip: ["delete","remove","the","file","folder"], cmd: "rm", priority: 80 },
  { triggers: ["find file","search file","locate","find"], strip: ["find","search","locate","for","the","file"], cmd: "find", priority: 70 },

  // ─── System ───
  { triggers: ["run command","execute","run","shell","terminal command"], strip: ["run","execute","a","command","shell","terminal","please"], cmd: "run", priority: 80 },
  { triggers: ["show ip","my ip","ip address","network","show my ip","what is my ip","what's my ip"], strip: ["show","my","ip","address","network","me","what","is","what's","the","please"], cmd: "ip", priority: 95 },
  { triggers: ["processes","running tasks","task list","ps"], strip: ["show","list","running","the","tasks"], cmd: "ps", priority: 70 },
  { triggers: ["current directory","where am i","pwd","print working dir"], strip: ["current","directory","where","am","i"], cmd: "pwd", priority: 80 },
  { triggers: ["change dir","go to folder","cd","navigate to","go to"], strip: ["change","dir","go","to","folder","navigate","cd"], cmd: "cd", priority: 80 },

  // ─── Git ───
  { triggers: ["git","github","git commit","git push","git pull","git branch"], strip: ["run","do","a"], cmd: "git", priority: 70 },
];

/**
 * Interpret natural language as a command + args.
 * Uses priority-based intent matching.
 * 
 * @param {string} text - Input like "make a rest api" or "fix my code"
 * @returns {Object|null} - { command: string, args: string } or null
 */
function interpretCommand(text) {
  if (!text || !text.trim()) return null;
  const lower = text.toLowerCase().trim();

  // Sort intents by priority (highest first)
  const sorted = [...COMMAND_INTENTS].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const intent of sorted) {
    // Check each trigger phrase
    for (const trigger of intent.triggers) {
      const tLower = trigger.toLowerCase();
      
      // Check for exact match, starts-with, or contains at word boundary
      let matched = false;
      if (lower === tLower) {
        matched = true;  // Exact match
      } else if (lower.startsWith(tLower + " ") || lower.startsWith(tLower + "'")) {
        matched = true;  // Starts with trigger
      } else if (lower.includes(" " + tLower + " ") || lower.includes(" " + tLower + "'")) {
        matched = true;  // Contains at word boundary
      } else if (lower.endsWith(" " + tLower) || lower.endsWith(" " + tLower + "'")) {
        matched = true;  // Ends with trigger
      }
      
      if (matched) {
        // Extract args: remove trigger and strip words from the remaining text
        let remaining = text;
        
        // Remove the trigger from the text
        const triggerIdx = remaining.toLowerCase().indexOf(trigger.toLowerCase());
        if (triggerIdx >= 0) {
          remaining = remaining.slice(0, triggerIdx) + remaining.slice(triggerIdx + trigger.length);
        }
        
        // Remove strip words
        if (intent.strip) {
          for (const word of intent.strip) {
            const re = new RegExp("\\b" + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", 'gi');
            remaining = remaining.replace(re, '');
          }
        }
        
        // Clean up extra spaces
        remaining = remaining.replace(/\s+/g, ' ').trim();
        
        return { command: intent.cmd, args: remaining };
      }
    }
  }

  return null;
}

/**
 * Generate a reply from a conversation history (messages array format).
 * @param {Array} messages - Array of { role, content } objects
 * @returns {string} Generated reply text
 */
function generateReply(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "Hi! I'm Open Friday. Tell me what you're working on!";
  }
  // Extract the last user message and reply via the chat function
  const lastUserMsg = messages.filter(m => m.role === "user").pop();
  const text = lastUserMsg ? lastUserMsg.content : messages[messages.length - 1].content;
  return chat(text);
}

module.exports = { IDENTITY, chat, generateCode, generateReply, interpretCommand };