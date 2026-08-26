import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import "dotenv/config"; 

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
    const client = await pool.connect();
    console.log("Database connected!");
    client.release();
} catch (err) {
    console.error("Database connection failed:", err);
}

export const db = drizzle(pool);