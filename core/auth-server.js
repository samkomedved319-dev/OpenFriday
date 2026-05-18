/**
 * Open Friday — Login Auth Server
 * Serves the login flow on port 3456 for browser-based authentication.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

const PORT = 3456;
const SESSION_PATH = path.join(__dirname, "session.json");

/**
 * Start the login HTTP server.
 * @param {Object} rl - readline interface (optional, for keypress events)
 * @returns {Promise<http.Server>} The HTTP server instance
 */
function start(rl) {
  return new Promise((resolve) => {
    const W = path.join(__dirname, "..", "webui");

    const server = http.createServer((req, res) => {
      // Handle auth callback from login page
      if (req.url.startsWith("/auth-callback")) {
        const u = new URL(req.url, `http://localhost:${PORT}`);
        const n = u.searchParams.get("name") || "User";
        const e = u.searchParams.get("email") || "user";
        try {
          fs.writeFileSync(
            SESSION_PATH,
            JSON.stringify(
              { userId: Date.now(), email: e, name: n, loginAt: new Date().toISOString() },
              null,
              2
            )
          );
        } catch (ex) {
          // Ignore write errors
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<!DOCTYPE html>
<body style="background:#08080e;color:#00d4aa;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;">
  <div>
    <h1>✓ Authenticated!</h1>
    <p style="color:#8888aa;">Welcome ${n}. Close this tab.</p>
    <script>window.close()</script>
  </div>
</body>`);
        return;
      }

      // Serve login page
      if (req.url === "/" || req.url === "/login.html") {
        const lf = path.join(W, "login.html");
        if (fs.existsSync(lf)) {
          let h = fs.readFileSync(lf, "utf8");
          h = h.replace(
            "</body>",
            `<script>
const hL=handleLogin;handleLogin=function(e){e.preventDefault();const em=document.getElementById('loginEmail').value;window.location.href='/auth-callback?name='+encodeURIComponent(em.split('@')[0])+'&email='+encodeURIComponent(em);};
const hR=handleRegister;handleRegister=function(e){e.preventDefault();const nm=document.getElementById('registerName').value;const em=document.getElementById('registerEmail').value;window.location.href='/auth-callback?name='+encodeURIComponent(nm)+'&email='+encodeURIComponent(em);};
</script></body>`
          );
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(h);
          return;
        }
      }

      // Serve static assets
      const ex = path.extname(req.url);
      if (ex === ".css" || ex === ".js") {
        const fp = path.join(W, req.url.replace(/^\//, ""));
        if (fs.existsSync(fp)) {
          res.writeHead(200, {
            "Content-Type": ex === ".css" ? "text/css" : "application/javascript",
          });
          res.end(fs.readFileSync(fp));
          return;
        }
      }

      res.writeHead(404);
      res.end("Not found");
    });

    server.listen(PORT, () => resolve(server));
  });
}

/**
 * Wait for the user to complete login (poll session.json).
 * @returns {Promise<Object>} The user session object
 */
function waitForLogin() {
  return new Promise((resolve) => {
    const sp = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let i = 0;
    const si = setInterval(() => {
      process.stdout.write(`\r${sp[i % 10]} Waiting...`);
      i++;
    }, 100);

    const poll = () => {
      try {
        const d = JSON.parse(fs.readFileSync(SESSION_PATH, "utf8"));
        if (d.email) {
          clearInterval(si);
          process.stdout.write("\r" + " ".repeat(30) + "\r");
          resolve(d);
          return;
        }
      } catch (ex) {
        // File not ready yet
      }
      setTimeout(poll, 500);
    };
    poll();
  });
}

module.exports = { start, waitForLogin, PORT };
