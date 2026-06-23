"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n/config";

const LABEL: Record<Locale, string> = { ko: "한국어", en: "English", ja: "日本語" };

/** 현재 경로의 로케일 프리픽스를 교체하고 NEXT_LOCALE 쿠키를 갱신. */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(locale: Locale) {
    const segments = pathname.split("/");
    if (isLocale(segments[1])) segments[1] = locale;
    else segments.splice(1, 0, locale);
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.push(segments.join("/") || "/");
  }

  return (
    <select
      aria-label="언어 선택"
      value={current}
      onChange={(e) => switchTo(e.target.value as Locale)}
      className="border-border bg-background text-foreground rounded-md border px-2 py-1 text-sm"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {LABEL[l]}
        </option>
      ))}
    </select>
  );
}
