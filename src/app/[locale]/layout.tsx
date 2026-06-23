import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LangSync } from "@/components/LangSync";
import { locales, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(isLocale(locale) ? locale : "ko");
  return { title: dict.meta.title, description: dict.meta.description };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  // proxy 가 유효 로케일을 보장 — 방어적으로 invalid 는 ko 로 폴백
  const locale: Locale = isLocale(raw) ? raw : "ko";

  // html/body 는 루트 app/layout.tsx 가 렌더(no-flash script 포함). 여기선 테마/로케일 컨텍스트만.
  return (
    <ThemeProvider defaultTheme="light">
      <LangSync locale={locale} />
      {children}
      <Toaster theme="light" richColors position="top-center" />
    </ThemeProvider>
  );
}
