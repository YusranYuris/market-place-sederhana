import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

try {
  const connection = await pool.connect();

  console.log("Database connected successfully");

  connection.release();
} catch (error) {
  console.error("Database connection failed:", error);
}