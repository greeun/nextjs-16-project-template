import type { EmailSender } from "@withwiz/toolkit/core/auth/types";
import { SmtpEmailSender } from "@withwiz/toolkit/core/auth/email/sender";

/**
 * 인증 메일 전송기(EmailSender) 팩토리.
 * - SMTP_HOST 설정 시: nodemailer 기반 toolkit SmtpEmailSender
 * - 미설정 시: 콘솔 로깅 폴백 (로컬/테스트에서 토큰 확인용)
 *
 * withwiz-auth.ts 의 dependencies.emailSender 로 주입되어
 * 비밀번호 재설정·이메일 인증 메일에 사용된다.
 */
class ConsoleEmailSender implements EmailSender {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.info(`[email:console] verification → ${email}  token=${token}`);
  }
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    console.info(`[email:console] password-reset → ${email}  token=${token}`);
  }
  async sendMagicLinkEmail(email: string, token: string): Promise<void> {
    console.info(`[email:console] magic-link → ${email}  token=${token}`);
  }
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.info(`[email:console] welcome → ${email}  name=${name}`);
  }
}

let cached: EmailSender | undefined;

export function getEmailSender(): EmailSender {
  if (cached) return cached;

  const host = process.env.SMTP_HOST;
  if (!host) {
    cached = new ConsoleEmailSender();
    return cached;
  }

  cached = new SmtpEmailSender({
    host,
    port: Number(process.env.SMTP_PORT ?? "587"),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.EMAIL_FROM ?? "nextjs-16-project-template <no-reply@example.local>",
    baseUrl: process.env.APP_BASE_URL ?? "http://localhost:17900",
    secure: process.env.SMTP_SECURE === "true",
  });
  return cached;
}
