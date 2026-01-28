export async function copyWithAutoClear(text: string, clearMs = 15000) {
    await navigator.clipboard.writeText(text);

    const snapshot = text;
    window.setTimeout(async () => {
        try {
            const current = await navigator.clipboard.readText();
            if (current === snapshot) {
                await navigator.clipboard.writeText("");
            }
        } catch {
            // Algunos navegadores restringen readText; si falla, intentamos igual limpiar.
            try { await navigator.clipboard.writeText(""); } catch { }
        }
    }, clearMs);
}
