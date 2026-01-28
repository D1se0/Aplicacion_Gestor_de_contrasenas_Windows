import { useEffect } from "react";

export function useKeyboardShortcuts(handlers: {
    onNewEntry?: () => void;
    onSearch?: () => void;
    onGenerator?: () => void;
    onLock?: () => void;
    onLogout?: () => void;
}) {
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (!e.ctrlKey) return;

            switch (e.key.toLowerCase()) {
                case "n":
                    e.preventDefault();
                    handlers.onNewEntry?.();
                    break;
                case "f":
                    e.preventDefault();
                    handlers.onSearch?.();
                    break;
                case "g":
                    e.preventDefault();
                    handlers.onGenerator?.();
                    break;
                case "l":
                    e.preventDefault();
                    handlers.onLock?.();
                    break;
                case "q":
                    e.preventDefault();
                    handlers.onLogout?.();
                    break;
            }
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [handlers]);
}
