# nextjs-16-project-template

withwiz 패키지(`@withwiz/toolkit` · `@withwiz/ui` · `@withwiz/auth-ui`) 기반 **Next.js 16 보일러플레이트**.

- **스택**: Next.js 16 · React 19 · TypeScript 5 · Prisma 7 · PostgreSQL 16
- **인증**: `@withwiz/toolkit` 전 기능 — 이메일/비번 로그인, 회원가입, OAuth(5종), 비밀번호 재설정, 이메일 인증, 매직링크
- **UI**: `@withwiz/ui` + `@withwiz/auth-ui` + Tailwind CSS 4 + 경량 테마(light/dark/system, 기본 light)
- **i18n**: ko / en / ja (`[locale]` 라우팅 + 미들웨어 협상)
- **모듈**: Docker(compose + standalone Dockerfile), Rate Limit + Email(SMTP), Vitest + Playwright

## 템플릿으로 새 프로젝트 시작

이 repo 는 **public GitHub Template Repository** 다. 새 프로젝트는 아래 중 하나로 시작한다.

```bash
# 방법 A — degit 으로 파일만(히스토리 없이) 가져온다. 인증 불필요
npx degit greeun/nextjs-16-project-template my-saas && cd my-saas

# 방법 B — gh 로 얕은 clone 후 템플릿 히스토리를 끊는다
gh repo clone greeun/nextjs-16-project-template my-saas -- --depth=1 \
  && rm -rf my-saas/.git && cd my-saas

# 방법 C — GitHub "Use this template" 로 새 repo 생성 후 clone
git clone <새-repo-url> my-saas && cd my-saas
```

그다음 **초기화 스크립트**로 프로젝트명·포트·DB명을 일괄 치환한다:

```bash
./scripts/init-from-template.sh my-saas 180
#                               └이름     └포트블록(3자리) → 18000/18001/18005/18006/18030, DB my_saas
```

스크립트가 하는 일: 이름(`nextjs-16-project-template`)·포트(`179xx`)·DB명(`nextjs_16_project_template`) 치환 + `.env.local` 생성(JWT_SECRET 랜덤) + 템플릿 흔적 제거 + git 히스토리 새로 시작. 이후 워크스페이스 `PORTS.md` 에 새 블록을 등록하고, `pnpm install` 뒤에 `pnpm add @withwiz/toolkit@latest @withwiz/ui@latest @withwiz/auth-ui@latest` 로 withwiz 를 npm 게시 최신 버전으로 올린다.

## 빠른 시작

```bash
# 0) 환경변수 — 반드시 의존성 설치보다 먼저. postinstall(prisma generate)이 DATABASE_URL 을 읽는다
cp .env.example .env.local   # JWT_SECRET 등 채우기

# 1) 의존성
pnpm install

# 2) DB (docker postgres:16, 포트 17901)
docker compose up -d
pnpm db:migrate
pnpm db:seed                 # Owner 계정(admin@example.local / changeme-dev-only)

# 3) 개발 서버 → http://localhost:17900
pnpm local
```

## 포트 (179xx 블록)

앱 `17900` · DB `17901` · 테스트 앱 `17905` · 테스트 DB `17906` · Prisma Studio `17930`

## 구조·명령어

자세한 내용은 [CLAUDE.md](./CLAUDE.md) 참고.
