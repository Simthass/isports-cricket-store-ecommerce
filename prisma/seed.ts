import dotenv from "dotenv";
dotenv.config({ path: ".env" });
console.log("Full URL:", process.env.DATABASE_URL);

import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Debug — remove after confirming it works
console.log(
  "DB URL loaded:",
  process.env.DATABASE_URL ? "✅ Yes" : "❌ Missing",
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing connection...");
  const result = await prisma.$queryRaw`SELECT 1 as test`;
  console.log("✅ Connected!", result);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
