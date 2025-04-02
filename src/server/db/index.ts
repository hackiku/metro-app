import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
	conn: postgres.Sql | undefined;
};

// original without transaction pooler
// const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
const conn = globalForDb.conn ?? postgres(env.DATABASE_URL, { 
  prepare: false // Required for Supabase Transaction Pooler
});

if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });