async function post(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

document.getElementById('generateBtn').addEventListener('click', async () => {
  const prompt = document.getElementById('prompt').value;
  const resp = await post('/api/generate', { prompt, language: 'js' });
  const log = document.getElementById('log');
  log.textContent = resp.code;
});

document.getElementById('createApp').addEventListener('click', async () => {
  const resp = await post('/api/create-app', { name: 'openfriday-web' });
  const log = document.getElementById('log');
  log.textContent = 'App created at ' + resp.path;
});
