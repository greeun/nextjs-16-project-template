import { isLocale, type Locale } from "@/i18n/config";
import { ForgotPasswordScreenView } from "@/components/auth/AuthScreens";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "ko";
  return <ForgotPasswordScreenView locale={locale} />;
}
