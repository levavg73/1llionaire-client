"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(60, "이름은 60자 이하로 입력해 주세요."),
  email: z.string().trim().toLowerCase().email("유효한 이메일을 입력해 주세요."),
  password: z
    .string()
    .min(8, "8자 이상 입력해 주세요.")
    .max(72, "비밀번호는 72자 이하로 입력해 주세요.")
    .regex(/[A-Z]/, "대문자를 포함해야 합니다.")
    .regex(/[0-9]/, "숫자를 포함해야 합니다."),
  user_type: z.enum(["customer", "freelancer"]),
  phone: z.string().trim().max(30, "연락처는 30자 이하로 입력해 주세요.").optional(),
});
type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS = [
  { value: "customer", label: "고객", desc: "진행자를 섭외하고 싶어요" },
  { value: "freelancer", label: "프리랜서", desc: "진행자로 활동하고 싶어요" },
] as const;

export default function SignupPage() {
  const router = useRouter();
  const { setAuth, refreshUser } = useAuth();
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { user_type: "customer" },
  });
  const selectedRole = watch("user_type");

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    try {
      const res = await authApi.signup(values);
      const user = getAuthUser(res.data) ?? await refreshUser();

      if (!user) {
        throw new Error("가입 사용자 정보를 확인하지 못했습니다.");
      }

      setAuth(user);
      router.push(user.user_type === "customer" ? "/customer/requests" : "/freelancer/profile");
    } catch (err) {
      const apiErr = err as ApiError<{ error: { message: string } }>;
      setServerError(apiErr.response?.data?.error?.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-3">
        <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mx-auto">
          <Mic className="h-6 w-6 text-gold" />
        </div>
        <CardTitle className="text-2xl">회원가입</CardTitle>
        <CardDescription>프리마이크에 가입하고 시작하세요</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {serverError && (
            <p role="alert" className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">
              {serverError}
            </p>
          )}

          {/* 역할 선택 */}
          <fieldset>
            <legend className="text-sm font-medium mb-2">역할 선택</legend>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("user_type", opt.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedRole === opt.value
                      ? "border-navy bg-navy/5 ring-1 ring-navy"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor="name">이름</Label>
            <Input id="name" placeholder="홍길동" autoComplete="name" {...register("name")} />
            {errors.name && <p role="alert" className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="hello@example.com" autoComplete="email" {...register("email")} />
            {errors.email && <p role="alert" className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">연락처 (선택)</Label>
            <Input id="phone" type="tel" placeholder="010-0000-0000" autoComplete="tel" {...register("phone")} />
            {errors.phone && <p role="alert" className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <p role="alert" className="text-xs text-destructive">{errors.password.message}</p>}
            <p className="text-xs text-muted-foreground">8자 이상, 대문자·숫자 포함</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full bg-navy text-white hover:bg-navy-light" disabled={isSubmitting}>
            {isSubmitting ? "가입 중..." : "회원가입"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-foreground font-medium hover:underline">로그인</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
