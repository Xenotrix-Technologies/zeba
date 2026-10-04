import pg from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

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

  const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;

  if (rawDbUrl && rawDbUrl.trim() !== '') {
    try {
      let dbUrl = rawDbUrl.trim();
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

      pool = new Pool({
        connectionString: cleanUrl,
        ssl: isRemote ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 15000,
        idleTimeoutMillis: 30000,
        max: 20
      });
      // Test connection
      await pool.query('SELECT 1');
      console.log('✅ Connected to Supabase / PostgreSQL database successfully');
      return { query: (text, params) => pool.query(text, params), isPGlite: false };
    } catch (err) {
      console.warn('⚠️ Could not connect to remote DATABASE_URL, falling back to embedded PostgreSQL (PGlite)...', err.message);
      pool = null;
    }
  }

  // Fallback to embedded PGlite (Real PostgreSQL 16 engine)
  const dataDir = process.env.VERCEL ? '/tmp/postgres' : path.resolve(__dirname, '../../data/postgres');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const { PGlite } = await import('@electric-sql/pglite');
  pgliteInstance = new PGlite(dataDir);
  isPGlite = true;
  console.log(`✅ Embedded PostgreSQL engine initialized at ${dataDir}`);

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

