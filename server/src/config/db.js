import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
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

  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && dbUrl.trim() !== '') {
    try {
      pool = new Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      // Test connection
      await pool.query('SELECT 1');
      console.log('✅ Connected to PostgreSQL via DATABASE_URL');
      return { query: (text, params) => pool.query(text, params), isPGlite: false };
    } catch (err) {
      console.warn('⚠️ Could not connect to remote DATABASE_URL, initializing embedded PostgreSQL (PGlite)...', err.message);
      pool = null;
    }
  }

  // Fallback to embedded PGlite (Real PostgreSQL 16 engine)
  const dataDir = path.resolve(__dirname, '../../data/postgres');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

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
