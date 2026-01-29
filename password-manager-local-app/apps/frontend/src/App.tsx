import React, { useMemo, useRef, useState } from "react";
import "./styles.css";
import { VaultListPage } from "./features/vaults/VaultListPage";
import type { Vault } from "./types";
import { VaultPage } from "./features/entries/VaultPage";
import { ToastProvider } from "./ui/toast/ToastProvider";

export default function App() {
    const [currentVault, setCurrentVault] = useState<Vault | null>(null);
    const keyRef = useRef<CryptoKey | null>(null);

    const header = useMemo(() => (
        <div className="topbar">
            <div className="brand">
                <div className="logo">
                    <i className="nf nf-md-database_lock" aria-hidden="true" />
                </div>
                <div>
                    <h1>Password Manager Local</h1>
                    <p>Offline · Portable · AES-256-GCM · Glassmorphism</p>
                </div>
            </div>
            <div className="small">
                {currentVault ? (
                    <span className="badge">Bóveda: {currentVault.name}</span>
                ) : (
                    <span className="badge">Bóvedas</span>
                )}
            </div>
        </div>
    ), [currentVault?.id]);

    return (
        <ToastProvider>
            <div className="container">
                {header}

                {currentVault ? (
                    <VaultPage
                        vault={currentVault}
                        keyRef={keyRef}
                        onBackToVaults={() => {
                            // “Volver” no necesariamente bloquea; el usuario puede elegir.
                            setCurrentVault(null);
                        }}
                        onLocked={() => {
                            setCurrentVault(null);
                        }}
                    />
                ) : (
                    <VaultListPage
                        onOpenVault={(vault, key) => {
                            keyRef.current = key;
                            setCurrentVault(vault);
                        }}
                    />
                )}

                <div className="hint" style={{ marginTop: 18 }}>
                    Proyecto no producción. Recomendación: mantén esta carpeta en un volumen cifrado (por ejemplo BitLocker/FileVault).
                </div>
            </div>
        </ToastProvider>
    );
}
