import { NextResponse } from "next/server";
import { withPublicApi, withAuthApi } from "@withwiz/toolkit/next/middleware/wrappers";

/**
 * 공개 API 예시 — toolkit 미들웨어 체인 적용:
 * errorHandler → security → cors → initRequest → rateLimit → responseLogger.
 * GET /api/example
 */
export const GET = withPublicApi(async (ctx) => {
  return NextResponse.json({
    ok: true,
    requestId: ctx.requestId,
    locale: ctx.locale,
    message: "withwiz/toolkit public API (rate-limited)",
  });
});

/**
 * 인증 필수 API 예시 — JWT 인증 미들웨어 포함.
 * POST /api/example  (access_token 쿠키 필요)
 */
export const POST = withAuthApi(async (ctx) => {
  return NextResponse.json({ ok: true, userId: ctx.user?.id ?? null });
});
