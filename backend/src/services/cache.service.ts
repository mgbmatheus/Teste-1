import { pool } from '../database/connection.js';

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await pool.query(
        `SELECT data FROM cache_entries WHERE key = $1 AND expires_at > NOW()`,
        [key]
      );
      if (result.rows.length > 0) {
        return result.rows[0].data as T;
      }
      return null;
    } catch {
      return null;
    }
  }

  async set(key: string, data: unknown, source: string, ttlDays: number): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO cache_entries (key, data, source, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '1 day' * $4)
         ON CONFLICT (key) DO UPDATE SET data = $2, source = $3, expires_at = NOW() + INTERVAL '1 day' * $4, created_at = NOW()`,
        [key, JSON.stringify(data), source, ttlDays]
      );
    } catch (err) {
      console.warn('[Cache] Erro ao salvar:', (err as Error).message);
    }
  }

  async setHours(key: string, data: unknown, source: string, ttlHours: number): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO cache_entries (key, data, source, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour' * $4)
         ON CONFLICT (key) DO UPDATE SET data = $2, source = $3, expires_at = NOW() + INTERVAL '1 hour' * $4, created_at = NOW()`,
        [key, JSON.stringify(data), source, ttlHours]
      );
    } catch (err) {
      console.warn('[Cache] Erro ao salvar:', (err as Error).message);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      await pool.query(`DELETE FROM cache_entries WHERE key LIKE $1`, [pattern]);
    } catch (err) {
      console.warn('[Cache] Erro ao invalidar:', (err as Error).message);
    }
  }

  async cleanup(): Promise<void> {
    try {
      await pool.query(`DELETE FROM cache_entries WHERE expires_at < NOW()`);
    } catch {
      // silently ignore
    }
  }
}

export const cacheService = new CacheService();
