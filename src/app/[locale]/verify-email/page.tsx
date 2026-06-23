import { isLocale, type Locale } from "@/i18n/config";
import { EmailVerificationScreenView } from "@/components/auth/AuthScreens";

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale: raw } = await params;
  const { token = "" } = await searchParams;
  const locale: Locale = isLocale(raw) ? raw : "ko";
  return <EmailVerificationScreenView locale={locale} token={token} />;
}
