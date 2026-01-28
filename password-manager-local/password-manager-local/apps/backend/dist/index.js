import express from "express";
import cors from "cors";
import { ENV } from "./env.js";
import { openDb } from "./db.js";
console.log("🔥 BACKEND ARRANCADO");
console.log("📂 CWD:", process.cwd());
import { healthRouter } from "./routes/health.js";
import { vaultsRouter } from "./routes/vaults.js";
import { entriesRouter } from "./routes/entries.js";
const app = express();
const db = openDb();
console.log("📦 DB ABIERTA");
// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    allowedHeaders: ["Content-Type", "X-API-Token"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));
// “Seguridad” básica local: token obligatorio.
app.use((req, res, next) => {
    if (req.path === "/api/health")
        return next();
    const token = req.header("X-API-Token");
    if (!token || token !== ENV.API_TOKEN)
        return res.status(401).json({ error: "No autorizado" });
    next();
});
app.use("/api", healthRouter);
app.use("/api", vaultsRouter(db));
app.use("/api", entriesRouter(db));
app.listen(ENV.PORT, ENV.HOST, () => {
    console.log(`Backend local en http://${ENV.HOST}:${ENV.PORT}`);
    console.log(`DB SQLite: ${ENV.DB_PATH}`);
});
