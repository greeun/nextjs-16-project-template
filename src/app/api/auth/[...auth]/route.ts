import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createAuthHandlers } from "@withwiz/toolkit/next/auth-handlers";
import { buildAuthOptions } from "@/lib/withwiz-auth";

// toolkit 전 인증 기능: login/register/logout/refresh/me/forgot/reset/verify/oauth
const handlers = createAuthHandlers(buildAuthOptions());

type Ctx = { params: Promise<{ auth: string[] }> };

async function dispatch(req: NextRequest, ctx: Ctx): Promise<Response> {
  const { auth } = await ctx.params;
  const path = auth.join("/");
  const method = req.method;

  if (method === "POST" && path === "login") return handlers.login(req);
  if (method === "POST" && path === "register") return handlers.register(req);
  if (method === "POST" && path === "logout") return handlers.logout(req);
  if (method === "POST" && path === "refresh") return handlers.refresh(req);
  if (method === "GET" && path === "me") return handlers.me(req);
  if (method === "POST" && path === "forgot-password") return handlers.forgotPassword(req);
  if (method === "POST" && path === "reset-password") return handlers.resetPassword(req);
  if (method === "POST" && path === "verify-email") return handlers.verifyEmail(req);
  if (method === "GET" && path === "verify-email") return handlers.verifyEmail(req);
  // OAuth 시작: auth-ui 가 { provider } 를 POST → { loginUrl } 기대
  if (method === "POST" && path === "oauth/login") return handlers.oauthAuthorize(req);
  // OAuth 콜백: provider 콘솔이 여기로 리다이렉트. provider 는 마지막 경로 세그먼트
  if (method === "GET" && path.startsWith("oauth/callback/")) return handlers.oauthCallback(req);

  return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
}

export const GET = dispatch;
export const POST = dispatch;
