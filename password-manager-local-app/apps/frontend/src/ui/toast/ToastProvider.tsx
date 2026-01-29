import React, { createContext, useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Toast, ToastKind } from "./toastTypes";

type ToastApi = {
    push: (kind: ToastKind, title: string, message?: string) => void;
};

const Ctx = createContext<ToastApi | null>(null);

function uid() {
    return crypto.getRandomValues(new Uint32Array(2)).join("-");
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const api = useMemo<ToastApi>(() => ({
        push: (kind, title, message) => {
            const t: Toast = { id: uid(), kind, title, message, createdAt: Date.now() };
            setToasts((s) => [t, ...s].slice(0, 4));
            window.setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), 3500);
        }
    }), []);

    return (
        <Ctx.Provider value={api}>
            {children}
            <div className="toastHost">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            className="glass toast"
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                            style={{
                                borderColor:
                                    t.kind === "error" ? "rgba(255,77,109,0.35)"
                                        : t.kind === "ok" ? "rgba(46,229,157,0.30)"
                                            : "rgba(168,85,247,0.28)"
                            }}
                        >
                            <div className="toastTitle">{t.title}</div>
                            {t.message ? <div className="toastMsg">{t.message}</div> : null}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </Ctx.Provider>
    );
}

export function useToast() {
    const v = useContext(Ctx);
    if (!v) throw new Error("useToast debe usarse dentro de ToastProvider");
    return v;
}
