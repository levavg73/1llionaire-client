"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api";
import { freelancerReviewApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

const SCORE_FIELDS = [
  { name: "professionalism_score" as const, label: "요청 명확성" },
  { name: "communication_score" as const, label: "소통" },
  { name: "payment_promptness_score" as const, label: "결제·정산 신뢰도" },
  { name: "respect_score" as const, label: "예의·존중" },
];

const schema = z.object({
  professionalism_score: z.number().int().min(1).max(5),
  communication_score: z.number().int().min(1).max(5),
  payment_promptness_score: z.number().int().min(1).max(5),
  respect_score: z.number().int().min(1).max(5),
  would_work_again: z.boolean(),
  comment: z.string().trim().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
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

function NewFreelancerReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const bookingId = searchParams.get("bookingId") ?? "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      professionalism_score: 5,
      communication_score: 5,
      payment_promptness_score: 5,
      respect_score: 5,
      would_work_again: true,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      freelancerReviewApi.create({ ...values, booking_id: bookingId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerClientReviews });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerBookings });
      router.push("/freelancer/reviews");
    },
  });

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">의뢰인 후기 작성</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          완료된 예약에 대해 의뢰인과의 협업 경험을 기록하세요.
        </p>
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

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">항목별 평가</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {SCORE_FIELDS.map(({ name, label }) => (
              <div key={name} className="flex items-center justify-between gap-4">
                <span className="shrink-0 text-sm font-medium leading-none">{label}</span>
                <StarRating
                  value={watch(name)}
                  onChange={(value) => setValue(name, value, { shouldValidate: true })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="space-y-4 pt-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" {...register("would_work_again")} className="rounded" />
              <span className="text-sm font-medium">이 의뢰인과 다시 함께하고 싶어요</span>
            </label>
            <div className="space-y-1.5">
              <Label htmlFor="comment">상세 후기 (선택)</Label>
              <Textarea
                id="comment"
                rows={4}
                placeholder="요청사항 명확성, 소통, 정산 과정, 현장 매너 등을 자유롭게 남겨주세요"
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

export default function NewFreelancerReviewPage() {
  return (
    <Suspense fallback={<div className="max-w-lg">로딩 중...</div>}>
      <NewFreelancerReviewContent />
    </Suspense>
  );
}
