import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname);
const port = process.env.PORT || 4173;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url).pathname || "/";
  let filePath;

  if (reqUrl === "/") {
    filePath = path.join(root, "index.html");
  } else {
    filePath = path.join(root, reqUrl);
  }

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || "application/octet-stream";

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500);
        res.end("Server error");
        return;
      }

      res.writeHead(200, { "Content-Type": type });
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("Open the browser to play.");
});
