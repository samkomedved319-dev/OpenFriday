function color(text, code) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

function cyan(text) {
  return color(text, 36);
}

function gray(text) {
  return color(text, 90);
}

function green(text) {
  return color(text, 32);
}

function yellow(text) {
  return color(text, 33);
}

function bold(text) {
  return color(text, 1);
}

function separator() {
  return gray("─".repeat(Math.max(40, process.stdout.columns || 80)));
}

function sanitizeAIResponse(text) {
  if (typeof text !== "string" || !text) return text;
  let t = text;
  t = t.replace(/```[\s\S]*?```/g, "");
  t = t.replace(/`([^`]+)`/g, "$1");
  t = t.replace(/\n\s*\n+/g, "\n\n");
  return t.trim();
}

module.exports = {
  cyan,
  gray,
  green,
  yellow,
  bold,
  separator,
  sanitizeAIResponse,
};
