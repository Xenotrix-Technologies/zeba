import pg from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let pool = null;
let pgliteInstance = null;
let isPGlite = false;
// Initialize Database connection
export async function getDb() {
  if (pool) return { query: (text, params) => pool.query(text, params), isPGlite: false };
  if (pgliteInstance) return { query: (text, params) => pgliteInstance.query(text, params), isPGlite: true };

  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;

  if (rawDbUrl && rawDbUrl.trim() !== '') {
    try {
      const dbUrl = rawDbUrl.trim();
      const isRemote = dbUrl.includes('supabase.co') || dbUrl.includes('pooler.supabase.com') || dbUrl.includes('sslmode=require') || (!dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1'));
      
      // Clean query parameters like sslmode=require that cause pg verify-full self-signed certificate chain issues
      let cleanUrl = dbUrl;
      try {
        const parsed = new URL(dbUrl);
        parsed.searchParams.delete('sslmode');
        parsed.searchParams.delete('supa');
        cleanUrl = parsed.toString();
      } catch {
        cleanUrl = dbUrl.replace(/[?&]sslmode=[^&]+/g, '').replace(/[?&]supa=[^&]+/g, '');
      }

      // Safe connection pool limits for Vercel serverless vs persistent server
      const maxConnections = process.env.VERCEL ? 4 : (parseInt(process.env.DB_POOL_MAX, 10) || 10);

      pool = new Pool({
        connectionString: cleanUrl,
        ssl: isRemote ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: process.env.VERCEL ? 8000 : 12000,
        idleTimeoutMillis: process.env.VERCEL ? 10000 : 30000,
        max: maxConnections
      });

      pool.on('error', (err) => {
        console.error('Unexpected PostgreSQL client pool error:', err.message);
      });

      // Verify connection with health check query
      await pool.query('SELECT 1');
      console.log('✅ Connected to Supabase / PostgreSQL database successfully');
      return { query: (text, params) => pool.query(text, params), isPGlite: false };
    } catch (err) {
      if (isProduction) {
        pool = null;
        console.error('🚨 Production database connection failed. Refusing to fallback to ephemeral storage:', err.message);
        throw new Error(`CRITICAL: Production database connection failed (${err.message}). Ephemeral fallback is strictly blocked in production.`);
      }
      console.warn('⚠️ Development warning: Could not connect to remote DATABASE_URL, falling back to embedded PGlite for local development only...', err.message);
      pool = null;
    }
  }

  // Refuse ephemeral fallback if running in production without configured DATABASE_URL
  if (isProduction) {
    throw new Error('CRITICAL: DATABASE_URL is required in production environments. Refusing to use ephemeral storage.');
  }

  // Fallback to embedded PGlite strictly for isolated local development
  const dataDir = path.resolve(__dirname, '../../data/postgres');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const { PGlite } = await import('@electric-sql/pglite');
  pgliteInstance = new PGlite(dataDir);
  isPGlite = true;
  console.log(`✅ [LOCAL DEV ONLY] Embedded PostgreSQL engine initialized at ${dataDir}`);

  return {
    query: async (text, params = []) => {
      // PGlite compatibility query wrapper
      try {
        const res = await pgliteInstance.query(text, params);
        return {
          rows: res.rows || [],
          rowCount: res.affectedRows ?? (res.rows ? res.rows.length : 0),
          fields: res.fields || []
        };
      } catch (err) {
        throw err;
      }
    },
    isPGlite: true
  };
}

export async function query(text, params = []) {
  const db = await getDb();
  return db.query(text, params);
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
  if (pgliteInstance) {
    if (typeof pgliteInstance.close === 'function') {
      await pgliteInstance.close();
    }
    pgliteInstance = null;
  }
}

