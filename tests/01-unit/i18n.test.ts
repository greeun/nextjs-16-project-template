import { describe, it, expect } from "vitest";
import { matchLocale, isLocale, locales } from "@/i18n/config";

describe("i18n config", () => {
  it("지원 로케일은 ko/en/ja", () => {
    expect([...locales]).toEqual(["ko", "en", "ja"]);
  });

  it("isLocale 판정", () => {
    expect(isLocale("ko")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("Accept-Language 매칭", () => {
    expect(matchLocale("ja,en;q=0.9")).toBe("ja");
    expect(matchLocale("en-US,en;q=0.9")).toBe("en");
    expect(matchLocale("fr-FR")).toBe("ko"); // 미지원 → default
    expect(matchLocale(null)).toBe("ko");
  });
});
