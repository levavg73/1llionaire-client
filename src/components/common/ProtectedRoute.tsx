"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { UserType } from "@/types";
import { LoadingState } from "@/components/common/States";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserType[];
}

function getCurrentPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isServerWaking } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      const next = getCurrentPath();
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.user_type)) {
      router.replace("/403");
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <LoadingState
        message={
          isServerWaking
            ? "서버 응답을 준비 중입니다. 첫 접속은 잠시 걸릴 수 있어요."
            : "로그인 상태를 확인하는 중..."
        }
      />
    );
  }
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.user_type)) return null;

  return <>{children}</>;
}
