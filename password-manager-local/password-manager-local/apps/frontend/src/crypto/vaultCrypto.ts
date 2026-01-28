import { b64ToBytes, bytesToB64 } from "./base64";
import type { KdfParams } from "../types";

const te = new TextEncoder();
const td = new TextDecoder();

export function randomBytes(n: number): Uint8Array {
    const b = new Uint8Array(n);
    crypto.getRandomValues(b);
    return b;
}

export async function deriveKey(masterPassword: string, kdf: KdfParams): Promise<CryptoKey> {
    const baseKey = await crypto.subtle.importKey(
        "raw",
        te.encode(masterPassword),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const salt = b64ToBytes(kdf.salt_b64);

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: kdf.iterations,
            hash: kdf.hash
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptText(key: CryptoKey, plaintext: string): Promise<{ iv_b64: string; ct_b64: string }> {
    const iv = randomBytes(12); // recomendado 96 bits para GCM
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, te.encode(plaintext));
    return { iv_b64: bytesToB64(iv), ct_b64: bytesToB64(new Uint8Array(ct)) };
}

export async function decryptText(key: CryptoKey, iv_b64: string, ct_b64: string): Promise<string> {
    const iv = b64ToBytes(iv_b64);
    const ct = b64ToBytes(ct_b64);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return td.decode(pt);
}
