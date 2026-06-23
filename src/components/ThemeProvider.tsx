"use client";
import * as React from "react";

// 경량 테마 컨텍스트 (next-themes 대체).
// next-themes 는 "use client" 안에서 inline <script> 를 렌더 → React 19 가 "script tag" 경고.
// 여기선 no-flash 스크립트를 layout(서버 컴포넌트)에서 렌더하고, 이 컴포넌트는 상태만 관리한다.
export type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: Resolved;
  setTheme: (t: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
export const THEME_STORAGE_KEY = "theme";

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** html.dark 클래스 + color-scheme 적용, 해석된 테마 반환. */
function applyTheme(theme: Theme): Resolved {
  const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  return dark ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  // SSR/첫 렌더는 defaultTheme 으로 일치(하이드레이션 불일치 없음). 마운트 후 localStorage 동기화.
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<Resolved>(
    defaultTheme === "dark" ? "dark" : "light",
  );

  React.useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? defaultTheme;
    // 마운트 후 localStorage→상태 동기화(클라이언트 전용). 하이드레이션 동기화 목적의 의도된 setState.
    /* eslint-disable react-hooks/set-state-in-effect */
    setThemeState(stored);
    setResolvedTheme(applyTheme(stored));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [defaultTheme]);

  // system 테마일 때 OS 변경 추적
  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(applyTheme("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = React.useCallback((t: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, t);
    setThemeState(t);
    setResolvedTheme(applyTheme(t));
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
