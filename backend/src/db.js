import pg from 'pg';
export function createPool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error('DATABASE_URL nije podesena.');
  return new pg.Pool({ connectionString, max: 10 });
}
