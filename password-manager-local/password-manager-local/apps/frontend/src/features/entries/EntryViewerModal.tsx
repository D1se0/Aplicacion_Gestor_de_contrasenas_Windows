import React, { useEffect, useState } from "react";
import { Modal } from "../../ui/components/Modal";
import { Button } from "../../ui/components/Button";
import { StrengthBar } from "../../ui/components/StrengthBar";
import { decryptText } from "../../crypto/vaultCrypto";
import { copyWithAutoClear } from "../../security/clipboard";
import { useToast } from "../../ui/toast/ToastProvider";
import type { Entry } from "../../types";
import { CategoryPill } from "../../ui/components/CategoryPill";
import { Icons } from "../../ui/icons";

export function EntryViewerModal({
    open,
    onClose,
    entry,
    keyRef,
    onEdit
}: {
    open: boolean;
    onClose: () => void;
    entry: Entry | null;
    keyRef: CryptoKey | null;
    onEdit: () => void;
}) {
    const toast = useToast();

    const [password, setPassword] = useState("");
    const [notes, setNotes] = useState("");
    const [showPw, setShowPw] = useState(false);

    useEffect(() => {
        (async () => {
            if (!open || !entry || !keyRef) return;

            try {
                const pw = await decryptText(keyRef, entry.pw_iv_b64, entry.pw_ct_b64);
                setPassword(pw);
            } catch {
                toast.push("error", "No se pudo descifrar la contraseña", "¿Clave maestra incorrecta?");
            }

            try {
                if (entry.notes_ct_b64) {
                    const nt = await decryptText(keyRef, entry.notes_iv_b64, entry.notes_ct_b64);
                    setNotes(nt);
                } else {
                    setNotes("");
                }
            } catch {
                setNotes("");
            }
        })();
    }, [open, entry, keyRef]);

    if (!entry) return null;

    return (
        <Modal open={open} title="Ver entrada" onClose={onClose} width={520}>
            <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontWeight: 900 }}>{entry.title}</div>
                    <div className="small">{entry.username}</div>
                </div>
                <CategoryPill category={entry.category} />
            </div>

            <div className="divider" />

            {entry.url ? (
                <div className="small">
                    🌐 <a href={entry.url} target="_blank" rel="noreferrer">{entry.url}</a>
                </div>
            ) : null}

            <div className="divider" />

            <label>Contraseña</label>
            <div className="row">
                <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    readOnly
                />
                <Button onClick={() => setShowPw(s => !s)}>
                    {showPw ? Icons.eyeOff : Icons.eye}
                </Button>
                <Button
                    onClick={async () => {
                        await copyWithAutoClear(password, 15000);
                        toast.push("ok", "Copiada", "Se limpiará en ~15s");
                    }}
                >
                    {Icons.copy}
                </Button>
            </div>

            <StrengthBar score={entry.strength_score} />

            {notes ? (
                <>
                    <div className="divider" />
                    <label>Notas</label>
                    <textarea readOnly value={notes} />
                </>
            ) : null}

            <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <Button onClick={onClose}>Cerrar</Button>
                <Button variant="primary" onClick={onEdit}>
                    {Icons.edit} Editar
                </Button>
            </div>
        </Modal>
    );
}
