"use client";

/**
 * OAuth 신규 사용자 정보 설정 페이지
 *
 * 플로우:
 *   카카오/구글 인증 완료
 *   → 기존 계정이면 즉시 로그인
 *   → 신규 계정이면 이 페이지에서 이름/역할 입력
 *   → 서버가 pending OAuth 쿠키를 검증한 뒤 계정 생성 및 로그인 처리
 */

import type { FormEvent, ReactNode } from "react";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ApiError } from "@/lib/api";
import { authApi } from "@/lib/api";
import { getDefaultPostAuthPath } from "@/lib/auth-redirects";
import { getAuthUser } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

type OAuthProvider = "kakao" | "google";
type UserType = "customer" | "freelancer";

interface RoleOption {
  value: UserType;
  label: string;
  desc: string;
  icon: ReactNode;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "customer",
    label: "고객으로 이용하기",
    desc: "행사에 필요한 진행자를 섭외합니다",
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    value: "freelancer",
    label: "프리랜서 진행자로 이용하기",
    desc: "MC·아나운서·쇼호스트로 활동합니다",
    icon: <Mic className="h-6 w-6" />,
  },
];

function isOAuthProvider(value: string | null): value is OAuthProvider {
  return value === "kakao" || value === "google";
}

function getApiErrorMessage(error: unknown) {
  const apiError = error as ApiError<{ error: { message: string } }>;

  return apiError.response?.data?.error?.message || "소셜 계정 설정에 실패했습니다.";
}

function getValidationError(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) return "이름을 입력해 주세요.";
  if (trimmedName.length > 50) return "이름은 50자 이하로 입력해 주세요.";

  return "";
}

function OAuthRoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<UserType>("customer");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const provider = useMemo<OAuthProvider>(() => {
    const value = searchParams.get("provider");
    return isOAuthProvider(value) ? value : "kakao";
  }, [searchParams]);

  const providerLabel = provider === "kakao" ? "카카오" : "구글";

  const handleContinue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = getValidationError(name);
    if (validationError) {
      setServerError(validationError);
      return;
    }

    setServerError("");
    setIsSubmitting(true);

    try {
      const res = await authApi.completeOAuthSignup({
        name: name.trim(),
        user_type: selected,
      });
      const user = getAuthUser(res.data) ?? (await refreshUser());

      if (!user) {
        throw new Error("로그인 사용자 정보를 확인하지 못했습니다.");
      }

      setAuth(user);
      router.replace(getDefaultPostAuthPath(user.user_type));
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-[460px] rounded-2xl border-line bg-card shadow-sm">
      <CardHeader className="space-y-2 px-8 pb-4 pt-8 text-center">
        <CardTitle className="text-[28px] font-extrabold tracking-[-0.03em] text-text">
          이름과 이용 방식을 설정해 주세요
        </CardTitle>
        <CardDescription className="text-[15px] text-slate">
          {providerLabel} 인증이 완료되었습니다. 서비스에서 사용할 이름과 이용 방식을 선택해 주세요.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        {serverError && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {serverError}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleContinue} noValidate>
          <div className="space-y-2">
            <Label htmlFor="oauth-name" className="text-[15px] font-bold text-text">
              이름
            </Label>
            <Input
              id="oauth-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="실명을 입력해 주세요"
              autoComplete="name"
              autoFocus
              className="h-12 rounded-xl text-[16px]"
              disabled={isSubmitting}
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-[15px] font-bold text-text">이용 방식</legend>
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(opt.value)}
                disabled={isSubmitting}
                className={cn(
                  "w-full rounded-xl border-2 p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60",
                  selected === opt.value
                    ? "border-navy bg-navy/5 ring-1 ring-navy"
                    : "border-line hover:border-navy/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      selected === opt.value ? "bg-navy text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {opt.icon}
                  </span>
                  <span>
                    <span className="block text-[15px] font-bold text-text">{opt.label}</span>
                    <span className="block text-[13px] text-slate">{opt.desc}</span>
                  </span>
                </div>
              </button>
            ))}
          </fieldset>

          <Button
            type="submit"
            variant="primaryCta"
            className="h-12 w-full text-[17px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "시작하는 중..." : "시작하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function OAuthRolePage() {
  return (
    <Suspense fallback={null}>
      <OAuthRoleContent />
    </Suspense>
  );
}
