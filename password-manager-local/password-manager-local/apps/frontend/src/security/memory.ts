// Nota realista: en JS/TS no hay “memset” garantizado como en C.
// Aun así, reducimos exposición: nulificar referencias y sobrescribir buffers cuando existan.

export function wipeStringObj(obj: { value: string }) {
    try {
        obj.value = "0".repeat(Math.min(64, obj.value.length));
    } catch { }
    obj.value = "";
}

export function wipeBytes(bytes?: Uint8Array | null) {
    if (!bytes) return;
    bytes.fill(0);
}

export function wipeKeyRef(ref: { current: CryptoKey | null }) {
    // CryptoKey no es mutable; soltamos referencia para GC.
    ref.current = null;
}
