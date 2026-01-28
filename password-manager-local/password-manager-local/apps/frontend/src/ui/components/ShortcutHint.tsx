import React from "react";

export function ShortcutHint() {
    return (
        <div className="hint">
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Atajos</div>
            <div> <span className="kbd">/</span> buscar · <span className="kbd">N</span> nueva entrada · <span className="kbd">G</span> generador</div>
            <div> <span className="kbd">Ctrl</span>+<span className="kbd">L</span> bloquear · <span className="kbd">Esc</span> cerrar modales</div>
        </div>
    );
}
