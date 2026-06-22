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
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";

const FREELANCER_TYPE_OPTIONS = [
  "아나운서",
  "기업행사 MC",
  "컨퍼런스 MC",
  "웨딩 사회자",
  "쇼호스트",
  "라이브커머스",
  "콘텐츠 진행자",
  "시상식 MC",
] as const;

const STYLE_OPTIONS = [
  "정중한",
  "전문적인",
  "활기찬",
  "친근한",
  "차분한",
  "유머러스한",
  "고급스러운",
  "신뢰감 있는",
] as const;

const nonEmptyStringArray = (message: string) =>
  z
    .array(z.string().trim().min(1, "빈 값은 추가할 수 없습니다.").max(50, "각 항목은 50자 이하로 입력해 주세요."))
    .min(1, message)
    .max(20, "20개 이하로 선택해 주세요.");

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
    preferred_freelancer_type: nonEmptyStringArray("희망 진행자 유형을 1개 이상 선택해 주세요."),
    preferred_styles: nonEmptyStringArray("원하는 진행 분위기를 1개 이상 선택해 주세요."),
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
type MultiValueFieldName = "preferred_freelancer_type" | "preferred_styles";

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ChipGroup({
  label,
  required,
  options,
  selected,
  error,
  description,
  onToggle,
}: {
  label: string;
  required?: boolean;
  options: readonly string[];
  selected: string[];
  error?: string;
  description?: string;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                active
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-card text-text hover:border-lavender hover:text-lavender"
              }`}
            >
              {option}
              {active && <X className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function NewRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const freelancerId = searchParams.get("freelancerId");
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      preferred_freelancer_type: [],
      preferred_styles: [],
      script_required: false,
      rehearsal_required: false,
      travel_required: false,
    },
  });

  const selectedFreelancerTypes = watch("preferred_freelancer_type") ?? [];
  const selectedStyles = watch("preferred_styles") ?? [];

  const toggleValue = (fieldName: MultiValueFieldName, selectedValues: string[], value: string) => {
    const exists = selectedValues.includes(value);
    const next = exists
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    setValue(fieldName, next, { shouldDirty: true, shouldValidate: true });
  };

  const mutation = useMutation({
    mutationFn: (data: FormValues) => customerApi.createRequest({
      ...data,
      ...(freelancerId ? { preferred_freelancer_ids: [freelancerId] } : {}),
    }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerRequests });
      const id = res.data.data?.id;
      router.push(id ? `/customer/requests/${id}` : "/customer/requests");
    },
  });

  return (
    <div className="animate-fade-in max-w-2xl">
      {freelancerId && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✅ 특정 진행자를 지명하여 요청서를 작성합니다. 제출 후 관리자 검수 과정에서 해당 진행자가 우선 후보로 반영됩니다.
        </div>
      )}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/customer/requests">
          <Button variant="ghost" size="icon" aria-label="뒤로가기"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">요청서 작성</h1>
          <p className="text-muted-foreground text-sm">행사 조건을 구조화해 입력하면 맞춤 후보 추천과 관리자 검수가 진행됩니다</p>
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
              <Input placeholder="2026 하반기 임직원 시상식" {...register("event_title")} />
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
          <CardHeader><CardTitle className="text-base">희망 진행자 조건</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <ChipGroup
              label="희망 진행자 유형"
              required
              options={FREELANCER_TYPE_OPTIONS}
              selected={selectedFreelancerTypes}
              error={errors.preferred_freelancer_type?.message}
              description="행사에 적합한 전문 분야를 선택해 주세요."
              onToggle={(value) => toggleValue("preferred_freelancer_type", selectedFreelancerTypes, value)}
            />
            <ChipGroup
              label="원하는 진행 분위기"
              required
              options={STYLE_OPTIONS}
              selected={selectedStyles}
              error={errors.preferred_styles?.message}
              description="고객이 후보를 비교할 때 가장 중요한 진행 톤입니다."
              onToggle={(value) => toggleValue("preferred_styles", selectedStyles, value)}
            />
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
              placeholder="대본 작성 범위, 리허설 방식, 행사 콘셉트, 선호하지 않는 진행 방식 등을 자유롭게 작성해 주세요."
              rows={5}
              {...register("description")}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-navy text-white hover:bg-navy-light" size="lg" disabled={isSubmitting || mutation.isPending}>
          {mutation.isPending ? "요청서 제출 중..." : "요청서 제출하기"}
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
