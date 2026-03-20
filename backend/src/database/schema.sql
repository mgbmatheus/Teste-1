CREATE TABLE IF NOT EXISTS cache_entries (
  key        VARCHAR(512) PRIMARY KEY,
  data       JSONB NOT NULL,
  source     VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_source ON cache_entries(source);
