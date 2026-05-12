const CORE_COMMANDS = [
  { name: "/help", preview: "Show all commands and usage tips." },
  { name: "/clear", preview: "Clear the terminal and reset conversation context." },
  { name: "/exit", preview: "Gracefully close Open Friday." },
  { name: "/explain", preview: "Explain code in a clear and structured way." },
  { name: "/generate", preview: "Generate code from your requirements." },
  { name: "/fix", preview: "Diagnose an issue and suggest a practical fix." },
];

const EXTRA_COMMAND_NAMES = [
  "analyze",
  "review",
  "refactor",
  "optimize",
  "debug",
  "test",
  "document",
  "summarize",
  "plan",
  "scaffold",
  "audit",
  "secure",
  "profile",
  "lint",
  "format",
  "migrate",
  "deploy",
  "rollback",
  "design",
  "compare",
  "translate",
  "cleanup",
  "edgecases",
  "roadmap",
  "changelog",
  "commitmsg",
  "prdesc",
  "release",
  "observability",
  "incident",
];

const LANGS = [
  "js",
  "ts",
  "py",
  "go",
  "java",
  "rust",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "bash",
  "powershell",
];

const STACKS = [
  "react",
  "nextjs",
  "node",
  "express",
  "nestjs",
  "django",
  "flask",
  "fastapi",
  "spring",
  "laravel",
  "rails",
  "docker",
  "k8s",
  "aws",
  "azure",
  "gcp",
  "postgres",
  "mysql",
  "mongodb",
  "redis",
];

const TASKS = [
  "snippet",
  "boilerplate",
  "api",
  "query",
  "unit-test",
  "integration-test",
  "e2e-test",
  "bugfix",
  "feature",
  "schema",
  "endpoint",
  "middleware",
  "cli",
  "config",
  "pipeline",
];

const generated = [];

for (const base of EXTRA_COMMAND_NAMES) {
  generated.push({
    name: `/${base}`,
    preview: `Run advanced ${base} assistance on your prompt.`,
  });
}
for (const lang of LANGS) {
  generated.push({
    name: `/generate-${lang}`,
    preview: `Generate high-quality ${lang.toUpperCase()} code from a prompt.`,
  });
}
for (const stack of STACKS) {
  generated.push({
    name: `/stack-${stack}`,
    preview: `Give best-practice coding guidance for ${stack}.`,
  });
}
for (const task of TASKS) {
  for (const lang of LANGS.slice(0, 5)) {
    generated.push({
      name: `/${task}-${lang}`,
      preview: `Create a ${task} example in ${lang.toUpperCase()}.`,
    });
  }
}

const uniq = new Map();
for (const cmd of [...CORE_COMMANDS, ...generated]) {
  uniq.set(cmd.name, cmd);
}

const COMMANDS = Array.from(uniq.values());

function helpText() {
  return [
    `Available commands (${COMMANDS.length} total):`,
    ...COMMANDS.map((cmd) => `  ${cmd.name.padEnd(10)} ${cmd.preview}`),
  ].join("\n");
}

module.exports = {
  COMMANDS,
  helpText,
};
