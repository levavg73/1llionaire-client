"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { ApiError } from "@/lib/api";
import { authApi } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("유효한 이메일을 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

type FormValues = z.infer<typeof schema>;

function getSafeNext(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, refreshUser } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError("");

    try {
      const res = await authApi.login(values);
      const user = getAuthUser(res.data) ?? (await refreshUser());

      if (!user) {
        throw new Error("로그인 사용자 정보를 확인하지 못했습니다.");
      }

      setAuth(user);

      const defaultRedirect =
        user.user_type === "admin"
          ? "/admin"
          : user.user_type === "customer"
            ? "/customer/requests"
            : "/freelancer/profile";

      router.push(getSafeNext(searchParams.get("next"), defaultRedirect));
    } catch (err) {
      const apiErr = err as ApiError<{ error: { message: string } }>;

      setServerError(
        apiErr.response?.data?.error?.message || "로그인에 실패했습니다."
      );
    }
  };

  const next = searchParams.get("next");
  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";
  const oauthError = searchParams.get("error");
  const startOAuth = (provider: "kakao" | "google") => {
    window.location.href = authApi.getOAuthStartUrl(provider);
  };

  return (
    <Card className="w-full max-w-[440px] rounded-2xl border-line bg-card shadow-sm">
      <CardHeader className="space-y-2 px-8 pb-4 pt-8 text-center">
        <CardTitle className="text-[32px] font-extrabold tracking-[-0.03em] text-text">
          로그인
        </CardTitle>
        <CardDescription className="text-[16px] text-slate">
          프리마이크에 오신 것을 환영합니다
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 px-8">
          {(serverError || oauthError) && (
            <p
              role="alert"
              className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {serverError || oauthError}
            </p>
          )}

          {searchParams.get("reason") === "password_changed" && (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해 주세요.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[15px] font-bold text-text">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              autoComplete="email"
              className="h-12 rounded-xl text-[16px]"
              {...register("email")}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor="password"
                className="text-[15px] font-bold text-text"
              >
                비밀번호
              </Label>
              <Link
                href="/forgot-password"
                className="text-[13px] font-semibold text-lavender hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="h-12 rounded-xl text-[16px]"
              {...register("password")}
              aria-describedby={errors.password ? "pw-error" : undefined}
            />
            {errors.password && (
              <p id="pw-error" role="alert" className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-2">
          <Button
            type="submit"
            variant="primaryCta"
            className="h-12 w-full text-[17px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>

          <div className="grid w-full grid-cols-2 gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => startOAuth("kakao")}>
              카카오로 이용하기
            </Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => startOAuth("google")}>
              구글로 이용하기
            </Button>
          </div>

          <p className="text-center text-[15px] text-slate">
            계정이 없으신가요?{" "}
            <Link href={signupHref} className="font-bold text-text hover:underline">
              회원가입
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
