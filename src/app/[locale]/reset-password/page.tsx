import { isLocale, type Locale } from "@/i18n/config";
import { ResetPasswordScreenView } from "@/components/auth/AuthScreens";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale: raw } = await params;
  const { token = "" } = await searchParams;
  const locale: Locale = isLocale(raw) ? raw : "ko";
  return <ResetPasswordScreenView locale={locale} token={token} />;
}
