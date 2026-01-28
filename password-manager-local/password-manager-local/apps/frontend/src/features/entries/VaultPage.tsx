import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../../ui/components/GlassCard";
import { Button } from "../../ui/components/Button";
import { TextField } from "../../ui/components/TextField";
import { CategoryPill } from "../../ui/components/CategoryPill";
import { StrengthBar } from "../../ui/components/StrengthBar";
import { Api } from "../../api/client";
import type { Entry, Vault } from "../../types";
import { EntryEditorModal } from "./EntryEditorModal";
import { EntryViewerModal } from "./EntryViewerModal";
import { GeneratorModal } from "../generator/GeneratorModal";
import { useToast } from "../../ui/toast/ToastProvider";
import { startInactivityTimer } from "../../security/inactivity";
import { wipeKeyRef } from "../../security/memory";
import { Icons } from "../../ui/icons";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

export function VaultPage({
    vault,
    keyRef,
    onBackToVaults,
    onLocked
}: {
    vault: Vault;
    keyRef: React.MutableRefObject<CryptoKey | null>;
    onBackToVaults: () => void;
    onLocked: () => void;
}) {
    const toast = useToast();

    const [entries, setEntries] = useState<Entry[]>([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);

    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState<Entry | null>(null);

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewing, setViewing] = useState<Entry | null>(null);

    const [genOpen, setGenOpen] = useState(false);

    const searchRef = useRef<HTMLInputElement | null>(null);

    function lockVault() {
        wipeKeyRef(keyRef);
        toast.push("info", "Bloqueada", "Bóveda bloqueada.");
        onLocked();
    }

    function logout() {
        wipeKeyRef(keyRef);
        onBackToVaults();
    }

    useKeyboardShortcuts({
        onNewEntry: () => {
            setEditing(null);
            setEditorOpen(true);
        },
        onSearch: () => searchRef.current?.focus(),
        onGenerator: () => setGenOpen(true),
        onLock: lockVault,
        onLogout: logout
    });

    useEffect(() => {
        const stop = startInactivityTimer({
            timeoutMs: vault.auto_lock_ms,
            onLock: lockVault
        });
        return () => stop();
    }, [vault.id]);

    async function refresh() {
        setLoading(true);
        try {
            const res = await Api.listEntries(vault.id);
            setEntries(res.entries ?? []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { refresh(); }, [vault.id]);

    const filtered = useMemo(() => {
        const s = q.toLowerCase().trim();
        if (!s) return entries;
        return entries.filter(e =>
            e.title.toLowerCase().includes(s) ||
            e.username.toLowerCase().includes(s) ||
            (e.url ?? "").toLowerCase().includes(s)
        );
    }, [entries, q]);

    return (
        <>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                <Button onClick={onBackToVaults}>{Icons.back} Bóvedas</Button>
                <div className="row">
                    <Button onClick={() => setGenOpen(true)}>{Icons.key} Generador</Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditing(null);
                            setEditorOpen(true);
                        }}
                    >
                        {Icons.plus} Nueva entrada
                    </Button>
                    <Button variant="danger" onClick={lockVault}>
                        {Icons.lock} Bloquear
                    </Button>
                </div>
            </div>

            <GlassCard>
                <TextField
                    label="Buscar (Ctrl + F)"
                    inputRef={searchRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />

                <div className="divider" />

                {loading ? (
                    <div className="small">Cargando…</div>
                ) : filtered.length === 0 ? (
                    <div className="small">Sin entradas.</div>
                ) : (
                    <table className="table">
                        <tbody>
                            {filtered.map(e => (
                                <tr
                                    key={e.id}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setViewing(e);
                                        setViewerOpen(true);
                                    }}
                                >
                                    <td>{e.title}</td>
                                    <td>{e.username}</td>
                                    <td><CategoryPill category={e.category} /></td>
                                    <td><StrengthBar score={e.strength_score} /></td>
                                    <td>
                                        <Button
                                            onClick={(ev) => {
                                                ev.stopPropagation();
                                                setEditing(e);
                                                setEditorOpen(true);
                                            }}
                                        >
                                            Editar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </GlassCard>

            {/* VISOR (SOLO LECTURA) */}
            <EntryViewerModal
                open={viewerOpen}
                entry={viewing}
                keyRef={keyRef.current}
                onClose={() => setViewerOpen(false)}
                onEdit={() => {
                    setViewerOpen(false);
                    setEditing(viewing);
                    setEditorOpen(true);
                }}
            />

            {/* EDITOR */}
            <EntryEditorModal
                open={editorOpen}
                onClose={() => setEditorOpen(false)}
                keyRef={keyRef.current}
                vaultId={vault.id}
                initial={editing}
                onSave={async (payload, isUpdate) => {
                    if (isUpdate) {
                        await Api.updateEntry(payload.id, payload);
                    } else {
                        await Api.createEntry(payload);
                    }
                    await refresh();
                }}
            />

            <GeneratorModal
                open={genOpen}
                onClose={() => setGenOpen(false)}
                onUse={(pw) => {
                    navigator.clipboard.writeText(pw);
                    toast.push("ok", "Contraseña copiada", "Se limpiará automáticamente.");
                }}
            />
        </>
    );
}
