import React, { useState } from "react";
import { Modal } from "../../ui/components/Modal";
import { Button } from "../../ui/components/Button";
import { TextField } from "../../ui/components/TextField";
import { randomBytes, deriveKey } from "../../crypto/vaultCrypto";
import { bytesToB64 } from "../../crypto/base64";
import { Api } from "../../api/client";
import { useToast } from "../../ui/toast/ToastProvider";

function uid() {
    return crypto.getRandomValues(new Uint32Array(3)).join("-");
}

export function CreateVaultModal({
    open,
    onClose,
    onCreated
}: {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}) {
    const toast = useToast();

    const [name, setName] = useState("Mi bóveda");
    const [iterations, setIterations] = useState(350000);
    const [autoLockMin, setAutoLockMin] = useState(5);

    const [masterPw, setMasterPw] = useState("");
    const [masterPwConfirm, setMasterPwConfirm] = useState("");

    return (
        <Modal open={open} title="Crear bóveda" onClose={onClose} width={520}>
            <div className="hint">
                La contraseña maestra NO se guarda.
                Se usa únicamente para derivar la clave en memoria (RAM).
            </div>

            <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />

            <TextField
                label="Contraseña maestra"
                type="password"
                value={masterPw}
                onChange={(e) => setMasterPw(e.target.value)}
            />

            <TextField
                label="Confirmar contraseña maestra"
                type="password"
                value={masterPwConfirm}
                onChange={(e) => setMasterPwConfirm(e.target.value)}
            />

            <TextField
                label="Iteraciones PBKDF2 (100k–2M)"
                type="number"
                min={100000}
                max={2000000}
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
            />

            <TextField
                label="Auto-bloqueo (minutos)"
                type="number"
                min={1}
                max={60}
                value={autoLockMin}
                onChange={(e) => setAutoLockMin(Number(e.target.value))}
            />

            <div className="row" style={{ marginTop: 14, justifyContent: "flex-end" }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    variant="primary"
                    onClick={async () => {
                        if (!masterPw || masterPw !== masterPwConfirm) {
                            toast.push("error", "Contraseña inválida", "Las contraseñas no coinciden.");
                            return;
                        }

                        const salt = randomBytes(16);

                        const kdf = {
                            name: "PBKDF2" as const,
                            hash: "SHA-256" as const,
                            iterations: Math.max(100000, Math.min(2000000, Math.floor(iterations))),
                            salt_b64: bytesToB64(salt)
                        };

                        const key = await deriveKey(masterPw, kdf);

                        const verifierIv = randomBytes(12);
                        const verifierData = new TextEncoder().encode("VAULT_OK");

                        const verifierCipher = await crypto.subtle.encrypt(
                            { name: "AES-GCM", iv: verifierIv },
                            key,
                            verifierData
                        );

                        await Api.createVault({
                            id: uid(),
                            name: name.trim() || "Bóveda",
                            kdf,
                            auto_lock_ms: Math.max(60000, Math.min(3600000, Math.floor(autoLockMin * 60_000))),
                            verifier_iv_b64: bytesToB64(verifierIv),
                            verifier_cipher_b64: bytesToB64(new Uint8Array(verifierCipher))
                        });

                        setMasterPw("");
                        setMasterPwConfirm("");

                        toast.push("ok", "Bóveda creada", "Contraseña maestra configurada.");
                        onCreated();
                        onClose();
                    }}
                >
                    Crear
                </Button>
            </div>
        </Modal>
    );
}
