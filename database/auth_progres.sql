-- ============================================================
-- Tabel Auth & Progres Edukasi Sakkah
-- Database: sakah (Vercel Postgres / PostgreSQL)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,          -- scrypt: salt:hex
  poin          INTEGER NOT NULL DEFAULT 0,
  role          TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Untuk database yang dibuat sebelum kolom role ada
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,          -- randomBytes(32).hex
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS user_progres (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  modul_slug      TEXT NOT NULL,
  attempts        INTEGER NOT NULL DEFAULT 0,
  best_percentage INTEGER NOT NULL DEFAULT 0,
  last_percentage INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, modul_slug)
);
