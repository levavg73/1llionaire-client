"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { UserType } from "@/types";
import { LoadingState } from "@/components/common/States";
import { getDefaultPostAuthPath } from "@/lib/auth-redirects";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserType[];
  /**
   * Render the protected page shell while the cookie session check is in flight.
   * Data APIs still enforce authorization server-side, but this prevents
   * authenticated dashboards from delaying their LCP behind /api/auth/me.
   */
  renderWhileLoading?: boolean;
}

function getCurrentPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

export function ProtectedRoute({ children, allowedRoles, renderWhileLoading = false }: ProtectedRouteProps) {
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
      router.replace(getDefaultPostAuthPath(user.user_type));
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading && !renderWhileLoading) {
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

  if (isLoading && renderWhileLoading) {
    return <>{children}</>;
  }
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.user_type)) return null;

  return <>{children}</>;
}
