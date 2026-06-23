import { isLocale, type Locale } from "@/i18n/config";
import { enabledOAuthProviders } from "@/lib/withwiz-auth";
import { LoginScreenView, type UiOAuthProvider } from "@/components/auth/AuthScreens";

const UI_PROVIDERS: UiOAuthProvider[] = ["google", "github", "kakao"];

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "ko";

  // 백엔드에 등록된 provider 중 auth-ui 가 버튼을 그릴 수 있는 것만
  const providers = enabledOAuthProviders().filter((p): p is UiOAuthProvider =>
    (UI_PROVIDERS as string[]).includes(p),
  );

  return (
    <LoginScreenView locale={locale} providers={providers} redirectAfterLogin={`/${locale}/admin`} />
  );
}
