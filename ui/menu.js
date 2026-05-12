const readline = require("readline");
const { bold, cyan, gray } = require("../utils/format");

function clearMenuLines(count) {
  for (let i = 0; i < count; i += 1) {
    process.stdout.write("\x1b[1A");
    process.stdout.write("\x1b[2K");
  }
}

function renderMenu(commands, selected, query) {
  const visibleWindow = 12;
  const start = Math.max(0, Math.min(selected - 5, Math.max(0, commands.length - visibleWindow)));
  const end = Math.min(commands.length, start + visibleWindow);
  const visible = commands.slice(start, end);

  const lines = [];
  lines.push(cyan(bold("Command Menu")));
  lines.push(gray("Use ↑ ↓ and Enter. Esc to cancel."));
  lines.push(gray(`Filter: /${query}`));
  lines.push(gray(`Showing ${visible.length} of ${commands.length}\n`));

  visible.forEach((cmd, idx) => {
    const actualIdx = start + idx;
    const marker = actualIdx === selected ? cyan("❯") : " ";
    const name = actualIdx === selected ? bold(cmd.name) : cmd.name;
    lines.push(`${marker} ${name}`);
  });

  lines.push("");
  lines.push(gray("Preview:"));
  lines.push(`  ${commands[selected].preview}`);

  process.stdout.write(`${lines.join("\n")}\n`);
  return lines.length;
}

function filterCommands(commands, query) {
  if (!query) return commands;
  const needle = query.toLowerCase();
  return commands.filter((cmd) => cmd.name.toLowerCase().includes(needle));
}

async function openCommandMenu(commands, initialQuery = "") {
  return new Promise((resolve) => {
    let query = initialQuery.trim().replace(/^\//, "");
    let filtered = filterCommands(commands, query);
    let selected = 0;

    if (filtered.length === 0) {
      filtered = commands;
      query = "";
    }

    let lineCount = renderMenu(filtered, selected, query);

    const onKeypress = (str, key) => {
      if (!key) return;

      if (key.name === "up") {
        selected = (selected - 1 + filtered.length) % filtered.length;
      } else if (key.name === "down") {
        selected = (selected + 1) % filtered.length;
      } else if (key.name === "return") {
        cleanup();
        resolve(filtered[selected].name);
        return;
      } else if (key.name === "backspace") {
        query = query.slice(0, -1);
        filtered = filterCommands(commands, query);
        selected = 0;
        if (filtered.length === 0) {
          filtered = commands;
          query = "";
        }
      } else if (key.name === "escape" || (key.ctrl && key.name === "c")) {
        cleanup();
        resolve(null);
        return;
      } else if (str && /^[a-z0-9\-]$/i.test(str)) {
        query += str;
        filtered = filterCommands(commands, query);
        selected = 0;
        if (filtered.length === 0) {
          filtered = commands;
          query = "";
        }
      } else {
        return;
      }

      clearMenuLines(lineCount);
      lineCount = renderMenu(filtered, selected, query);
    };

    function cleanup() {
      process.stdin.off("keypress", onKeypress);
      clearMenuLines(lineCount);
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.on("keypress", onKeypress);
  });
}

module.exports = {
  openCommandMenu,
};
