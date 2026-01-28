import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../../ui/components/Modal";
import { Button } from "../../ui/components/Button";
import { TextField } from "../../ui/components/TextField";
import { StrengthBar } from "../../ui/components/StrengthBar";
import type { Category, Entry } from "../../types";
import { encryptText, decryptText } from "../../crypto/vaultCrypto";
import { estimateStrength } from "../generator/generator";
import { copyWithAutoClear } from "../../security/clipboard";
import { useToast } from "../../ui/toast/ToastProvider";
import { guessCategory } from "./entryHeuristics";
import { CategoryPill } from "../../ui/components/CategoryPill";
import { Icons } from "../../ui/icons";

const CATEGORIES: Category[] = ["Entertainment", "Shopping", "Work", "Finance", "Social Media", "Other"];

function uid() {
    return crypto.getRandomValues(new Uint32Array(3)).join("-");
}

export function EntryEditorModal({
    open,
    onClose,
    keyRef,
    vaultId,
    initial,
    onSave
}: {
    open: boolean;
    onClose: () => void;
    keyRef: CryptoKey | null;
    vaultId: string;
    initial: Entry | null;
    onSave: (payload: any, isUpdate: boolean) => Promise<void>;
}) {
    const toast = useToast();
    const [category, setCategory] = useState<Category>("Other");
    const [title, setTitle] = useState("");
    const [username, setUsername] = useState("");
    const [url, setUrl] = useState("");
    const [notes, setNotes] = useState("");

    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);

    const strength = useMemo(() => estimateStrength(password), [password]);

    useEffect(() => {
        (async () => {
            if (!open) return;
            if (!keyRef) return;

            if (!initial) {
                setCategory("Other");
                setTitle("");
                setUsername("");
                setUrl("");
                setNotes("");
                setPassword("");
                setShowPw(false);
                return;
            }

            setCategory(initial.category);
            setTitle(initial.title);
            setUsername(initial.username);
            setUrl(initial.url ?? "");

            try {
                const pw = await decryptText(keyRef, initial.pw_iv_b64, initial.pw_ct_b64);
                setPassword(pw);
            } catch {
                setPassword("");
                toast.push("error", "No se pudo descifrar la contraseña", "¿Contraseña maestra incorrecta?");
            }

            try {
                if (initial.notes_ct_b64) {
                    const nt = await decryptText(keyRef, initial.notes_iv_b64, initial.notes_ct_b64);
                    setNotes(nt);
                } else setNotes("");
            } catch {
                setNotes("");
            }
        })();
    }, [open, initial, keyRef]);

    return (
        <Modal open={open} title={initial ? "Editar entrada" : "Nueva entrada"} onClose={onClose} width={760}>
            <div className="grid">
                <div>
                    <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <CategoryPill category={category} />
                            <span className="small">ID: {initial?.id ?? "nuevo"}</span>
                        </div>

                        <div className="row" style={{ gap: 8 }}>
                            <Button
                                onClick={() => {
                                    const guessed = guessCategory(title, url);
                                    setCategory(guessed);
                                    toast.push("info", "Categoría sugerida", guessed);
                                }}
                            >
                                {Icons.bolt} Auto-categorizar
                            </Button>
                        </div>
                    </div>

                    <label>Categoría</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 14,
                            border: "1px solid rgba(255,255,255,0.14)",
                            background: "rgba(0,0,0,0.25)",
                            color: "var(--text)"
                        }}
                    >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <TextField label="Servicio / Título" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <TextField label="Usuario / Email" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <TextField label="URL (opcional)" value={url} onChange={(e) => setUrl(e.target.value)} />

                    <label>Notas (opcional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <div>
                    <label>Contraseña</label>
                    <div className="row">
                        <input
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        <Button onClick={() => setShowPw((s) => !s)} title="Mostrar/ocultar">
                            {showPw ? Icons.eyeOff : Icons.eye}
                        </Button>
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <StrengthBar score={strength.score} />
                        {strength.warnings.length ? (
                            <div className="small" style={{ marginTop: 8 }}>
                                {strength.warnings.map((w, i) => <div key={i}>• {w}</div>)}
                            </div>
                        ) : null}
                    </div>

                    <div className="divider" />

                    <div className="row" style={{ flexWrap: "wrap" }}>
                        <Button
                            onClick={async () => {
                                await copyWithAutoClear(password, 15000);
                                toast.push("ok", "Copiada", "Se limpiará del portapapeles en ~15s.");
                            }}
                        >
                            {Icons.copy} Copiar
                        </Button>
                    </div>

                    <div className="divider" />

                    <div className="row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
                        <Button onClick={onClose}>Cancelar</Button>
                        <Button
                            variant="primary"
                            onClick={async () => {
                                if (!keyRef) {
                                    toast.push("error", "Bóveda bloqueada", "Desbloquea la bóveda para guardar.");
                                    return;
                                }
                                if (!title.trim()) {
                                    toast.push("error", "Falta título", "El servicio/título es obligatorio.");
                                    return;
                                }

                                const pwEnc = await encryptText(keyRef, password);
                                const notesEnc = await encryptText(keyRef, notes || "");

                                const payload = {
                                    id: initial?.id ?? uid(),
                                    vault_id: vaultId,
                                    category,
                                    title: title.trim(),
                                    username: username.trim(),
                                    url: url.trim() ? url.trim() : null,
                                    pw: { algo: "AES-256-GCM", ...pwEnc },
                                    notes: { algo: "AES-256-GCM", ...notesEnc },
                                    strength_score: strength.score
                                };

                                await onSave(payload, Boolean(initial));
                                toast.push("ok", initial ? "Actualizada" : "Guardada", "Entrada cifrada y almacenada.");
                                onClose();
                            }}
                        >
                            Guardar
                        </Button>
                    </div>

                    <div className="hint" style={{ marginTop: 12 }}>
                        El backend nunca ve el texto plano: solo IV + ciphertext (Base64) y metadatos.
                    </div>
                </div>
            </div>
        </Modal>
    );
}
