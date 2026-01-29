import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../../ui/components/GlassCard";
import { Button } from "../../ui/components/Button";
import { ShortcutHint } from "../../ui/components/ShortcutHint";
import { Api } from "../../api/client";
import type { Vault, Entry } from "../../types";
import { CreateVaultModal } from "./CreateVaultModal";
import { UnlockVaultModal } from "./UnlockVaultModal";
import { useToast } from "../../ui/toast/ToastProvider";
import { Icons } from "../../ui/icons";

export function VaultListPage({
    onOpenVault
}: {
    onOpenVault: (vault: Vault, key: CryptoKey) => void;
}) {
    const toast = useToast();
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [unlockOpen, setUnlockOpen] = useState(false);
    const [selected, setSelected] = useState<Vault | null>(null);
    const [sampleCipher, setSampleCipher] = useState<{ iv_b64: string; ct_b64: string } | null>(null);

    async function refresh() {
        setLoading(true);
        try {
            const v = await Api.listVaults();
            setVaults(v.vaults as Vault[]);
        } catch (e: any) {
            toast.push("error", "No se pudieron cargar bóvedas", String(e?.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { refresh(); }, []);

    const securityOverview = useMemo(() => (
        <div className="hint">
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Resumen de seguridad (local-only)</div>
            <div>• Cifrado en el cliente: AES-256-GCM con clave derivada por PBKDF2.</div>
            <div>• El backend solo guarda blobs cifrados + metadatos seguros.</div>
            <div>• Auto-bloqueo por inactividad y limpieza del portapapeles al copiar.</div>
        </div>
    ), []);

    return (
        <>
            <div className="grid">
                <GlassCard>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 16 }}>Bóvedas</div>
                            <div className="small">Selecciona una bóveda y desbloquéala con tu contraseña maestra.</div>
                        </div>
                        <Button
                            variant="primary"
                            className="btn-primary-fat"
                            onClick={() => setCreateOpen(true)}
                        >
                            <span className="btn-icon">{Icons.plus}</span>
                            Nueva bóveda
                        </Button>
                    </div>

                    <div className="divider" />

                    {loading ? (
                        <div className="small">Cargando…</div>
                    ) : vaults.length === 0 ? (
                        <div className="small">No hay bóvedas aún. Crea una para empezar.</div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Auto-bloqueo</th>
                                    <th>Actualizada</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {vaults.map((v) => (
                                    <tr key={v.id}>
                                        <td style={{ fontWeight: 700 }}>{v.name}</td>
                                        <td><span className="badge">{Math.round(v.auto_lock_ms / 60000)} min</span></td>
                                        <td className="small">{new Date(v.updated_at).toLocaleString()}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <div className="row" style={{ justifyContent: "flex-end" }}>
                                                <Button
                                                    onClick={async () => {
                                                        // Tomamos una entrada como muestra para verificar contraseña maestra si existe
                                                        try {
                                                            const res = await Api.listEntries(v.id);
                                                            const entries = res.entries as Entry[];
                                                            if (entries.length > 0) {
                                                                setSampleCipher({ iv_b64: entries[0].pw_iv_b64, ct_b64: entries[0].pw_ct_b64 });
                                                            } else setSampleCipher(null);
                                                        } catch {
                                                            setSampleCipher(null);
                                                        }
                                                        setSelected(v);
                                                        setUnlockOpen(true);
                                                    }}
                                                >
                                                    {Icons.lock} Desbloquear
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={async () => {
                                                        if (!confirm(`¿Eliminar bóveda "${v.name}"? Se borrarán todas las entradas.`)) return;
                                                        await Api.deleteVault(v.id);
                                                        toast.push("ok", "Eliminada", "Bóveda y entradas borradas.");
                                                        refresh();
                                                    }}
                                                >
                                                    {Icons.trash}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </GlassCard>

                <GlassCard>
                    <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>Productividad</div>
                    <ShortcutHint />
                    <div className="divider" />
                    {securityOverview}
                </GlassCard>
            </div>

            <CreateVaultModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refresh} />

            <UnlockVaultModal
                open={unlockOpen}
                vault={selected}
                sampleCipher={sampleCipher}
                onClose={() => setUnlockOpen(false)}
                onUnlocked={(key) => {
                    if (!selected) return;
                    onOpenVault(selected, key);
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="hint"
                style={{ marginTop: 14 }}
            >
                Consejo: crea una contraseña maestra larga (frase) y no la reutilices.
            </motion.div>
        </>
    );
}
