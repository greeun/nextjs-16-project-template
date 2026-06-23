"use client";
import * as React from "react";
import { useTheme, type Theme } from "@/components/ThemeProvider";
import { Button } from "@withwiz/ui/react/components/ui/Button";

const ORDER: Theme[] = ["light", "dark", "system"];
const LABEL: Record<Theme, string> = { light: "☀️", dark: "🌙", system: "🖥️" };

/** 테마 순환 토글 (light → dark → system). @withwiz/ui Button 사용. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`테마 전환 (현재: ${theme})`}
      onClick={() => setTheme(next)}
    >
      {LABEL[theme]}
    </Button>
  );
}
