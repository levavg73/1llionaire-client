"use client";

import { Suspense, useState, useEffect } from "react";
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
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해 주세요.")
    .max(60, "이름은 60자 이하로 입력해 주세요."),
  email: z.string().trim().toLowerCase().email("유효한 이메일을 입력해 주세요."),
  password: z
    .string()
    .min(8, "8자 이상 입력해 주세요.")
    .max(72, "비밀번호는 72자 이하로 입력해 주세요.")
    .regex(/[A-Z]/, "대문자를 포함해야 합니다.")
    .regex(/[0-9]/, "숫자를 포함해야 합니다."),
  user_type: z.enum(["customer", "freelancer"]),
  phone: z
    .string()
    .trim()
    .max(30, "연락처는 30자 이하로 입력해 주세요.")
    .optional(),
});

type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS = [
  { value: "customer", label: "고객", desc: "진행자를 섭외하고 싶어요" },
  { value: "freelancer", label: "프리랜서", desc: "진행자로 활동하고 싶어요" },
] as const;

function getSafeNext(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, refreshUser } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { user_type: "customer" },
  });

  // /signup?role=freelancer 등 URL 파라미터로 역할 프리셋
  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "freelancer" || role === "customer") {
      setValue("user_type", role, { shouldValidate: false });
    }
  }, [searchParams, setValue]);

  const selectedRole = watch("user_type");

  const onSubmit = async (values: FormValues) => {
    setServerError("");

    try {
      const res = await authApi.signup(values);
      const user = getAuthUser(res.data) ?? (await refreshUser());

      if (!user) {
        throw new Error("가입 사용자 정보를 확인하지 못했습니다.");
      }

      setAuth(user);

      const defaultRedirect =
        user.user_type === "customer" ? "/customer/requests" : "/freelancer/profile";

      router.push(getSafeNext(searchParams.get("next"), defaultRedirect));
    } catch (err) {
      const apiErr = err as ApiError<{ error: { message: string } }>;

      if ((apiErr.response?.status ?? 0) === 409) {
        setServerError("이미 가입된 이메일입니다. 로그인 페이지에서 로그인해 주세요.");
      } else {
        setServerError(apiErr.response?.data?.error?.message || "회원가입에 실패했습니다.");
      }
    }
  };

  const next = searchParams.get("next");
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const startOAuth = (provider: "kakao" | "google") => {
    window.location.href = authApi.getOAuthStartUrl(provider);
  };

  return (
    <Card className="w-full max-w-[520px] rounded-2xl border-line bg-card shadow-sm">
      <CardHeader className="space-y-2 px-8 pb-4 pt-8 text-center">
        <CardTitle className="text-[32px] font-extrabold tracking-[-0.03em] text-text">
          회원가입
        </CardTitle>
        <CardDescription className="text-[16px] text-slate">
          프리마이크에 가입하고 시작하세요
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 px-8">
          {serverError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {serverError}
            </p>
          )}

          <fieldset>
            <legend className="mb-2 text-[15px] font-bold text-text">
              역할 선택
            </legend>

            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue("user_type", opt.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className={`rounded-xl border p-3 text-left transition-all ${
                    selectedRole === opt.value
                      ? "border-navy bg-lavender-light ring-1 ring-navy/20"
                      : "border-line bg-card hover:border-lavender"
                  }`}
                >
                  <p className="text-[15px] font-bold text-text">{opt.label}</p>
                  <p className="mt-1 text-[13px] text-slate">{opt.desc}</p>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-[15px] font-bold text-text">
              이름
            </Label>
            <Input
              id="name"
              placeholder="홍길동"
              autoComplete="name"
              className="h-12 rounded-xl text-[16px]"
              {...register("name")}
            />
            {errors.name && (
              <p role="alert" className="text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

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
            />
            {errors.email && (
              <p role="alert" className="text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[15px] font-bold text-text">
              연락처 <span className="font-medium text-slate">(선택)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="010-0000-0000"
              autoComplete="tel"
              className="h-12 rounded-xl text-[16px]"
              {...register("phone")}
            />
            {errors.phone && (
              <p role="alert" className="text-xs text-destructive">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[15px] font-bold text-text"
            >
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              className="h-12 rounded-xl text-[16px]"
              {...register("password")}
            />
            {errors.password && (
              <p role="alert" className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
            <p className="text-[13px] text-slate">
              8자 이상, 대문자·숫자 포함
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-2">
          <Button
            type="submit"
            variant="primaryCta"
            className="h-12 w-full text-[17px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "가입 중..." : "회원가입"}
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
            이미 계정이 있으신가요?{" "}
            <Link href={loginHref} className="font-bold text-text hover:underline">
              로그인
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
