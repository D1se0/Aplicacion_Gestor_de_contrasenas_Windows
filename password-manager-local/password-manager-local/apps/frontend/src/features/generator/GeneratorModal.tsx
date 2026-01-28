import React, { useMemo, useState } from "react";
import { Modal } from "../../ui/components/Modal";
import { Button } from "../../ui/components/Button";
import { StrengthBar } from "../../ui/components/StrengthBar";
import { generatePassword, estimateStrength, type GeneratorOptions } from "./generator";
import { copyWithAutoClear } from "../../security/clipboard";
import { useToast } from "../../ui/toast/ToastProvider";

export function GeneratorModal({
    open,
    onClose,
    onUse
}: {
    open: boolean;
    onClose: () => void;
    onUse: (pw: string, strength: number) => void;
}) {
    const toast = useToast();
    const [opts, setOpts] = useState<GeneratorOptions>({
        length: 20,
        lower: true,
        upper: true,
        digits: true,
        symbols: true,
        avoidAmbiguous: true
    });

    const pw = useMemo(() => {
        try { return generatePassword(opts); } catch { return ""; }
    }, [opts]);

    const s = useMemo(() => estimateStrength(pw), [pw]);

    return (
        <Modal open={open} title="Generador de contraseñas" onClose={onClose} width={620}>
            <div className="grid" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
                <div>
                    <label>Contraseña</label>
                    <input value={pw} readOnly />
                    <div style={{ marginTop: 10 }}>
                        <StrengthBar score={s.score} />
                        {s.warnings.length ? (
                            <div className="small" style={{ marginTop: 8 }}>
                                {s.warnings.map((w, i) => <div key={i}>• {w}</div>)}
                            </div>
                        ) : null}
                    </div>

                    <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
                        <Button
                            variant="primary"
                            onClick={async () => {
                                await copyWithAutoClear(pw, 15000);
                                toast.push("ok", "Copiada", "Se limpiará del portapapeles en ~15s.");
                            }}
                        >
                            Copiar
                        </Button>
                        <Button
                            onClick={() => {
                                onUse(pw, s.score);
                                toast.push("ok", "Aplicada", "Contraseña insertada en el editor.");
                                onClose();
                            }}
                        >
                            Usar en entrada
                        </Button>
                        <Button onClick={onClose}>Cerrar</Button>
                    </div>
                </div>

                <div>
                    <label>Longitud (4–128)</label>
                    <input
                        type="number"
                        value={opts.length}
                        min={4}
                        max={128}
                        onChange={(e) => setOpts((o) => ({ ...o, length: Number(e.target.value) }))}
                    />

                    <div className="divider" />
                    <label><input type="checkbox" checked={opts.lower} onChange={(e) => setOpts(o => ({ ...o, lower: e.target.checked }))} /> Minúsculas</label>
                    <label><input type="checkbox" checked={opts.upper} onChange={(e) => setOpts(o => ({ ...o, upper: e.target.checked }))} /> Mayúsculas</label>
                    <label><input type="checkbox" checked={opts.digits} onChange={(e) => setOpts(o => ({ ...o, digits: e.target.checked }))} /> Dígitos</label>
                    <label><input type="checkbox" checked={opts.symbols} onChange={(e) => setOpts(o => ({ ...o, symbols: e.target.checked }))} /> Símbolos</label>
                    <label><input type="checkbox" checked={opts.avoidAmbiguous} onChange={(e) => setOpts(o => ({ ...o, avoidAmbiguous: e.target.checked }))} /> Evitar ambiguos (O/0, I/l/1)</label>

                    <div className="divider" />
                    <div className="hint">
                        PBKDF2 + AES-256-GCM. El backend solo guarda blobs cifrados.
                    </div>
                </div>
            </div>
        </Modal>
    );
}
