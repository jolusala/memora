import { Pool } from "pg";

declare global {
  var __memoraPool: Pool | undefined;
  var __memoraDbReady: Promise<void> | undefined;
}

export function getPool(): Pool {
  if (!global.__memoraPool) {
    global.__memoraPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return global.__memoraPool;
}

async function initSchema(pool: Pool) {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT NOT NULL,
      avatar_url TEXT,
      google_id TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS photobooks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      cover_photo_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      book_id UUID NOT NULL REFERENCES photobooks(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT,
      caption TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'photobooks_cover_photo_id_fkey'
      ) THEN
        ALTER TABLE photobooks
          ADD CONSTRAINT photobooks_cover_photo_id_fkey
          FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_photobooks_user_id ON photobooks(user_id);`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_photos_book_id ON photos(book_id);`
  );
}

export function ensureDb(): Promise<void> {
  if (!global.__memoraDbReady) {
    global.__memoraDbReady = initSchema(getPool());
  }
  return global.__memoraDbReady;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) {
  await ensureDb();
  return getPool().query<T>(text, params);
}
