import { Router } from "express";
import { z } from "zod";
import type Database from "better-sqlite3";
import type { VaultRow } from "../types.mjs";

export function vaultsRouter(db: Database.Database) {
    const r = Router();

    // ---------------------------
    // GET /vaults
    // ---------------------------
    r.get("/vaults", (_req, res) => {
        const rows = db
            .prepare("SELECT * FROM vaults ORDER BY updated_at DESC")
            .all() as VaultRow[];
        res.json({ vaults: rows });
    });

    // ---------------------------
    // POST /vaults (crear bóveda)
    // ---------------------------
    const CreateVault = z.object({
        id: z.string().min(8),
        name: z.string().min(1).max(80),

        kdf: z.object({
            name: z.literal("PBKDF2"),
            hash: z.literal("SHA-256"),
            iterations: z.number().int().min(100000).max(2000000),
            salt_b64: z.string().min(8)
        }),

        auto_lock_ms: z.number().int().min(30000).max(3600000).optional(),

        // 🔑 VERIFICADOR CRIPTOGRÁFICO (OBLIGATORIO)
        verifier_iv_b64: z.string().min(8),
        verifier_cipher_b64: z.string().min(8)
    });

    r.post("/vaults", (req, res) => {
        const parsed = CreateVault.safeParse(req.body);
        if (!parsed.success) {
            return res
                .status(400)
                .json({ error: "Payload inválido", details: parsed.error.flatten() });
        }

        const v = parsed.data;
        const now = Date.now();

        db.prepare(`
      INSERT INTO vaults (
        id,
        name,
        created_at,
        updated_at,
        kdf_name,
        kdf_hash,
        kdf_iterations,
        salt_b64,
        verifier_iv_b64,
        verifier_cipher_b64,
        auto_lock_ms
      ) VALUES (
        @id,
        @name,
        @created_at,
        @updated_at,
        @kdf_name,
        @kdf_hash,
        @kdf_iterations,
        @salt_b64,
        @verifier_iv_b64,
        @verifier_cipher_b64,
        @auto_lock_ms
      )
    `).run({
            id: v.id,
            name: v.name,
            created_at: now,
            updated_at: now,

            kdf_name: v.kdf.name,
            kdf_hash: v.kdf.hash,
            kdf_iterations: v.kdf.iterations,
            salt_b64: v.kdf.salt_b64,

            verifier_iv_b64: v.verifier_iv_b64,
            verifier_cipher_b64: v.verifier_cipher_b64,

            auto_lock_ms: v.auto_lock_ms ?? 300000
        });

        const row = db
            .prepare("SELECT * FROM vaults WHERE id = ?")
            .get(v.id) as VaultRow;

        res.json({ vault: row });
    });

    // ---------------------------
    // PATCH /vaults/:id
    // ---------------------------
    const UpdateVault = z.object({
        name: z.string().min(1).max(80).optional(),
        auto_lock_ms: z.number().int().min(30000).max(3600000).optional()
    });

    r.patch("/vaults/:id", (req, res) => {
        const id = String(req.params.id || "");
        const parsed = UpdateVault.safeParse(req.body);
        if (!parsed.success) {
            return res
                .status(400)
                .json({ error: "Payload inválido", details: parsed.error.flatten() });
        }

        const existing = db
            .prepare("SELECT * FROM vaults WHERE id = ?")
            .get(id) as VaultRow | undefined;

        if (!existing) {
            return res.status(404).json({ error: "Bóveda no encontrada" });
        }

        const now = Date.now();
        const nextName = parsed.data.name ?? existing.name;
        const nextLock = parsed.data.auto_lock_ms ?? existing.auto_lock_ms;

        db.prepare(
            "UPDATE vaults SET name=?, auto_lock_ms=?, updated_at=? WHERE id=?"
        ).run(nextName, nextLock, now, id);

        const row = db
            .prepare("SELECT * FROM vaults WHERE id = ?")
            .get(id) as VaultRow;

        res.json({ vault: row });
    });

    // ---------------------------
    // DELETE /vaults/:id
    // ---------------------------
    r.delete("/vaults/:id", (req, res) => {
        const id = String(req.params.id || "");
        db.prepare("DELETE FROM vaults WHERE id = ?").run(id);
        res.json({ ok: true });
    });

    return r;
}
