import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Erro inesperado no pool:', err.message);
});

export async function initDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS cache_entries (
        key        VARCHAR(512) PRIMARY KEY,
        data       JSONB NOT NULL,
        source     VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cache_source ON cache_entries(source)`);
    client.release();
    console.log('[DB] Banco inicializado com sucesso');
  } catch (err) {
    console.warn('[DB] PostgreSQL indisponível, cache desabilitado:', (err as Error).message);
  }
}
