import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createPool } from '../src/db.js';

const pool = createPool();
const client = await pool.connect();
try {
  // Sprečava da dva procesa istovremeno menjaju šemu.
  await client.query('SELECT pg_advisory_lock(8421701)');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  const dir = new URL('../migrations/', import.meta.url);
  for (const name of (await readdir(dir)).filter(n => n.endsWith('.sql')).sort()) {
    const sql = await readFile(new URL(name, dir), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const previous = await client.query('SELECT checksum FROM schema_migrations WHERE name = $1', [name]);
    if (previous.rowCount) {
      if (previous.rows[0].checksum !== checksum) throw new Error('Izmenjena vec izvrsena migracija: ' + name);
      continue;
    }
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(name, checksum) VALUES ($1, $2)', [name, checksum]);
      await client.query('COMMIT');
      console.log('Primenjena migracija: ' + name);
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }
} finally {
  await client.query('SELECT pg_advisory_unlock(8421701)');
  client.release();
  await pool.end();
}
