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
  email: z.string().trim().toLowerCase().email("유효한 이메일을 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, refreshUser } = useAuth();
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    try {
      const res = await authApi.login(values);
      const user = getAuthUser(res.data) ?? await refreshUser();

      if (!user) {
        throw new Error("로그인 사용자 정보를 확인하지 못했습니다.");
      }

      setAuth(user);

      const redirect =
        user.user_type === "admin" ? "/admin"
        : user.user_type === "customer" ? "/customer/requests"
        : "/freelancer/profile";
      router.push(redirect);
    } catch (err) {
      const apiErr = err as ApiError<{ error: { message: string } }>;
      setServerError(apiErr.response?.data?.error?.message || "로그인에 실패했습니다.");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center space-y-3">
        <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mx-auto">
          <Mic className="h-6 w-6 text-gold" />
        </div>
        <CardTitle className="text-2xl">로그인</CardTitle>
        <CardDescription>프리마이크에 오신 것을 환영합니다</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {serverError && (
            <p role="alert" className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">
              {serverError}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="hello@example.com" autoComplete="email" {...register("email")} aria-describedby={errors.email ? "email-error" : undefined} />
            {errors.email && <p id="email-error" role="alert" className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} aria-describedby={errors.password ? "pw-error" : undefined} />
            {errors.password && <p id="pw-error" role="alert" className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full bg-navy text-white hover:bg-navy-light" disabled={isSubmitting}>
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="text-foreground font-medium hover:underline">회원가입</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
