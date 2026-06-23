import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSessionUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "ko";
  const dict = await getDictionary(locale);
  const user = await getSessionUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border flex items-center justify-between border-b px-6 py-4">
        <span className="font-semibold tracking-tight">nextjs-16-project-template</span>
        <div className="flex items-center gap-3">
          <LocaleSwitcher current={locale} />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{dict.home.title}</h1>
        <p className="text-muted-foreground max-w-xl text-lg">{dict.home.subtitle}</p>

        <div className="flex gap-3">
          {user ? (
            <Link
              href={`/${locale}/admin`}
              className="bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium"
            >
              {dict.home.cta}
            </Link>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium"
            >
              {dict.home.loginCta}
            </Link>
          )}
        </div>

        <p className="text-muted-foreground text-xs">
          Next.js 16 · React 19 · Prisma 7 · @withwiz/toolkit · @withwiz/ui · @withwiz/auth-ui
        </p>
      </main>
    </div>
  );
}
