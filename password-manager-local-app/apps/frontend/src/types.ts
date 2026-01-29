export type Vault = {
    id: string;
    name: string;

    kdf_iterations: number;
    salt_b64: string;

    verifier_iv_b64: string;
    verifier_cipher_b64: string;

    auto_lock_ms: number;
};

export type Entry = {
    id: string;
    vault_id: string;
    created_at: number;
    updated_at: number;
    category: Category;
    title: string;
    username: string;
    url: string | null;

    pw_algo: "AES-256-GCM";
    pw_iv_b64: string;
    pw_ct_b64: string;

    notes_algo: "AES-256-GCM";
    notes_iv_b64: string;
    notes_ct_b64: string;

    strength_score: number;
};

export type Category =
    | "Entertainment"
    | "Shopping"
    | "Work"
    | "Finance"
    | "Social Media"
    | "Other";

export type KdfParams = {
    name: "PBKDF2";
    hash: "SHA-256";
    iterations: number;
    salt_b64: string;
};
