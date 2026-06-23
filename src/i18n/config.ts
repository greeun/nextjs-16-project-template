// i18n 설정 — 지원 로케일 ko/en/ja.
export const locales = ["ko", "en", "ja"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale) ?? "ko";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Accept-Language 헤더 → 지원 로케일 매칭 (없으면 defaultLocale). */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;
  for (const part of acceptLanguage.split(",")) {
    const tag = part.split(";")[0].trim().toLowerCase();
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}
