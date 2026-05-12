async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeOut(text, { minDelay = 3, maxDelay = 10 } = {}) {
  for (const ch of text) {
    process.stdout.write(ch);
    const jitter = minDelay + Math.floor(Math.random() * (maxDelay - minDelay + 1));
    await sleep(jitter);
  }
  process.stdout.write("\n");
}

module.exports = {
  typeOut,
};
