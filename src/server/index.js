import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve(__dirname, "../../dist");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
};

const server = http.createServer((req, res) => {
  // Petición de sanidad básica
  const reqUrl = req.url || "/";
  let filePath = path.join(DIST_DIR, reqUrl === "/" ? "index.html" : reqUrl);

  // Impedir directory traversal attacks
  if (!filePath.startsWith(DIST_DIR)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext.toLowerCase()] || "application/octet-stream";

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Si el archivo no existe, caemos en index.html para soportar SPA client-side routing
      filePath = path.join(DIST_DIR, "index.html");
      const htmlContentType = MIME_TYPES[".html"];

      fs.readFile(filePath, (htmlErr, htmlContent) => {
        if (htmlErr) {
          res.statusCode = 500;
          res.end("Internal Server Error");
        } else {
          res.writeHead(200, { "Content-Type": htmlContentType });
          res.end(htmlContent);
        }
      });
      return;
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.statusCode = 500;
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
        });
        res.end(content);
      }
    });
  });
});

server.listen(Number(PORT), "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`[Frontend Server] Running at http://0.0.0.0:${String(PORT)}`);
});
