#!/usr/bin/env node
/**
 * prepare-standalone.mjs — `next build`(output:"standalone") 산출물 보정. (워크스페이스 공통)
 *
 * server.js 단독 실행에 필요하지만 빌드가 채워 주지 않는 것들을 복사한다:
 *   1. public / .next/static — CDN 없이 server.js 가 직접 서빙하도록 standalone 안으로.
 *   2. 외부(비번들) 패키지 — pnpm 레이아웃에서 Turbopack 트레이서가 .pnpm 스토어에
 *      내용은 복사하면서 최상위 node_modules 링크를 빠뜨리는 사례가 있다
 *      (showcasehub 의 postgres·bcryptjs 전례). 서버 기동 시 module-not-found 가
 *      나면 해당 패키지를 EXTERNAL_PKGS 에 추가할 것.
 *   3. @img/sharp-libvips* — dylib 이 rpath(dlopen) 로딩이라 트레이서가 누락할 수
 *      있다(wallog 전례). 있으면 통째로 덮어쓰고 없으면 무시.
 *
 * env 파일은 복사하지 않는다(Docker 이미지에 시크릿 유입 위험). standalone server.js 는
 * cwd 가 .next/standalone 이라 루트 .env* 를 읽지 못하므로, 로컬 기동 시엔
 * `node --env-file-if-exists=.env.local --env-file-if-exists=.env .next/standalone/server.js`
 * 처럼 프로세스 env 로 주입할 것(dotenv-cli 도 동일).
 *
 * npm 레이아웃(.pnpm 없음)은 2·3번을 건너뛴다(플랫 구조라 트레이스 누락 사례 없음).
 * 사용: next build 직후  `node scripts/prepare-standalone.mjs`
 */
import { cpSync, existsSync, rmSync, readdirSync } from "node:fs";
import path from "node:path";

const EXTERNAL_PKGS = ["pg", "postgres", "bcryptjs"];

const root = process.cwd();
const out = path.join(root, ".next", "standalone");
const store = path.join(root, "node_modules", ".pnpm");

if (!existsSync(out)) {
  console.error("prepare-standalone: .next/standalone 없음 — next build 먼저 실행");
  process.exit(1);
}

function cp(src, dest) {
  if (!existsSync(src)) return false;
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
  return true;
}

// 1. 정적 자산
cp(path.join(root, "public"), path.join(out, "public"));
cp(path.join(root, ".next", "static"), path.join(out, ".next", "static"));

if (existsSync(store)) {
  // 2. 외부 패키지 최상위 링크 보완 (스코프 패키지는 @scope/name → @scope+name)
  for (const pkg of EXTERNAL_PKGS) {
    const prefix = pkg.replace("/", "+");
    const entry = readdirSync(store).find((d) => d.startsWith(`${prefix}@`));
    if (!entry) continue; // 프로젝트가 안 쓰는 패키지 — 무시
    cp(
      path.join(store, entry, "node_modules", ...pkg.split("/")),
      path.join(out, "node_modules", ...pkg.split("/")),
    );
  }

  // 3. sharp libvips 네이티브 라이브러리
  for (const entry of readdirSync(store).filter((d) => d.startsWith("@img+sharp-libvips"))) {
    cp(path.join(store, entry), path.join(out, "node_modules", ".pnpm", entry));
  }
}

console.log("prepare-standalone: 완료");
