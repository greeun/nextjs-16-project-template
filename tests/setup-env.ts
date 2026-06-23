import { config } from "dotenv";

// prisma.config.ts 와 동일 규칙: DATABASE_URL 미주입 시 .env.test → .env.local 순.
if (!process.env.DATABASE_URL) {
  config({ path: process.env.ENV_FILE || ".env.test" });
}
if (!process.env.DATABASE_URL) {
  config({ path: ".env.local" });
}
