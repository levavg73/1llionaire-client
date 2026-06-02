"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api";
import { customerApi } from "@/lib/api";
import { isEndTimeAfterStartTime, isTodayOrFutureDate, optionalTrimmedString } from "@/lib/validation";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const schema = z
  .object({
    event_title: z.string().trim().min(1, "행사명을 입력해 주세요.").max(120, "행사명은 120자 이하로 입력해 주세요."),
    event_type: z.string().trim().min(1, "행사 종류를 입력해 주세요.").max(60, "행사 종류는 60자 이하로 입력해 주세요."),
    event_date: z
      .string()
      .min(1, "행사 날짜를 선택해 주세요.")
      .refine(isTodayOrFutureDate, "오늘 이후 날짜를 선택해 주세요."),
    start_time: z.string().min(1, "시작 시간을 입력해 주세요."),
    end_time: z.string().min(1, "종료 시간을 입력해 주세요."),
    region: z.string().trim().min(1, "지역을 입력해 주세요.").max(50, "지역은 50자 이하로 입력해 주세요."),
    venue: optionalTrimmedString(120, "장소는 120자 이하로 입력해 주세요."),
    budget_min: z.number({ invalid_type_error: "숫자를 입력해 주세요." }).int().positive().optional(),
    budget_max: z.number({ invalid_type_error: "숫자를 입력해 주세요." }).int().positive().optional(),
    required_language: optionalTrimmedString(40, "언어는 40자 이하로 입력해 주세요."),
    description: optionalTrimmedString(2000, "요청사항은 2000자 이하로 입력해 주세요."),
    script_required: z.boolean().default(false),
    rehearsal_required: z.boolean().default(false),
    travel_required: z.boolean().default(false),
  })
  .refine((data) => isEndTimeAfterStartTime(data.start_time, data.end_time), {
    path: ["end_time"],
    message: "종료 시간은 시작 시간보다 늦어야 합니다.",
  })
  .refine((data) => !data.budget_min || !data.budget_max || data.budget_min <= data.budget_max, {
    path: ["budget_max"],
    message: "최대 예산은 최소 예산보다 크거나 같아야 합니다.",
  });
type FormValues = z.infer<typeof schema>;

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function NewRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const freelancerId = searchParams.get("freelancerId");
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => customerApi.createRequest({
      ...data,
      // 특정 진행자 지명 섭외 시 preferred_freelancer_ids에 포함
      ...(freelancerId ? { preferred_freelancer_ids: [freelancerId] } : {}),
    }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerRequests });
      const id = res.data.data?.id;
      router.push(id ? `/customer/requests/${id}/recommendations` : "/customer/requests");
    },
  });

  return (
    <div className="animate-fade-in max-w-2xl">
      {freelancerId && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✅ 특정 진행자를 지명하여 요청서를 작성합니다. 제출 후 해당 진행자가 우선 검토됩니다.
        </div>
      )}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/customer/requests">
          <Button variant="ghost" size="icon" aria-label="뒤로가기"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">요청서 작성</h1>
          <p className="text-muted-foreground text-sm">행사 정보를 입력하면 AI 데이터 매칭으로 맞춤 진행자를 바로 추천해 드립니다</p>
        </div>
      </div>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2 mb-4">
          {(mutation.error as ApiError<{error:{message:string}}>)?.response?.data?.error?.message || "오류가 발생했습니다."}
        </p>
      )}

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">행사 기본 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="행사명" error={errors.event_title?.message} required>
              <Input placeholder="2024 하반기 임직원 시상식" {...register("event_title")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="행사 종류" error={errors.event_type?.message} required>
                <Input placeholder="기업행사" {...register("event_type")} />
              </Field>
              <Field label="지역" error={errors.region?.message} required>
                <Input placeholder="서울" {...register("region")} />
              </Field>
            </div>
            <Field label="장소" error={errors.venue?.message}>
              <Input placeholder="그랜드힐튼 컨벤션홀" {...register("venue")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="행사 날짜" error={errors.event_date?.message} required>
                <Input type="date" {...register("event_date")} />
              </Field>
              <Field label="시작 시간" error={errors.start_time?.message} required>
                <Input type="time" {...register("start_time")} />
              </Field>
              <Field label="종료 시간" error={errors.end_time?.message} required>
                <Input type="time" {...register("end_time")} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">예산 & 조건</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="최소 예산 (원)" error={errors.budget_min?.message}>
                <Input type="number" min={1} inputMode="numeric" placeholder="300000" {...register("budget_min", { setValueAs: (v) => v === "" ? undefined : Number(v) })} />
              </Field>
              <Field label="최대 예산 (원)" error={errors.budget_max?.message}>
                <Input type="number" min={1} inputMode="numeric" placeholder="1000000" {...register("budget_max", { setValueAs: (v) => v === "" ? undefined : Number(v) })} />
              </Field>
            </div>
            <Field label="필요 언어" error={errors.required_language?.message}>
              <Input placeholder="한국어" {...register("required_language")} />
            </Field>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {[
                { name: "script_required" as const, label: "대본 필요" },
                { name: "rehearsal_required" as const, label: "리허설 필요" },
                { name: "travel_required" as const, label: "출장 필요" },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register(name)} className="rounded" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">요청사항</CardTitle></CardHeader>
          <CardContent>
            {errors.description && <p role="alert" className="text-xs text-destructive mb-2">{errors.description.message}</p>}
            <Textarea
              placeholder="진행자에게 원하는 스타일이나 특별한 요구사항을 자유롭게 작성해 주세요."
              rows={5}
              {...register("description")}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-navy text-white hover:bg-navy-light" size="lg" disabled={isSubmitting || mutation.isPending}>
          {mutation.isPending ? "AI 매칭 중..." : "요청서 제출하고 AI 추천받기"}
        </Button>
      </form>
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={null}>
      <NewRequestContent />
    </Suspense>
  );
}
