import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(name, cmd, args, cwd) {
  const p = spawn(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  });

  p.on("error", (err) => {
    console.error(`❌ ${name} error`, err);
  });

  return p;
}

console.log("🔥 Iniciando Password Manager Local");

// 1️⃣ Backend
run(
  "backend",
  "node",
  ["dist/index.mjs"],
  path.join(__dirname, "apps/backend")
);

// 2️⃣ Frontend (preview, NO dev)
run(
  "frontend",
  "pnpm",
  ["preview", "--host", "127.0.0.1", "--port", "5173"],
  path.join(__dirname, "apps/frontend")
);

console.log("🌐 Abre: http://127.0.0.1:5173");
