# 🤖 Open Friday

**Your Advanced AI Coding Companion** — like Claude Code in your terminal.

Write code, build apps, fix bugs, and explain concepts — all from your terminal with 40+ slash commands.

---

## 🚀 One-Command Install

### Windows (PowerShell)
```powershell
irm https://samkomedved319-dev.github.io/OpenFriday/install.ps1 | iex
```

### macOS / Linux
```bash
curl -fsSL https://samkomedved319-dev.github.io/OpenFriday/install.sh | sh
```

### Manual Install (any platform)
```bash
# Clone the repo
git clone https://github.com/samkomedved319-dev/OpenFriday.git
cd OpenFriday

# Install globally
npm link

# Run it
openfriday
```

---

## 📋 Requirements

- **Node.js** v16 or higher ([download](https://nodejs.org))
- **Git** (for cloning, or download the ZIP)
- Works on **Windows**, **macOS**, and **Linux**

---

## 🎮 Usage

```bash
openfriday
```

The first time you run it, Open Friday will:
1. Open your browser to the login page
2. Create an account or log in
3. Automatically redirect back to your terminal
4. Start the interactive session

### Slash Commands

| Category | Commands |
|----------|----------|
| 🔐 **Auth** | `/login`, `/logout`, `/register`, `/profile` |
| 💻 **Code Gen** | `/generate`, `/app`, `/api`, `/react`, `/python`, `/go`, `/node` |
| 🧠 **Smart** | `/explain`, `/fix`, `/optimize`, `/review`, `/test`, `/debug`, `/suggest`, `/architect` |
| 📁 **Files** | `/ls`, `/cat`, `/mkdir`, `/touch`, `/rm`, `/find`, `/grep` |
| ⚡ **System** | `/run`, `/open`, `/explorer`, `/ip`, `/ps`, `/pwd`, `/cd` |
| 🛠️ **Project** | `/git`, `/init`, `/install` |
| 🔧 **Utils** | `/time`, `/hash` |

### Natural Chat

You can also just talk naturally:

```
> create a REST API
> fix this bug
> explain React components
> optimize this code
> what can you do?
```

---

## 🧠 Persistent Memory (Obsidian Vault)

Open Friday comes with an integrated **Obsidian Vault** as its long-term memory:

- **Every conversation auto-saves** to `OpenFriday/Memory/` as timestamped markdown notes
- **On every login**, all vault notes are loaded as AI context — the AI remembers everything across sessions
- **`/memory` command**: `list`, `search <q>`, `save <topic> <detail>`, `summary`
- **Open the vault** in [Obsidian](https://obsidian.md) to browse, edit, or link your AI's memories

```
OpenFriday/Memory/
├── 2026-05-20_14-30-00_User_What-is-the-capital.md
├── 2026-05-20_14-30-05_AI_The-capital-of-France-is.md
└── 2026-05-20_14-31-00_project-preferences.md
```

---

## 🔌 AI Providers

Configure via the dashboard or `/config` command:

| Provider | Models | API Key Required |
|----------|--------|-----------------|
| **OpenAI** | GPT-4, GPT-3.5 | ✅ |
| **Anthropic** | Claude 3.5, Claude 3 | ✅ |
| **Google** | Gemini Pro | ✅ |
| **DeepSeek** | DeepSeek Coder | ✅ |
| **Cohere** | Command R | ✅ |
| **Mistral** | Mistral Large | ✅ |
| **Ollama** | Local models | ❌ (local) |
| **LM Studio** | Local models | ❌ (local) |
| **GodCoder** | Built-in AI | ❌ (built-in) |

---

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | Built-in AI, 40+ commands, local operation |
| **Pro** | $9/mo | All AI providers, GPT-4/Claude, unlimited generation |
| **Enterprise** | $49/mo | Custom models, team collaboration, API access |

---

## 🌐 Web Dashboard

Dashboard available at: [samkomedved319-dev.github.io/OpenFriday](https://samkomedved319-dev.github.io/OpenFriday/login.html)

Features:
- Login / Sign Up
- API Configuration
- Profile management
- Plan selection

---

## 🏗️ Architecture

Full system diagrams in [`docs/architecture.md`](docs/architecture.md) — Mermaid graphs showing:
- CLI routing flow (commands vs natural language)
- AI provider system (Ollama / OpenRouter / fallback)
- Obsidian Vault memory integration
- Autonomous agent loop
- Startup and data flow sequences

---

## 🏗️ Built With

- **Node.js** — Runtime
- **readline** — Terminal interface
- **Vanilla JS** — No external dependencies
- **CSS3** — Premium dark theme with glass-morphism

---

## 📄 License

MIT License — use it, modify it, share it.

Built with ❤️ for developers everywhere.