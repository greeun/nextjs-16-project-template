import { defineConfig, devices } from "@playwright/test";

// E2E 는 테스트 프로필(.env.test, 포트 17905)로 구동되는 서버를 대상으로 한다.
// 서버는 운영 배포와 동일한 프로덕션 산출물(next build → .next/standalone/server.js)로 뜬다
// — next dev 는 Turbopack 컴파일러가 상주해 E2E 전 라우트 순회 시 메모리가 수 GB 로 커진다.
const PORT = 17905;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // 매 실행마다 프로덕션 빌드 후 standalone 서버 기동(timeout 은 빌드 시간 포함).
    // 반복 실행 시엔 17905 에 서버를 미리 띄워두면 재사용된다(reuseExistingServer).
    command: "pnpm test:server:build && pnpm test:server",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
