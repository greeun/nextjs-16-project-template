import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

// no-flash 테마 초기화. 루트 layout 은 언어 변경(=[locale] 세그먼트 변경) 시에도 재렌더되지
// 않고 보존되므로, 여기 둔 <Script> 는 SPA 네비게이션에서 재커밋되지 않는다 → script-tag 경고 없음.
// 기본 light, localStorage 'theme' 우선, system 은 prefers-color-scheme 해석. paint 전 동기 실행.
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme')||'light';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d)r.classList.add('dark');r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // lang 은 [locale]/layout 에서 클라이언트 동기화(LangSync). SSR 기본은 ko.
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        {children}
      </body>
    </html>
  );
}
