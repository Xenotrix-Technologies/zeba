import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Database Fallback & Production Isolation Tests', () => {

  test('Refuses PGlite fallback and throws descriptive error in production environment when remote DB is invalid', async () => {
    // Run an isolated node process with NODE_ENV=production and invalid DATABASE_URL
    const script = `
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://invalid_user:invalid_pass@127.0.0.1:59999/invalid_db';
      delete process.env.POSTGRES_URL;

      import('./server/src/config/db.js').then(async m => {
        try {
          await m.getDb();
          process.send({ success: true });
        } catch (err) {
          process.send({ error: err.message });
        }
      });
    `;

    const result = await new Promise((resolve) => {
      const child = fork('-e', [script], {
        cwd: path.resolve(__dirname, '../../'),
        stdio: ['pipe', 'pipe', 'pipe', 'ipc']
      });

      child.on('message', (msg) => {
        resolve(msg);
      });

      child.on('exit', () => {
        resolve({ exited: true });
      });
    });

    assert.ok(result.error, 'Production database must fail and report an error');
    assert.match(
      result.error,
      /Production database connection failed.*Ephemeral fallback is strictly blocked/i,
      'Must explicitly block ephemeral fallback in production'
    );
  });

  test('Refuses ephemeral fallback in production if DATABASE_URL is missing entirely', async () => {
    const script = `
      process.env.NODE_ENV = 'production';
      delete process.env.DATABASE_URL;
      delete process.env.POSTGRES_URL;
      delete process.env.POSTGRES_PRISMA_URL;
      delete process.env.POSTGRES_URL_NON_POOLING;

      import('./server/src/config/db.js').then(async m => {
        try {
          await m.getDb();
          process.send({ success: true });
        } catch (err) {
          process.send({ error: err.message });
        }
      });
    `;

    const result = await new Promise((resolve) => {
      const child = fork('-e', [script], {
        cwd: path.resolve(__dirname, '../../'),
        stdio: ['pipe', 'pipe', 'pipe', 'ipc']
      });

      child.on('message', (msg) => {
        resolve(msg);
      });

      child.on('exit', () => {
        resolve({ exited: true });
      });
    });

    assert.ok(result.error, 'Must error when DATABASE_URL is missing in production');
    assert.match(
      result.error,
      /DATABASE_URL is required in production environments/i
    );
  });
});
