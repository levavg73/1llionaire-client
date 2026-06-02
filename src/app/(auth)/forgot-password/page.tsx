"use client";

/**
 * 비밀번호 재설정
 *
 * MVP 단계에서는 이메일 발송 인프라가 없어 실제 재설정이 불가능합니다.
 * 계정 설정(/settings)에서 현재 비밀번호를 알고 있으면 직접 변경할 수 있습니다.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-[440px] rounded-2xl border-line bg-card shadow-sm">
      <CardHeader className="space-y-2 px-8 pb-4 pt-8 text-center">
        <div className="flex justify-center mb-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Mail className="h-6 w-6 text-muted-foreground" />
          </span>
        </div>
        <CardTitle className="text-[26px] font-extrabold tracking-[-0.03em] text-text">
          비밀번호 재설정
        </CardTitle>
        <CardDescription className="text-[15px] text-slate">
          현재 MVP 단계에서는 이메일 재설정이 지원되지 않습니다
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 space-y-2">
          <p className="font-semibold">대신 이렇게 해보세요</p>
          <ul className="space-y-1 text-[13px]">
            <li>• 로그인 후 <strong>계정 설정 → 비밀번호 변경</strong>에서 직접 변경할 수 있습니다.</li>
            <li>• 카카오/구글 소셜 로그인을 사용하면 비밀번호가 필요 없습니다.</li>
            <li>• 계정 복구가 필요하면 <strong>admin@freemic.co.kr</strong>로 문의해 주세요.</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 px-8 pb-8 pt-2">
        <Link href="/login" className="w-full">
          <Button variant="primaryCta" className="h-12 w-full text-[17px]">
            로그인으로 돌아가기
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
