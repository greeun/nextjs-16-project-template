import "server-only";
import type { Locale } from "@/i18n/config";

// 서버 전용 사전 로더 — 필요한 로케일만 동적 import.
const dictionaries = {
  ko: () => import("@/i18n/dictionaries/ko.json").then((m) => m.default),
  en: () => import("@/i18n/dictionaries/en.json").then((m) => m.default),
  ja: () => import("@/i18n/dictionaries/ja.json").then((m) => m.default),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["ko"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return (dictionaries[locale] ?? dictionaries.ko)();
}
