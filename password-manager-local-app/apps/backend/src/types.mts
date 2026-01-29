export type VaultRow = {
    id: string;
    name: string;
    created_at: number;
    updated_at: number;
    kdf_name: string;
    kdf_hash: string;
    kdf_iterations: number;
    salt_b64: string;
    auto_lock_ms: number;
};

export type EntryRow = {
    id: string;
    vault_id: string;
    created_at: number;
    updated_at: number;
    category: string;
    title: string;
    username: string;
    url: string | null;

    pw_algo: string;
    pw_iv_b64: string;
    pw_ct_b64: string;

    notes_algo: string;
    notes_iv_b64: string;
    notes_ct_b64: string;

    strength_score: number;
};
