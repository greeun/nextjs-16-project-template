/**
 * instrumentation.ts — Next.js 서버 초기화 훅 (서버 시작 시 1회).
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
import { printStartupBanner, mask, status, modeLabel } from "./startup-banner";

function logStartupBanner() {
  const env = process.env;
  const nodeVersion = globalThis.process?.version ?? "unknown";

  printStartupBanner({
    title: "🚀 nextjs-16-project-template",
    version: env.npm_package_version ?? "unknown",
    sections: [
      {
        emoji: "⚙️",
        title: "Environment",
        lines: [
          ["Mode", modeLabel(env.NODE_ENV)],
          ["Node", nodeVersion],
          ["Base URL", mask(env.NEXT_PUBLIC_APP_URL, "url")],
          ["Default locale", env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "ko"],
        ],
      },
      {
        emoji: "💾",
        title: "Database",
        lines: [["DATABASE_URL", mask(env.DATABASE_URL, "url")]],
      },
      {
        emoji: "🔐",
        title: "Auth & Security",
        lines: [
          ["JWT_SECRET", mask(env.JWT_SECRET, "secret")],
          ["Rate limit", status(env.RATE_LIMIT_ENABLED === "true")],
          ["Email verify", status(env.EMAIL_VERIFICATION_REQUIRED === "true")],
        ],
      },
      {
        emoji: "🌐",
        title: "External Services",
        lines: [
          ["SMTP (email)", status(!!env.SMTP_HOST)],
          ["Google OAuth", status(!!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET)],
          ["GitHub OAuth", status(!!env.GITHUB_CLIENT_ID && !!env.GITHUB_CLIENT_SECRET)],
        ],
      },
    ],
  });
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  logStartupBanner();
}
