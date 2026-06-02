"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(50, "50자 이하로 입력해 주세요."),
});

type FormValues = z.infer<typeof schema>;

export default function OAuthNameSetupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => authApi.updateMe({ name: data.name }),
    onSuccess: async () => {
      const user = await refreshUser();
      if (!user) return;
      const path =
        user.user_type === "customer" ? "/customer/requests" : "/freelancer/profile";
      router.replace(path);
    },
  });

  return (
    <Card className="w-full max-w-[440px] rounded-2xl border-line bg-card shadow-sm">
      <CardHeader className="space-y-2 px-8 pb-4 pt-8 text-center">
        <CardTitle className="text-[26px] font-extrabold tracking-[-0.03em] text-text">
          이름을 설정해 주세요
        </CardTitle>
        <CardDescription className="text-[15px] text-slate">
          서비스 내에서 사용될 이름을 입력해 주세요.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        {mutation.isError && (
          <p role="alert" className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            이름 설정에 실패했습니다. 다시 시도해 주세요.
          </p>
        )}

        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="홍길동"
              autoFocus
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primaryCta"
            className="h-12 w-full text-[17px]"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "저장 중..." : "시작하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
