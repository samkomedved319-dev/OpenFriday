const { requestAssistant } = require("./llm");
const { SYSTEM_PROMPT } = require("../utils/constants");

function createSession() {
  return [{ role: "system", content: SYSTEM_PROMPT }];
}

function buildPrompt(command, input) {
  if (!command) return input;

  if (command === "/explain") {
    return `Explain the following in a clean, structured way:\n\n${input}`;
  }
  if (command === "/generate") {
    return `Generate production-quality code for this request. Include short explanation and code block:\n\n${input}`;
  }
  if (command === "/fix") {
    return `Diagnose and fix this issue. Include cause, fix, and example patch/code:\n\n${input}`;
  }

  if (command.startsWith("/generate-")) {
    const lang = command.replace("/generate-", "").toUpperCase();
    return `Generate high-quality ${lang} code for this request. Include brief explanation and code block:\n\n${input}`;
  }

  if (command.startsWith("/stack-")) {
    const stack = command.replace("/stack-", "");
    return `Answer as a senior ${stack} engineer. Provide practical guidance, pitfalls, and concrete examples:\n\n${input}`;
  }

  if (command.startsWith("/")) {
    return `Apply command ${command} to this developer request. Use structured and practical output:\n\n${input}`;
  }

  return input;
}

async function getAssistantReply(session, command, userInput) {
  const prompt = buildPrompt(command, userInput);
  session.push({ role: "user", content: prompt });
  const answer = await requestAssistant(session);
  session.push({ role: "assistant", content: answer });
  return answer;
}

module.exports = {
  createSession,
  getAssistantReply,
};
