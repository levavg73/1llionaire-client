"use client";

/**
 * OAuth 소셜 로그인 신규 사용자 역할 선택 페이지
 *
 * 플로우:
 *   login 페이지 → startOAuth(provider, userType) 호출 시 역할 먼저 선택
 *   → 선택 완료 → OAuth 서버 리다이렉트
 *
 * 역할이 이미 있는 기존 사용자는 이 페이지를 거치지 않음.
 */

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

type OAuthProvider = "kakao" | "google";
type UserType = "customer" | "freelancer";

const ROLE_OPTIONS: { value: UserType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "customer",
    label: "고객 (섭외 의뢰인)",
    desc: "행사에 필요한 진행자를 섭외합니다",
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    value: "freelancer",
    label: "프리랜서 진행자",
    desc: "MC·아나운서·쇼호스트로 활동합니다",
    icon: <Mic className="h-6 w-6" />,
  },
];

function OAuthRoleContent() {
  const searchParams = useSearchParams();
  const provider = (searchParams.get("provider") ?? "kakao") as OAuthProvider;

  const [selected, setSelected] = useState<UserType>("customer");

  const handleContinue = () => {
    window.location.href = authApi.getOAuthStartUrl(provider, selected);
  };

  const providerLabel = provider === "kakao" ? "카카오" : "Google";

  return (
    <Card className="w-full max-w-[440px] rounded-2xl border-line bg-card shadow-sm">
      <CardHeader className="space-y-2 px-8 pb-4 pt-8 text-center">
        <CardTitle className="text-[28px] font-extrabold tracking-[-0.03em] text-text">
          역할을 선택해 주세요
        </CardTitle>
        <CardDescription className="text-[15px] text-slate">
          {providerLabel}로 처음 가입하시나요? 역할을 선택하면 바로 시작할 수 있어요.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8 space-y-4">
        {ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelected(opt.value)}
            className={cn(
              "w-full rounded-xl border-2 p-4 text-left transition-all",
              selected === opt.value
                ? "border-navy bg-navy/5 ring-1 ring-navy"
                : "border-line hover:border-navy/40"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                selected === opt.value ? "bg-navy text-white" : "bg-muted text-muted-foreground"
              )}>
                {opt.icon}
              </span>
              <div>
                <p className="font-bold text-[15px] text-text">{opt.label}</p>
                <p className="text-[13px] text-slate">{opt.desc}</p>
              </div>
            </div>
          </button>
        ))}

        <Button
          type="button"
          variant="primaryCta"
          className="h-12 w-full text-[17px] mt-2"
          onClick={handleContinue}
        >
          {providerLabel}로 계속하기
        </Button>
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
