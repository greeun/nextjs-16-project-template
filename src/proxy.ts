import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { isLocale, matchLocale } from "@/i18n/config";

function secretKey(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (s && s.length >= 32) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
    throw new Error("JWT_SECRET must be set (>=32 chars) outside development/test");
  }
  return new TextEncoder().encode("dev-secret-change-do-not-use-in-prod-0000000000");
}

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    // access 토큰만 통과(refresh/위조 차단) — toolkit 이 tokenType:"access" 부여
    return payload.tokenType === "access";
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];

  // 1) 로케일 협상: 프리픽스 없으면 쿠키→Accept-Language→default 로 결정 후 리다이렉트
  if (!isLocale(first)) {
    const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
    const locale =
      cookieLocale && isLocale(cookieLocale)
        ? cookieLocale
        : matchLocale(req.headers.get("accept-language"));
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const res = NextResponse.redirect(url);
    res.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  // 2) auth 게이트: /{locale}/admin 은 인증 필요
  const rest = "/" + pathname.split("/").slice(2).join("/"); // 로케일 제거한 경로
  if (rest.startsWith("/admin")) {
    if (!(await isAuthed(req))) {
      const url = req.nextUrl.clone();
      url.pathname = `/${first}/login`;
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// /api, /_next, 정적 파일 제외한 모든 경로
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
