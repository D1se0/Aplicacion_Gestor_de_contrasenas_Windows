import * as fs from "node:fs";
import * as path from "node:path";
import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { ENV } from "./env.js";

function ensureDir(p: string) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

/**
 * 📍 Calcula la raíz REAL de la app (no depende del cwd)
 * Funciona igual en:
 * - pnpm dev
 * - pnpm tauri dev
 * - app.exe
 */
function getAppRoot() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // backend/src/db.ts → backend → apps → raíz
    return path.resolve(__dirname, "../../..");
}

function readRootSchemaSql(appRoot: string): string {
    const schemaPath = path.join(appRoot, "database.sql");
    if (!fs.existsSync(schemaPath)) {
        throw new Error(`No se encontró database.sql en la raíz: ${schemaPath}`);
    }
    return fs.readFileSync(schemaPath, "utf8");
}

export function openDb() {
    const appRoot = getAppRoot();

    /**
     * 📦 DB siempre dentro de la app
     * ENV.DB_PATH puede ser: "data/app.db"
     */
    const dbFile = path.join(appRoot, ENV.DB_PATH);
    ensureDir(path.dirname(dbFile));

    const isNew = !fs.existsSync(dbFile);
    const db = new Database(dbFile);

    db.pragma("foreign_keys = ON");

    if (isNew) {
        const schema = readRootSchemaSql(appRoot);
        db.exec(schema);
    }

    console.log("📦 SQLite DB:", dbFile);
    return db;
}
