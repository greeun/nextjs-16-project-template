import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyAccessToken } from "@/lib/withwiz-auth";

export const ACCESS_COOKIE = "access_token";

/** 세션 user id (access_token 쿠키 검증). 미인증 시 null. */
export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  return verifyAccessToken(token);
}

/** 세션 user 전체 레코드. 미인증/비활성 시 null. */
export async function getSessionUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, image: true, isActive: true },
  });
  return user?.isActive ? user : null;
}

/** 가드: 인증 필수. 미인증 시 null 반환 → 호출부에서 redirect 처리. */
export async function requireUser() {
  return getSessionUser();
}
