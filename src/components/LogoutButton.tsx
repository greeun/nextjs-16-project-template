"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@withwiz/ui/react/components/ui/Button";

/** toolkit 로그아웃 엔드포인트 호출 후 로그인 페이지로 이동. */
export function LogoutButton({ label, loginHref }: { label: string; loginHref: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  function logout() {
    start(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace(loginHref);
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={logout} disabled={pending}>
      {label}
    </Button>
  );
}
