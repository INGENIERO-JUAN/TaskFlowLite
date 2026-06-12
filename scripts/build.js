import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const srcServer = path.join(rootDir, "src/server/index.js");
const destServerDir = path.join(rootDir, "build/server");
const destServer = path.join(destServerDir, "index.js");

// 1. Ejecutar Vite build
console.log("[Build] Running vite build...");
execSync("npx vite build", { stdio: "inherit", cwd: rootDir });

// 2. Copiar el servidor de producción a build/server/index.js
console.log("[Build] Setting up production server bundle...");
if (!fs.existsSync(destServerDir)) {
  fs.mkdirSync(destServerDir, { recursive: true });
}

fs.copyFileSync(srcServer, destServer);
console.log(`[Build] Production server file copied successfully to ${destServer}`);
