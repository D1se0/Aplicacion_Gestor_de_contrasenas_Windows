export type InactivityConfig = {
    timeoutMs: number;
    onLock: () => void;
};

export function startInactivityTimer(cfg: InactivityConfig) {
    let t: number | undefined;

    const reset = () => {
        if (t) window.clearTimeout(t);
        t = window.setTimeout(() => cfg.onLock(), cfg.timeoutMs);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    const onAny = () => reset();

    events.forEach((e) => window.addEventListener(e, onAny, { passive: true }));
    reset();

    return () => {
        if (t) window.clearTimeout(t);
        events.forEach((e) => window.removeEventListener(e, onAny));
    };
}
