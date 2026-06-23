import { isLocale, type Locale } from "@/i18n/config";
import { enabledOAuthProviders } from "@/lib/withwiz-auth";
import { SignupScreenView, type UiOAuthProvider } from "@/components/auth/AuthScreens";

const UI_PROVIDERS: UiOAuthProvider[] = ["google", "github", "kakao"];

export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "ko";
  const providers = enabledOAuthProviders().filter((p): p is UiOAuthProvider =>
    (UI_PROVIDERS as string[]).includes(p),
  );
  return <SignupScreenView locale={locale} providers={providers} />;
}
