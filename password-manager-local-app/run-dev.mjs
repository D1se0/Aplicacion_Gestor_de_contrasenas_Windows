import { spawn } from "node:child_process";

console.log("🚀 Iniciando Password Manager Local (DEV)");
console.log("🛠️  Ejecutando: pnpm tauri dev");

const p = spawn("pnpm", ["tauri", "dev"], {
  stdio: "inherit",
  shell: true
});

p.on("exit", (code) => {
  console.log("⛔ Proceso terminado con código:", code);
});
