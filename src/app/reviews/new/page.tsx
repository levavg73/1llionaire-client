"use client";

/**
 * [FIX] /reviews/new → 고객이 진행자에게 작성하는 리뷰
 *
 * 기존 코드가 freelancerReviewApi (프리랜서→의뢰인 리뷰) 에 연결되어 있던 버그 수정.
 * /reviews/new   = 고객 → 진행자 리뷰 (bookingApi.createReview)
 * /freelancer/reviews/new = 프리랜서 → 의뢰인 리뷰 (freelancerReviewApi.create)
 */

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api";
import { bookingApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

// 고객 → 진행자 리뷰 평가 항목
const SCORE_FIELDS = [
  { name: "punctuality_score" as const,           label: "시간 준수" },
  { name: "voice_delivery_score" as const,        label: "발성·전달력" },
  { name: "event_understanding_score" as const,   label: "행사 이해도" },
  { name: "atmosphere_score" as const,            label: "분위기 조율" },
  { name: "script_score" as const,                label: "대본 소화력" },
  { name: "response_score" as const,              label: "돌발 대응" },
  { name: "communication_score" as const,         label: "사전 소통" },
];

const schema = z.object({
  punctuality_score:          z.number().int().min(1).max(5),
  voice_delivery_score:       z.number().int().min(1).max(5),
  event_understanding_score:  z.number().int().min(1).max(5),
  atmosphere_score:           z.number().int().min(1).max(5),
  script_score:               z.number().int().min(1).max(5),
  response_score:             z.number().int().min(1).max(5),
  communication_score:        z.number().int().min(1).max(5),
  rehire_intent:              z.boolean(),
  comment: z.string().trim().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1" role="group">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star}점`}
          className="transition-transform hover:scale-110"
        >
          <Star className={`h-6 w-6 ${star <= value ? "fill-gold text-gold" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

function NewCustomerReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const bookingId = searchParams.get("bookingId") ?? "";

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      punctuality_score: 5,
      voice_delivery_score: 5,
      event_understanding_score: 5,
      atmosphere_score: 5,
      script_score: 5,
      response_score: 5,
      communication_score: 5,
      rehire_intent: true,
    },
  });

  // 고객→진행자 리뷰 API
  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      bookingApi.createReview({ ...values, booking_id: bookingId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myReviews });
      queryClient.invalidateQueries({ queryKey: queryKeys.customerBookings });
      router.push("/customer/bookings");
    },
  });

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">진행자 후기 작성</h1>
        <p className="mt-1 text-sm text-muted-foreground">행사 진행에 대한 솔직한 평가를 남겨주세요.</p>
      </div>

      {!bookingId && (
        <p role="alert" className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          예약 정보가 없습니다. 예약 목록에서 다시 시작해 주세요.
        </p>
      )}

      {mutation.isError && (
        <p role="alert" className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {(mutation.error as ApiError<{ error: { message: string } }>)?.response?.data?.error?.message || "후기 등록에 실패했습니다."}
        </p>
      )}

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">항목별 평가</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {SCORE_FIELDS.map(({ name, label }) => (
              <div key={name} className="flex items-center justify-between gap-4">
                <Label className="shrink-0">{label}</Label>
                <StarRating
                  value={watch(name)}
                  onChange={(v) => setValue(name, v, { shouldValidate: true })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="space-y-4 pt-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" {...register("rehire_intent")} className="rounded" />
              <span className="text-sm font-medium">이 진행자를 다시 섭외하고 싶어요</span>
            </label>
            <div className="space-y-1.5">
              <Label htmlFor="comment">상세 후기 (선택)</Label>
              <Textarea
                id="comment"
                rows={4}
                placeholder="진행 스타일, 소통 방식, 현장 대응 등을 자유롭게 남겨주세요"
                {...register("comment")}
              />
              {errors.comment && (
                <p className="text-xs text-destructive">{errors.comment.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-navy text-white hover:bg-navy-light"
          size="lg"
          disabled={mutation.isPending || !bookingId}
        >
          {mutation.isPending ? "등록 중..." : "후기 등록"}
        </Button>
      </form>
    </div>
  );
}

export default function NewCustomerReviewPage() {
  return (
    <Suspense fallback={<div className="max-w-lg">로딩 중...</div>}>
      <NewCustomerReviewContent />
    </Suspense>
  );
}
