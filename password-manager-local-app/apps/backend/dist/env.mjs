import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
// ============================
// 🌱 Solo carga .env en dev
// ============================
dotenv.config();
// ============================
// 📍 Utils ESM
// ============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ============================
// 📦 Detectar entorno empaquetado
// ============================
const isPkg = typeof process.pkg !== "undefined" ||
    process.env.TAURI === "true" ||
    process.env.TAURI_DEBUG === "true";
// ============================
// 🏠 Raíz REAL de la app
// ============================
function getAppRoot() {
    if (isPkg) {
        // exe / tauri → carpeta del ejecutable
        return path.dirname(process.execPath);
    }
    // dev → raíz del proyecto (no cwd)
    return path.resolve(__dirname, "../../..");
}
// ============================
// 📄 Cargar config.json (opcional)
// ============================
function loadConfigFile() {
    const cfgPath = path.join(getAppRoot(), "config.json");
    if (!fs.existsSync(cfgPath))
        return {};
    try {
        return JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    }
    catch {
        return {};
    }
}
const fileCfg = loadConfigFile();
// ============================
// 🔍 Resolver variable
// ============================
function pick(name, fallback) {
    return (process.env[name] ??
        fileCfg[name] ??
        fallback ??
        "");
}
// ============================
// 🌐 ENV FINAL
// ============================
export const ENV = {
    PORT: Number(pick("PORT", "4545")),
    HOST: pick("HOST", "127.0.0.1"),
    // 🔐 Token
    API_TOKEN: pick("API_TOKEN", "local-dev-token"),
    // 📁 DB SIEMPRE relativa a la raíz real
    DB_PATH: path.resolve(getAppRoot(), pick("DB_PATH", "data/app.db"))
};
