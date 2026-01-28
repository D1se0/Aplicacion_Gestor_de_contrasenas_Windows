import { Router } from "express";
import { z } from "zod";
import type Database from "better-sqlite3";
import type { EntryRow } from "../types.js";

export function entriesRouter(db: Database.Database) {
    const r = Router();

    // ============================================================
    // GET /api/vaults/:vaultId/entries
    // ============================================================
    r.get("/vaults/:vaultId/entries", (req, res) => {
        const vaultId = String(req.params.vaultId || "");
        const rows = db
            .prepare("SELECT * FROM entries WHERE vault_id = ? ORDER BY updated_at DESC")
            .all(vaultId) as EntryRow[];
        res.json({ entries: rows });
    });

    // ============================================================
    // SCHEMA BASE (SIN refine)
    // ============================================================
    const EntryBase = z.object({
        id: z.string().min(8),

        vault_id: z.string().min(8).optional(),
        vaultId: z.string().min(8).optional(),

        category: z.string().min(1).max(30),
        title: z.string().min(1).max(120),
        username: z.string().min(0).max(200),
        url: z.string().max(500).optional().nullable(),

        pw: z.object({
            algo: z.literal("AES-256-GCM"),
            iv_b64: z.string().min(8),
            ct_b64: z.string().min(8)
        }),

        notes: z.object({
            algo: z.literal("AES-256-GCM"),
            iv_b64: z.string().min(8),
            ct_b64: z.string()
        }),

        strength_score: z.number().int().min(0).max(100).optional()
    });

    // ============================================================
    // CREATE ENTRY
    // ============================================================
    const CreateEntry = EntryBase.refine(
        (v) => v.vault_id || v.vaultId,
        { message: "vault_id o vaultId requerido" }
    );

    r.post("/entries", (req, res) => {
        console.log("POST /api/entries CALLED");
        console.log("BODY:", JSON.stringify(req.body, null, 2));
        const parsed = CreateEntry.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Payload inválido",
                details: parsed.error.flatten()
            });
        }

        const e = parsed.data;
        const vault_id = e.vault_id ?? e.vaultId!;
        const now = Date.now();

        db.prepare(`
            INSERT INTO entries (
                id, vault_id, created_at, updated_at,
                category, title, username, url,
                pw_algo, pw_iv_b64, pw_ct_b64,
                notes_algo, notes_iv_b64, notes_ct_b64,
                strength_score
            ) VALUES (
                @id, @vault_id, @created_at, @updated_at,
                @category, @title, @username, @url,
                @pw_algo, @pw_iv_b64, @pw_ct_b64,
                @notes_algo, @notes_iv_b64, @notes_ct_b64,
                @strength_score
            )
        `).run({
            id: e.id,
            vault_id,
            created_at: now,
            updated_at: now,
            category: e.category,
            title: e.title,
            username: e.username,
            url: e.url ?? null,
            pw_algo: e.pw.algo,
            pw_iv_b64: e.pw.iv_b64,
            pw_ct_b64: e.pw.ct_b64,
            notes_algo: e.notes.algo,
            notes_iv_b64: e.notes.iv_b64,
            notes_ct_b64: e.notes.ct_b64,
            strength_score: e.strength_score ?? 0
        });

        db.prepare("UPDATE vaults SET updated_at=? WHERE id=?")
            .run(now, vault_id);

        const row = db.prepare("SELECT * FROM entries WHERE id = ?")
            .get(e.id) as EntryRow;

        res.json({ entry: row });
    });

    // ============================================================
    // UPDATE ENTRY
    // ============================================================
    const UpdateEntry = EntryBase
        .partial()
        .extend({
            id: z.string().min(8)
        })
        .refine(
            (v) => !v.vault_id || v.vaultId || v.vault_id,
            { message: "vault_id o vaultId requerido" }
        );

    r.put("/entries/:id", (req, res) => {
        const id = String(req.params.id || "");
        const parsed = UpdateEntry.safeParse({ ...req.body, id });

        if (!parsed.success) {
            return res.status(400).json({
                error: "Payload inválido",
                details: parsed.error.flatten()
            });
        }

        const existing = db
            .prepare("SELECT * FROM entries WHERE id = ?")
            .get(id) as EntryRow | undefined;

        if (!existing) {
            return res.status(404).json({ error: "Entrada no encontrada" });
        }

        const e = parsed.data;
        const now = Date.now();

        const vault_id =
            e.vault_id ?? e.vaultId ?? existing.vault_id;

        const next = {
            vault_id,
            category: e.category ?? existing.category,
            title: e.title ?? existing.title,
            username: e.username ?? existing.username,
            url: e.url === undefined ? existing.url : e.url ?? null,

            pw_algo: e.pw?.algo ?? existing.pw_algo,
            pw_iv_b64: e.pw?.iv_b64 ?? existing.pw_iv_b64,
            pw_ct_b64: e.pw?.ct_b64 ?? existing.pw_ct_b64,

            notes_algo: e.notes?.algo ?? existing.notes_algo,
            notes_iv_b64: e.notes?.iv_b64 ?? existing.notes_iv_b64,
            notes_ct_b64: e.notes?.ct_b64 ?? existing.notes_ct_b64,

            strength_score: e.strength_score ?? existing.strength_score
        };

        db.prepare(`
            UPDATE entries SET
                vault_id=@vault_id,
                updated_at=@updated_at,
                category=@category,
                title=@title,
                username=@username,
                url=@url,
                pw_algo=@pw_algo,
                pw_iv_b64=@pw_iv_b64,
                pw_ct_b64=@pw_ct_b64,
                notes_algo=@notes_algo,
                notes_iv_b64=@notes_iv_b64,
                notes_ct_b64=@notes_ct_b64,
                strength_score=@strength_score
            WHERE id=@id
        `).run({
            id,
            updated_at: now,
            ...next
        });

        db.prepare("UPDATE vaults SET updated_at=? WHERE id=?")
            .run(now, vault_id);

        const row = db.prepare("SELECT * FROM entries WHERE id = ?")
            .get(id) as EntryRow;

        res.json({ entry: row });
    });

    // ============================================================
    // DELETE ENTRY
    // ============================================================
    r.delete("/entries/:id", (req, res) => {
        const id = String(req.params.id || "");
        const existing = db
            .prepare("SELECT * FROM entries WHERE id = ?")
            .get(id) as EntryRow | undefined;

        if (existing) {
            db.prepare("DELETE FROM entries WHERE id = ?").run(id);
            db.prepare("UPDATE vaults SET updated_at=? WHERE id=?")
                .run(Date.now(), existing.vault_id);
        }

        res.json({ ok: true });
    });

    return r;
}
