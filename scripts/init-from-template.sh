#!/usr/bin/env bash
#
# init-from-template.sh — 이 보일러플레이트를 새 프로젝트로 초기화한다.
# 프로젝트명·포트블록을 받아 하드코딩 값(이름·포트 179xx·DB명)을 일괄 치환하고
# .env.local 을 생성(JWT_SECRET 랜덤)한다.
#
# 초기화가 끝나면 템플릿 흔적을 남기지 않는다:
#   - 문서·주석의 템플릿 안내 문구 제거 (README / CLAUDE.md / schema.prisma / .gitignore)
#   - 템플릿 git 히스토리 승계 금지 — .git 재초기화 후 새 프로젝트의 첫 커밋 1개만 남김
#   - 이 스크립트 자체 삭제 (초기 커밋에도 포함되지 않음)
#
# 사용법:  ./scripts/init-from-template.sh <project-name> <port-block-3digits>
#   예:    ./scripts/init-from-template.sh my-saas 180
#          → 이름 my-saas, 포트 18000/18001/18005/18006/18030, DB my_saas
#
set -euo pipefail

NAME="${1:-}"
BLOCK="${2:-}"
if [[ -z "$NAME" || -z "$BLOCK" ]]; then
  echo "사용법: $0 <project-name> <port-block-3digits>"
  echo "  예:   $0 my-saas 180"
  exit 1
fi
if [[ ! "$BLOCK" =~ ^[0-9]{3}$ ]]; then
  echo "오류: 포트 블록은 3자리 숫자여야 한다 (예: 180)"
  exit 1
fi

DB_NAME="${NAME//-/_}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# 치환 대상 (소스·설정·문서). .env.local 등 gitignore 파일은 아래에서 별도 생성.
FILES=(
  Dockerfile playwright.config.ts docker-compose.yml package.json README.md CLAUDE.md
  tests/e2e/home.spec.ts src/instrumentation.ts "src/app/[locale]/page.tsx"
  src/components/auth/AuthScreens.tsx src/lib/email.ts src/lib/withwiz-auth.ts
  src/i18n/dictionaries/ko.json src/i18n/dictionaries/en.json src/i18n/dictionaries/ja.json
  .env.example
)

echo "→ 치환: 포트 179xx → ${BLOCK}xx · 이름 nextjs-16-project-template → ${NAME} · DB nextjs_16_project_template → ${DB_NAME}"
for f in "${FILES[@]}"; do
  [[ -f "$f" ]] || continue
  # 179XX(뒤 2자리 유지) → BLOCKXX, 문서의 179xx 표기, DB명(snake), 프로젝트명(kebab) 순서로 치환
  sed -i.bak -E "s/179([0-9]{2})/${BLOCK}\1/g; s/179xx/${BLOCK}xx/g; s/nextjs_16_project_template/${DB_NAME}/g; s/nextjs-16-project-template/${NAME}/g" "$f"
  rm -f "$f.bak"
done

# .env.local 생성(.env.example 복사) + JWT_SECRET 랜덤 주입
if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
fi
SECRET="$(openssl rand -hex 32 2>/dev/null || head -c 48 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 48)"
sed -i.bak -E "s|^JWT_SECRET=.*|JWT_SECRET=\"${SECRET}\"|" .env.local && rm -f .env.local.bak

# ── 템플릿 흔적 제거 (문서·주석) ─────────────────────────────────────
# 위 치환은 이름/포트/DB명만 바꾼다. "이 repo 는 템플릿이다" 류의 안내 문구는
# 그대로 남으므로 여기서 지운다.
echo "→ 템플릿 흔적 제거: 문서·주석"

# "보일러플레이트" 표현 일괄 정리. i18n meta.description 은 사이트 <meta> 로 노출되므로 특히 중요.
for f in "${FILES[@]}"; do
  [[ -f "$f" ]] || continue
  sed -i.bak -E "s/Next\.js 16 보일러플레이트/Next.js 16 애플리케이션/g; \
                 s/Next\.js 16 boilerplate/Next.js 16 app/g; \
                 s/Next\.js 16 ボイラープレート/Next.js 16 アプリケーション/g" "$f"
  rm -f "$f.bak"
done

if [[ -f README.md ]]; then
  # "## 템플릿으로 새 프로젝트 시작" 절 전체 삭제 (다음 절 직전까지)
  sed -i.bak '/^## 템플릿으로 새 프로젝트 시작$/,/^## 빠른 시작$/{/^## 빠른 시작$/!d;}' README.md
  sed -i.bak -E 's/\*\*Next\.js 16 보일러플레이트\*\*/Next.js 16 애플리케이션/' README.md
  rm -f README.md.bak
fi

if [[ -f CLAUDE.md ]]; then
  sed -i.bak -E 's/Next\.js 16 보일러플레이트\./Next.js 16 애플리케이션./' CLAUDE.md
  sed -i.bak '/^> 빈 보일러플레이트다\./d' CLAUDE.md
  rm -f CLAUDE.md.bak
fi

if [[ -f prisma/schema.prisma ]]; then
  sed -i.bak '/^\/\/ 빈 보일러플레이트 스키마\.$/d' prisma/schema.prisma
  rm -f prisma/schema.prisma.bak
fi

if [[ -f .gitignore ]]; then
  sed -i.bak -E 's|^# 개인 스킬 심링크 등 — template 오염 방지$|# 개인 설정 파일|' .gitignore
  rm -f .gitignore.bak
fi

# ── git 히스토리 초기화 (템플릿 히스토리 승계 금지) ───────────────────
# 이 스크립트는 프로젝트 생성 시점에 1회만 돌린다. 그 시점에 지킬 히스토리는 없다.
# 다만 이미 남의 커밋이 쌓인 .git 을 지우면 안 되므로, 템플릿에서 유래한 .git 만 제거한다.
SELF="scripts/init-from-template.sh"
trap 'rm -f "$ROOT/$SELF"' EXIT   # 초기 커밋 이후 자기 자신 삭제

REINIT=0
if [[ ! -d .git ]]; then
  REINIT=1
else
  ORIGIN="$(git remote get-url origin 2>/dev/null || true)"
  if [[ "$ORIGIN" == *nextjs-16-project-template* ]]; then
    echo "→ 템플릿 origin 감지 — .git 제거 후 재초기화"
    rm -rf .git
    REINIT=1
  else
    echo "⚠️  기존 .git 이 있어 히스토리를 건드리지 않는다."
    echo "    템플릿 히스토리가 섞였다면 직접:  rm -rf .git && git init -b main"
  fi
fi

if (( REINIT )); then
  git init -q -b main 2>/dev/null || { git init -q && git symbolic-ref HEAD refs/heads/main; }
  if git config user.name >/dev/null && git config user.email >/dev/null; then
    # 스크립트 자신은 제외하고 스테이징 — 첫 커밋에 템플릿 도구가 남지 않게
    git add -A -- . ":(exclude)$SELF"
    git commit -q -m "chore: init ${NAME}"
    echo "→ git 히스토리 새로 시작: 커밋 1개 (템플릿 히스토리 0)"
  else
    echo "⚠️  git user.name/user.email 미설정 — 초기 커밋 생략 (빈 저장소, 템플릿 히스토리 0)."
    echo "    설정 후 커밋:  git config user.name <이름> && git config user.email <메일> \\"
    echo "                   && git add -A && git commit -m 'chore: init ${NAME}'"
  fi
fi

echo ""
echo "✅ 초기화 완료: ${NAME} (포트 ${BLOCK}xx · DB ${DB_NAME})"
echo ""
echo "⚠️  남은 수동 단계:"
echo "   1) 워크스페이스 PORTS.md 에 ${BLOCK}xx 블록 등록"
echo "   2) pnpm install"
echo "   3) docker compose up -d && pnpm db:migrate && pnpm db:seed"
echo "   4) pnpm local  → http://localhost:${BLOCK}00"
