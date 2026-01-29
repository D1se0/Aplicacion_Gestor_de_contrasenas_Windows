import * as fs from "node:fs";
import * as path from "node:path";
import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { ENV } from "./env.mjs";

// 📍 ruta real del archivo ejecutado (funciona en node, pkg y tauri)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureDir(p: string) {
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
    }
}

// 👉 database.sql debe vivir JUNTO al ejecutable
function readSchemaSql(): string {
    const schemaPath = path.resolve(__dirname, "database.sql");

    if (!fs.existsSync(schemaPath)) {
        throw new Error(`No se encontró database.sql en: ${schemaPath}`);
    }

    return fs.readFileSync(schemaPath, "utf8");
}

export function openDb() {
    // 👉 DB dentro de la carpeta del ejecutable
    const dbFile = path.resolve(
        __dirname,
        ENV.DB_PATH || "./data/app.db"
    );

    ensureDir(path.dirname(dbFile));

    console.log("DB PATH:", dbFile);

    const isNew = !fs.existsSync(dbFile);
    const db = new Database(dbFile);

    db.pragma("foreign_keys = ON");

    if (isNew) {
        console.log("Inicializando base de datos…");
        const schema = readSchemaSql();
        db.exec(schema);
    }

    return db;
}
