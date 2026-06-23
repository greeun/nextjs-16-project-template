"use client";
import * as React from "react";
import type { Locale } from "@/i18n/config";

/** 루트 html.lang 을 현재 로케일로 동기화 (루트 layout 은 SSR 시 ko 고정이라 클라이언트에서 갱신). */
export function LangSync({ locale }: { locale: Locale }) {
  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
