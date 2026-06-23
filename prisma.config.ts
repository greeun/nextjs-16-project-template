import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// 프로필 분리: 로컬=.env.local / 공용 dev=.env.dev.
// 이미 env 가 주입된 경우(dotenv -e .env.dev -- prisma ...)는 건너뜀 → 누수 방지.
if (!process.env.DATABASE_URL) {
  config({ path: process.env.ENV_FILE || ".env.local" });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
