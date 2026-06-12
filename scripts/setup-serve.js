import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const binDir = path.join(rootDir, "node_modules/.bin");
const binPath = path.join(binDir, "react-router-serve");

console.log("[Postinstall] Creating react-router-serve shim in node_modules/.bin...");

if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

// Script ejecutable que simplemente carga el script de Node.js provisto como argumento
const scriptContent = `#!/usr/bin/env node
import { resolve } from "path";
import { pathToFileURL } from "url";

const targetPath = resolve(process.argv[2]);
import(pathToFileURL(targetPath).href).catch(err => {
  console.error("[react-router-serve Shim Error]:", err);
  process.exit(1);
});
`;

fs.writeFileSync(binPath, scriptContent, { mode: 0o755 });
console.log(`[Postinstall] Shim written successfully to ${binPath}`);
