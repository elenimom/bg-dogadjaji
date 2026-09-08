import pg from 'pg';
export function createPool(connectionString = process.env.DATABASE_URL) {
  // Docker prosledjuje PG* vrednosti, lokalni razvoj koristi DATABASE_URL.
  if (!connectionString && !(process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER && process.env.PGPASSWORD)) {
    throw new Error('Podesiti DATABASE_URL ili PGHOST, PGDATABASE, PGUSER i PGPASSWORD.');
  }
  return new pg.Pool({ ...(connectionString ? { connectionString } : {}), max: 10 });
}
