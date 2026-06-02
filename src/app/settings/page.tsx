"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { AdminNav, CustomerNav, FreelancerNav } from "@/components/layout/SideNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, ShieldCheck, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/http";

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "현재 비밀번호를 입력해 주세요."),
    new_password: z
      .string()
      .min(8, "8자 이상 입력해 주세요.")
      .regex(/[A-Z]/, "대문자를 포함해야 합니다.")
      .regex(/[0-9]/, "숫자를 포함해야 합니다."),
    confirm_password: z.string().min(1, "비밀번호 확인을 입력해 주세요."),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ["confirm_password"],
    message: "새 비밀번호가 일치하지 않습니다.",
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;


// ── 소셜 로그인 사용자 비밀번호 설정 컴포넌트 ────────────────

const setPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "8자 이상 입력해 주세요.")
      .regex(/[A-Z]/, "대문자를 포함해야 합니다.")
      .regex(/[0-9]/, "숫자를 포함해야 합니다."),
    confirm_password: z.string().min(1, "비밀번호 확인을 입력해 주세요."),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ["confirm_password"],
    message: "비밀번호가 일치하지 않습니다.",
  });

type SetPasswordValues = z.infer<typeof setPasswordSchema>;

function SocialPasswordSection({ provider }: { provider: string }) {
  const [done, setDone] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: SetPasswordValues) =>
      authApi.setPassword(data.new_password),
    onSuccess: () => { setDone(true); reset(); },
  });

  const providerLabel = provider === "kakao" ? "카카오" : "Google";

  if (done) {
    return (
      <Card className="mb-6 border-emerald-200">
        <CardContent className="pt-5 pb-5">
          <p className="text-sm text-emerald-700 font-medium">✅ 비밀번호가 설정되었습니다. 이제 이메일로도 로그인할 수 있습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">비밀번호 설정</CardTitle>
        </div>
        <CardDescription>
          {providerLabel} 계정으로 로그인 중입니다. 비밀번호를 설정하면 이메일로도 로그인할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mutation.isError && (
          <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">
            비밀번호 설정에 실패했습니다.
          </p>
        )}
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="space-y-4">
          <PasswordField
            id="set_new_password"
            label="새 비밀번호"
            placeholder="8자 이상, 대문자·숫자 포함"
            registration={register("new_password")}
            error={errors.new_password?.message}
          />
          <PasswordField
            id="set_confirm_password"
            label="비밀번호 확인"
            placeholder="새 비밀번호를 다시 입력"
            registration={register("confirm_password")}
            error={errors.confirm_password?.message}
          />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "설정 중..." : "비밀번호 설정"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  registration,
  error,
}: {
  id: string;
  label: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="new-password"
          className="pr-10"
          {...registration}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function RoleNav() {
  const { user } = useAuth();

  if (user?.user_type === "admin") return <AdminNav />;
  if (user?.user_type === "freelancer") return <FreelancerNav />;
  return <CustomerNav />;
}

export default function SettingsPage() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordFormValues) =>
      authApi.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      }),
    onSuccess: () => {
      reset();
      clearAuth();
      router.push("/login?reason=password_changed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => authApi.deleteAccount({ password: deletePassword }),
    onSuccess: () => {
      clearAuth();
      router.push("/?reason=account_deleted");
    },
    onError: (err: ApiError) => {
      setDeleteError(
        err.response?.data
          ? (err.response.data as { error: { message: string } }).error.message
          : "오류가 발생했습니다."
      );
    },
  });

  const handleDeleteOpen = () => {
    setDeletePassword("");
    setDeleteError("");
    setDeleteConfirmOpen(true);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="lg:w-56 lg:shrink-0">
            <RoleNav />
          </aside>

          <div className="w-full max-w-lg">
            <div className="mb-8">
              <h1 className="text-2xl font-bold">계정 설정</h1>
              <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
            </div>

            {user?.provider ? (
              <SocialPasswordSection provider={user.provider} />
            ) : (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">비밀번호 변경</CardTitle>
                </div>
                <CardDescription>
                  변경 후 모든 기기에서 자동으로 로그아웃됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {passwordMutation.isError && (
                  <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">
                    {(passwordMutation.error as ApiError)?.response?.data
                      ? ((passwordMutation.error as ApiError).response!.data as { error: { message: string } }).error.message
                      : "오류가 발생했습니다."}
                  </p>
                )}
                <form onSubmit={handleSubmit((v) => passwordMutation.mutate(v))} noValidate className="space-y-4">
                  <PasswordField
                    id="current_password"
                    label="현재 비밀번호"
                    placeholder="••••••••"
                    registration={register("current_password")}
                    error={errors.current_password?.message}
                  />
                  <PasswordField
                    id="new_password"
                    label="새 비밀번호"
                    placeholder="8자 이상, 대문자·숫자 포함"
                    registration={register("new_password")}
                    error={errors.new_password?.message}
                  />
                  <PasswordField
                    id="confirm_password"
                    label="새 비밀번호 확인"
                    placeholder="새 비밀번호를 다시 입력"
                    registration={register("confirm_password")}
                    error={errors.confirm_password?.message}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || passwordMutation.isPending}
                  >
                    {passwordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            )}


            {user?.user_type !== "admin" && (
              <>
                <Separator className="my-6" />

                <Card className="border-destructive/30">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-destructive" />
                      <CardTitle className="text-base text-destructive">회원 탈퇴</CardTitle>
                    </div>
                    <CardDescription>
                      탈퇴 후에는 계정 복구가 불가능합니다. 진행 중인 예약이 있으면 탈퇴할 수 없습니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive"
                      onClick={handleDeleteOpen}
                    >
                      탈퇴하기
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            <ConfirmModal
              open={deleteConfirmOpen}
              onOpenChange={(o) => {
                if (!o) { setDeleteConfirmOpen(false); setDeleteError(""); }
              }}
              title="정말 탈퇴하시겠습니까?"
              description={
                <div className="space-y-3 pt-1">
                  <p className="text-sm text-muted-foreground">
                    계정과 모든 데이터가 비활성화됩니다. 탈퇴를 계속하려면 비밀번호를 입력해 주세요.
                  </p>
                  <Input
                    type="password"
                    placeholder="비밀번호 입력"
                    value={deletePassword}
                    onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(""); }}
                    autoFocus
                  />
                  {deleteError && (
                    <p className="text-xs text-destructive">{deleteError}</p>
                  )}
                </div> as unknown as string
              }
              confirmLabel="탈퇴 확인"
              cancelLabel="취소"
              variant="destructive"
              onConfirm={() => {
                if (!deletePassword) {
                  setDeleteError("비밀번호를 입력해 주세요.");
                  return;
                }
                deleteMutation.mutate();
              }}
              isLoading={deleteMutation.isPending}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
