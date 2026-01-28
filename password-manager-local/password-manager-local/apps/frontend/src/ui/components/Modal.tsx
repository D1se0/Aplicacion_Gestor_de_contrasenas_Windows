import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Modal({
    open,
    title,
    onClose,
    children,
    width = 560
}: React.PropsWithChildren<{ open: boolean; title: string; onClose: () => void; width?: number }>) {
    return (
        <AnimatePresence>
            {open ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(8px)",
                        zIndex: 999
                    }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        className="glass card"
                        initial={{ y: 18, opacity: 0, scale: 0.99 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 12, opacity: 0, scale: 0.99 }}
                        transition={{ duration: 0.18 }}
                        style={{
                            width,
                            maxWidth: "calc(100% - 22px)",
                            margin: "72px auto 0"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                            <div>
                                <div style={{ fontWeight: 800 }}>{title}</div>
                                <div className="small">Local-only · cifrado cliente</div>
                            </div>
                            <button className="btn" onClick={onClose} aria-label="Cerrar">Cerrar</button>
                        </div>
                        <div className="divider" />
                        {children}
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
