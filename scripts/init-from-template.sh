#!/usr/bin/env bash
#
# init-from-template.sh — 이 보일러플레이트를 새 프로젝트로 초기화한다.
# 프로젝트명·포트블록을 받아 하드코딩 값(이름·포트 179xx·DB명)을 일괄 치환하고
# .env.local 을 생성(JWT_SECRET 랜덤)한다.
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
  # 179XX(뒤 2자리 유지) → BLOCKXX, DB명(snake), 프로젝트명(kebab) 순서로 치환
  sed -i.bak -E "s/179([0-9]{2})/${BLOCK}\1/g; s/nextjs_16_project_template/${DB_NAME}/g; s/nextjs-16-project-template/${NAME}/g" "$f"
  rm -f "$f.bak"
done

# .env.local 생성(.env.example 복사) + JWT_SECRET 랜덤 주입
if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
fi
SECRET="$(openssl rand -hex 32 2>/dev/null || head -c 48 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 48)"
sed -i.bak -E "s|^JWT_SECRET=.*|JWT_SECRET=\"${SECRET}\"|" .env.local && rm -f .env.local.bak

echo ""
echo "✅ 초기화 완료: ${NAME} (포트 ${BLOCK}xx · DB ${DB_NAME})"
echo ""
echo "⚠️  남은 수동 단계:"
echo "   1) 워크스페이스 PORTS.md 에 ${BLOCK}xx 블록 등록"
echo "   2) pnpm install"
echo "   3) docker compose up -d && pnpm db:migrate && pnpm db:seed"
echo "   4) pnpm local  → http://localhost:${BLOCK}00"
echo ""
echo "   (선택) 이 스크립트 자체 삭제:  rm scripts/init-from-template.sh"
