"use client";
import {
  LoginScreen,
  SignupScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  EmailVerificationScreen,
} from "@withwiz/auth-ui/screens";
import "@withwiz/auth-ui/styles";
import type { Locale } from "@/i18n/config";

// auth-ui UI 가 버튼을 그릴 수 있는 OAuth provider (toolkit 백엔드는 5종이지만 UI 는 3종)
export type UiOAuthProvider = "google" | "github" | "kakao";

const logo = <span className="text-lg font-semibold tracking-tight">nextjs-project-wizard</span>;
const visual = { pattern: "triangle" as const, backgroundColor: "#f0f4ff", logo };

/** auth-ui 는 light 전용 — 다크 토글과 무관하게 라이트 토큰으로 격리. */
function AuthLight({ children }: { children: React.ReactNode }) {
  return <div className="force-light min-h-screen">{children}</div>;
}

/** 로그인 화면 — 이메일/비번 + OAuth + 매직링크 + 회원가입 링크. */
export function LoginScreenView({
  locale,
  providers,
  redirectAfterLogin,
}: {
  locale: Locale;
  providers: UiOAuthProvider[];
  redirectAfterLogin: string;
}) {
  return (
    <AuthLight>
      <LoginScreen
        {...visual}
        locale={locale}
        apiBasePath="/api/auth"
        redirectAfterLogin={redirectAfterLogin}
        providers={providers}
        showSignupLink
        showForgotPassword
        showMagicLink
      />
    </AuthLight>
  );
}

/** 회원가입 화면. */
export function SignupScreenView({
  locale,
  providers,
}: {
  locale: Locale;
  providers: UiOAuthProvider[];
}) {
  return (
    <AuthLight>
      <SignupScreen {...visual} locale={locale} apiBasePath="/api/auth" providers={providers} />
    </AuthLight>
  );
}

/** 비밀번호 찾기 화면. */
export function ForgotPasswordScreenView({ locale }: { locale: Locale }) {
  return (
    <AuthLight>
      <ForgotPasswordScreen {...visual} locale={locale} apiBasePath="/api/auth" />
    </AuthLight>
  );
}

/** 비밀번호 재설정 화면. token 은 이메일 링크의 ?token= 쿼리. */
export function ResetPasswordScreenView({ locale, token }: { locale: Locale; token: string }) {
  return (
    <AuthLight>
      <ResetPasswordScreen {...visual} locale={locale} apiBasePath="/api/auth" token={token} />
    </AuthLight>
  );
}

/** 이메일 인증 화면. token 은 이메일 링크의 ?token= 쿼리. */
export function EmailVerificationScreenView({ locale, token }: { locale: Locale; token: string }) {
  return (
    <AuthLight>
      <EmailVerificationScreen {...visual} locale={locale} apiBasePath="/api/auth" token={token} />
    </AuthLight>
  );
}
