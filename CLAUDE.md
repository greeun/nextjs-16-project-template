# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때의 지침이다.

## 기본 규칙

- **언어**: 모든 대화·문서는 한국어.
- **로컬 실행**: `pnpm local` (= `next dev -p 17900`, `.env.local` 자동 로드).

## 개요

nextjs-16-project-template — withwiz 패키지(`@withwiz/toolkit` · `@withwiz/ui` · `@withwiz/auth-ui`) 기반
Next.js 16 보일러플레이트. toolkit 인증 전 기능(이메일/비번 로그인·회원가입·OAuth·비밀번호 재설정·
이메일 인증·매직링크) + i18n(ko/en/ja) + Docker + Vitest/Playwright 가 통합돼 있다.

> 빈 보일러플레이트다. 도메인 모델/페이지는 여기에 추가한다.

## 명령어

```bash
pnpm local            # 로컬 dev — 포트 17900 (.env.local)
pnpm dev:remote       # 공용 dev — .env.dev
pnpm build            # prisma generate && migrate deploy && next build
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
pnpm test             # vitest run (단위)
pnpm test:e2e         # playwright (E2E — test:server 자동 구동, 포트 17905)

# DB (로컬 docker postgres:16, 호스트 포트 17901)
docker compose up -d
pnpm db:migrate       # prisma migrate dev
pnpm db:seed          # 부트스트랩 Owner 계정
pnpm db:studio        # prisma studio -p 17930
```

## 포트 (211-withwiz PORTS.md — 179xx 블록)

| 용도 | 포트 |
|---|---|
| 앱 (dev/local) | 17900 |
| PostgreSQL (dev) | 17901 |
| 테스트 앱 (E2E) | 17905 |
| PostgreSQL (test) | 17906 |
| Prisma Studio | 17930 |

## 아키텍처

```
src/
├── proxy.ts              # Next 16 미들웨어: 로케일 협상 + /admin 인증 게이트
├── instrumentation.ts    # 서버 부팅 배너
├── i18n/                 # 로케일 설정 + 사전(ko/en/ja)
├── lib/
│   ├── db.ts             # Prisma 7 + @prisma/adapter-pg
│   ├── withwiz-auth.ts   # toolkit 인증 옵션(전 기능) + OAuth 5종 + emailSender
│   ├── auth.ts           # 세션 헬퍼(getSessionUser 등)
│   └── email.ts          # toolkit SmtpEmailSender (SMTP 미설정 시 콘솔 폴백)
├── components/
│   ├── auth/AuthScreens.tsx   # @withwiz/auth-ui 화면 래퍼(로그인/가입/재설정/인증)
│   ├── ThemeToggle, LocaleSwitcher, LogoutButton, ThemeProvider
└── app/
    ├── [locale]/         # 로케일 세그먼트(html/body 여기 — root layout 없음)
    │   ├── layout.tsx · page.tsx
    │   ├── login · signup · forgot-password · reset-password · verify-email
    │   └── admin/        # 인증 필요(proxy 게이트 + 서버 재확인)
    └── api/
        ├── auth/[...auth]/route.ts   # toolkit createAuthHandlers 디스패치
        └── example/route.ts          # toolkit 미들웨어 체인(withPublicApi/withAuthApi)
```

## withwiz 통합 핵심

- **인증 백엔드**: `createAuthHandlers(buildAuthOptions())` — `/api/auth/{login,register,logout,
  refresh,me,forgot-password,reset-password,verify-email,oauth/login,oauth/callback/*}`.
- **OAuth provider**: 백엔드 5종(google/github/kakao/microsoft/meta). env 에 id+secret 둘 다 있는
  것만 등록. UI 버튼(auth-ui)은 google/github/kakao 3종만 렌더.
- **Prisma 어댑터**: `PrismaUserRepository` 등 — User/Account/AccountToken/EmailToken 표준 테이블.
- **미들웨어**: `withPublicApi`/`withAuthApi` 가 error→security→cors→initRequest→rateLimit→logger 체인 적용.

## 의존성 규칙

- 인증 시크릿 `JWT_SECRET` 은 비-dev/test 환경에서 32자 이상 필수(미설정 시 부팅 거부).
- `@withwiz/*` 는 npm 게시 **최신** 버전 사용(file: dep 아님). 올릴 때 `pnpm add @withwiz/toolkit@latest @withwiz/ui@latest @withwiz/auth-ui@latest` 후 `pnpm typecheck && pnpm lint && pnpm test` 로 확인.
- `pnpm install` 은 `.env.local` 생성 뒤에 실행한다 — postinstall(`prisma generate`)이 `DATABASE_URL` 을 요구한다.
