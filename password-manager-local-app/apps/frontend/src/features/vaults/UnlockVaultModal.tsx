import React, { useRef, useState } from "react";
import { Modal } from "../../ui/components/Modal";
import { Button } from "../../ui/components/Button";
import { TextField } from "../../ui/components/TextField";
import type { Vault } from "../../types";
import { deriveKey } from "../../crypto/vaultCrypto";
import { useToast } from "../../ui/toast/ToastProvider";

function b64ToBytes(b64: string): Uint8Array {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

export function UnlockVaultModal({
    open,
    vault,
    onClose,
    onUnlocked
}: {
    open: boolean;
    vault: Vault | null;
    onClose: () => void;
    onUnlocked: (key: CryptoKey) => void;
}) {
    const toast = useToast();
    const [mp, setMp] = useState("");
    const busy = useRef(false);

    return (
        <Modal open={open} title="Desbloquear bóveda" onClose={onClose} width={520}>
            <div className="hint">
                La clave derivada vive solo en RAM y se elimina al bloquear o cerrar.
            </div>

            <TextField
                label={`Contraseña maestra — ${vault?.name ?? ""}`}
                type="password"
                autoFocus
                value={mp}
                onChange={(e) => setMp(e.target.value)}
            />

            <div className="row" style={{ marginTop: 14, justifyContent: "flex-end" }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    variant="primary"
                    onClick={async () => {
                        if (!vault || busy.current) return;
                        busy.current = true;

                        try {
                            const key = await deriveKey(mp, {
                                name: "PBKDF2",
                                hash: "SHA-256",
                                iterations: vault.kdf_iterations,
                                salt_b64: vault.salt_b64
                            });

                            try {
                                const iv = b64ToBytes(vault.verifier_iv_b64);
                                const ct = b64ToBytes(vault.verifier_cipher_b64);

                                const decrypted = await crypto.subtle.decrypt(
                                    { name: "AES-GCM", iv },
                                    key,
                                    ct
                                );

                                const text = new TextDecoder().decode(decrypted);
                                if (text !== "VAULT_OK") throw new Error();
                            } catch {
                                toast.push("error", "Contraseña incorrecta", "No coincide con la bóveda.");
                                busy.current = false;
                                return;
                            }

                            onUnlocked(key);
                            setMp("");
                            toast.push("ok", "Desbloqueada", "Auto-bloqueo activo.");
                            onClose();
                        } finally {
                            busy.current = false;
                        }
                    }}
                >
                    Desbloquear
                </Button>
            </div>
        </Modal>
    );
}
