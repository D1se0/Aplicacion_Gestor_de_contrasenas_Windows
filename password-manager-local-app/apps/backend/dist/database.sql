PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS vaults (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  -- KDF (PBKDF2)
  kdf_name TEXT NOT NULL,          -- "PBKDF2"
  kdf_hash TEXT NOT NULL,          -- "SHA-256"
  kdf_iterations INTEGER NOT NULL,
  salt_b64 TEXT NOT NULL,

  -- Verificador criptográfico de bóveda (AES-256-GCM)
  verifier_cipher_b64 TEXT NOT NULL,
  verifier_iv_b64 TEXT NOT NULL,

  -- Preferencias
  auto_lock_ms INTEGER NOT NULL DEFAULT 300000
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  vault_id TEXT NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  category TEXT NOT NULL,
  title TEXT NOT NULL,
  username TEXT NOT NULL,
  url TEXT NULL,

  -- Password cifrada (AES-256-GCM)
  pw_algo TEXT NOT NULL,
  pw_iv_b64 TEXT NOT NULL,
  pw_ct_b64 TEXT NOT NULL,

  -- Notes cifradas (AES-256-GCM)
  notes_algo TEXT NOT NULL,
  notes_iv_b64 TEXT NOT NULL,
  notes_ct_b64 TEXT NOT NULL,

  strength_score INTEGER NOT NULL DEFAULT 0,

  FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_vault_id ON entries(vault_id);
CREATE INDEX IF NOT EXISTS idx_entries_title ON entries(title);
CREATE INDEX IF NOT EXISTS idx_entries_username ON entries(username);
