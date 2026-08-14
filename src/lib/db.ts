import { Pool } from "pg";

declare global {
  var __picbookPool: Pool | undefined;
  var __picbookDbReady: Promise<void> | undefined;
}

export function getPool(): Pool {
  if (!global.__picbookPool) {
    global.__picbookPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return global.__picbookPool;
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
      is_guest BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT false;`
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS photobooks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      cover_photo_id UUID,
      template TEXT NOT NULL DEFAULT 'custom',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await pool.query(
    `ALTER TABLE photobooks ADD COLUMN IF NOT EXISTS template TEXT NOT NULL DEFAULT 'custom';`
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      book_id UUID NOT NULL REFERENCES photobooks(id) ON DELETE CASCADE,
      layout TEXT NOT NULL DEFAULT 'single',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      book_id UUID NOT NULL REFERENCES photobooks(id) ON DELETE CASCADE,
      page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
      slot INTEGER,
      filename TEXT NOT NULL,
      original_name TEXT,
      caption TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await pool.query(
    `ALTER TABLE photos ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE SET NULL;`
  );
  await pool.query(`ALTER TABLE photos ADD COLUMN IF NOT EXISTS slot INTEGER;`);

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
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_pages_book_id ON pages(book_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_photos_page_id ON photos(page_id);`);
}

export function ensureDb(): Promise<void> {
  if (!global.__picbookDbReady) {
    global.__picbookDbReady = initSchema(getPool());
  }
  return global.__picbookDbReady;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) {
  await ensureDb();
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(
  fn: (client: import("pg").PoolClient) => Promise<T>
): Promise<T> {
  await ensureDb();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
