import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 📍 Ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Ruta a password-manager-local (misma carpeta que el script)
const appDir = path.join(__dirname, "password-manager-local");

console.log("🚀 Iniciando Password Manager Local (DEV)");
console.log("📂 Ejecutando en:", appDir);
console.log("🛠️  Ejecutando: pnpm dev");

const p = spawn("pnpm", ["dev"], {
  cwd: appDir,          // 👈 AQUÍ está la clave
  stdio: "inherit",
  shell: true
});

p.on("exit", (code) => {
  console.log("⛔ Proceso terminado con código:", code);
});
