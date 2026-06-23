import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSessionUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "ko";
  const dict = await getDictionary(locale);

  // proxy 가 1차 게이트지만, 서버 컴포넌트에서도 방어적으로 재확인
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);

  const welcome = dict.admin.welcome.replace("{name}", user.name || user.email);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border flex items-center justify-between border-b px-6 py-4">
        <span className="font-semibold tracking-tight">{dict.admin.title}</span>
        <div className="flex items-center gap-3">
          <LocaleSwitcher current={locale} />
          <ThemeToggle />
          <LogoutButton label={dict.admin.logout} loginHref={`/${locale}/login`} />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{welcome}</h1>
        <p className="text-muted-foreground">
          {user.email} · <code className="text-xs">{user.role}</code>
        </p>
      </main>
    </div>
  );
}
