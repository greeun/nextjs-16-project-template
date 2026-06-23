import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone: Docker 배포용 self-contained 산출물 (.next/standalone)
  output: "standalone",
  // Prisma 7 driver-adapter deps 는 server-only 네이티브 모듈 — 번들/트랜스파일 제외.
  // 트랜스파일하면 pnpm 하에서 Turbopack server resolve 가 깨진다(pg-pool 미호이스트).
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
};

export default nextConfig;
