import { jwtVerify } from "jose";
import {
  PrismaUserRepository,
  PrismaOAuthAccountRepository,
  PrismaEmailTokenRepository,
} from "@withwiz/toolkit/prisma/auth-adapter";
import type { AuthHandlerOptions } from "@withwiz/toolkit/next/auth-types";
import type { OAuthProviderName } from "@withwiz/toolkit/core/auth/types";
import { db } from "@/lib/db";
import { getEmailSender } from "@/lib/email";

/** JWT 시크릿 — 비-dev/test 환경에서는 32자 이상 실 시크릿 강제. */
export const JWT_SECRET = (() => {
  const s = process.env.JWT_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
    throw new Error("JWT_SECRET must be set (>=32 chars) outside development/test");
  }
  return "dev-secret-change-do-not-use-in-prod-0000000000";
})();

// User.passwordHash / emailVerified / role / image 매핑, 토큰 3종 → emailToken 단일 테이블.
const adapterConfig = {
  userFields: { password: "passwordHash", emailVerified: "emailVerified", role: "role", image: "image" },
  tokenTables: { emailVerification: "emailToken", passwordReset: "emailToken", magicLink: "emailToken" },
};

const userRepository = new PrismaUserRepository(db, adapterConfig);
const oauthAccountRepository = new PrismaOAuthAccountRepository(db);
const emailTokenRepository = new PrismaEmailTokenRepository(db, adapterConfig);

// toolkit 이 지원하는 전체 OAuth provider. env 에 id+secret 둘 다 있는 것만 등록된다.
const ALL_PROVIDERS: { name: OAuthProviderName; idEnv: string; secretEnv: string }[] = [
  { name: "google", idEnv: "GOOGLE_CLIENT_ID", secretEnv: "GOOGLE_CLIENT_SECRET" },
  { name: "github", idEnv: "GITHUB_CLIENT_ID", secretEnv: "GITHUB_CLIENT_SECRET" },
  { name: "kakao", idEnv: "KAKAO_CLIENT_ID", secretEnv: "KAKAO_CLIENT_SECRET" },
  { name: "microsoft", idEnv: "MICROSOFT_CLIENT_ID", secretEnv: "MICROSOFT_CLIENT_SECRET" },
  { name: "meta", idEnv: "META_CLIENT_ID", secretEnv: "META_CLIENT_SECRET" },
];

function buildOAuthConfig(baseUrl: string): {
  providers: OAuthProviderName[];
  oauth: Record<string, { clientId: string; clientSecret: string; redirectUri: string }>;
} {
  const providers: OAuthProviderName[] = [];
  const oauth: Record<string, { clientId: string; clientSecret: string; redirectUri: string }> = {};

  for (const p of ALL_PROVIDERS) {
    const id = process.env[p.idEnv];
    const secret = process.env[p.secretEnv];
    if (!id || !secret) continue;
    providers.push(p.name);
    oauth[p.name] = {
      clientId: id,
      clientSecret: secret,
      // callback: /api/auth/oauth/callback/{provider} (route.ts dispatch 와 일치)
      redirectUri: `${baseUrl}/api/auth/oauth/callback/${p.name}`,
    };
  }

  return { providers, oauth };
}

/** env 에 등록된 OAuth provider 목록 — 로그인 UI 버튼 동기화용. */
export function enabledOAuthProviders(): OAuthProviderName[] {
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:17900";
  return buildOAuthConfig(baseUrl).providers;
}

/** toolkit 인증 핸들러 옵션 — 전 기능 활성화. */
export function buildAuthOptions(): AuthHandlerOptions {
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:17900";
  const { providers, oauth } = buildOAuthConfig(baseUrl);

  return {
    dependencies: {
      userRepository,
      oauthAccountRepository,
      emailTokenRepository,
      // 비밀번호 재설정·이메일 인증·매직링크 메일 전송기 (SMTP 미설정 시 콘솔 폴백)
      emailSender: getEmailSender(),
    },
    providers,
    oauth,
    jwt: { secret: JWT_SECRET, accessTokenExpiry: "7d", refreshTokenExpiry: "30d" },
    urls: {
      baseUrl,
      afterLogin: "/admin",
      afterOAuth: "/admin",
      afterLogout: "/login",
    },
    features: {
      // 전 기능 도입: 회원가입/재설정/매직링크/이메일인증.
      // emailVerificationRequired 는 SMTP 의존이라 env 로 토글(기본 false → SMTP 없이도 동작).
      emailVerificationRequired: process.env.EMAIL_VERIFICATION_REQUIRED === "true",
      passwordResetEnabled: true,
      magicLinkEnabled: true,
    },
    cookie: { secure: process.env.NODE_ENV === "production", sameSite: "lax" },
  };
}

/** access_token 쿠키 검증 → userId claim 또는 null. */
export async function verifyAccessToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    if (payload.tokenType !== "access") return null;
    const uid = (payload.userId ?? payload.id) as unknown;
    return typeof uid === "string" ? uid : null;
  } catch {
    return null;
  }
}
