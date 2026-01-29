import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Detectar si estamos en Tauri / pkg / exe
export function getAppRoot() {
    // Cuando se ejecuta empaquetado (Tauri / exe)
    if (process.env.TAURI === "true" || process.env.TAURI_DEBUG === "true") {
        return path.resolve(__dirname, "../../..");
    }
    // Dev normal (pnpm dev)
    return process.cwd();
}
