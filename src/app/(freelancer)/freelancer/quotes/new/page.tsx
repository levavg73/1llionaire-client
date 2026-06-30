"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api";
import { freelancerApi } from "@/lib/api";
import { emptyToUndefined, isFutureDate, optionalTrimmedString } from "@/lib/validation";
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
    price: z.number().int().positive("금액을 입력해 주세요."),
    platform_fee: z.number().int().min(0).default(0),
    total_price: z.number().int().positive("총액을 입력해 주세요."),
    included_services: optionalTrimmedString(500, "포함 서비스 설명은 500자 이하로 입력해 주세요."),
    script_included: z.boolean().default(false),
    rehearsal_included: z.boolean().default(false),
    travel_fee_included: z.boolean().default(false),
    message: optionalTrimmedString(2000, "제안 메시지는 2000자 이하로 입력해 주세요."),
    valid_until: z.preprocess(
      emptyToUndefined,
      z.string().refine(isFutureDate, "견적 유효기간은 오늘 이후 날짜여야 합니다.").optional()
    ),
  })
  .refine((data) => data.total_price >= data.price + data.platform_fee, {
    path: ["total_price"],
    message: "총액은 진행 금액과 플랫폼 수수료의 합계 이상이어야 합니다.",
  });
type FormValues = z.infer<typeof schema>;

function FreelancerQuoteNewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const requestId = searchParams.get("requestId") ?? "";

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { platform_fee: 0, total_price: 0 },
  });

  const toRequiredNumber = (value: string | number) => value === "" ? 0 : Number(value);
  const price = watch("price") || 0;
  const platformFee = watch("platform_fee") || 0;
  const priceField = register("price", {
    setValueAs: toRequiredNumber,
    onChange: (e) => {
      const nextPrice = toRequiredNumber(e.target.value);
      setValue("total_price", nextPrice + platformFee, { shouldValidate: true, shouldDirty: true });
    },
  });
  const platformFeeField = register("platform_fee", {
    setValueAs: toRequiredNumber,
    onChange: (e) => {
      const nextFee = toRequiredNumber(e.target.value);
      setValue("total_price", price + nextFee, { shouldValidate: true, shouldDirty: true });
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      freelancerApi.createQuote({ ...data, request_id: requestId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerRequests });
      router.push("/freelancer/requests");
    },
  });

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/freelancer/requests">
          <Button variant="ghost" size="icon" aria-label="뒤로가기"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">견적 제안</h1>
          <p className="text-muted-foreground text-sm">고객에게 견적을 제안합니다</p>
        </div>
      </div>

      {!requestId && (
        <p role="alert" className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2 mb-4">
          요청서 정보가 없습니다. 전달받은 요청 목록에서 다시 견적 제안을 시작해 주세요.
        </p>
      )}

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2 mb-4">
          {(mutation.error as ApiError<{error:{message:string}}>)?.response?.data?.error?.message || "오류가 발생했습니다."}
        </p>
      )}

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">금액</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="quote_price">진행 금액 (원) <span className="text-destructive">*</span></Label>
                <Input id="quote_price" type="number" min={1} inputMode="numeric" placeholder="500000" {...priceField} />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quote_platform_fee">플랫폼 수수료 (원)</Label>
                <Input id="quote_platform_fee" type="number" min={0} inputMode="numeric" placeholder="0" {...platformFeeField} />
                {errors.platform_fee && <p className="text-xs text-destructive">{errors.platform_fee.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quote_total_price">고객 결제 총액 (원) <span className="text-destructive">*</span></Label>
              <Input id="quote_total_price" type="number" min={1} inputMode="numeric" {...register("total_price", { setValueAs: toRequiredNumber })} />
              {errors.total_price && <p className="text-xs text-destructive">{errors.total_price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quote_valid_until">견적 유효기간</Label>
              <Input id="quote_valid_until" type="date" {...register("valid_until")} />
              {errors.valid_until && <p className="text-xs text-destructive">{errors.valid_until.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">포함 범위</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {[
                { name: "script_included" as const, label: "대본 포함" },
                { name: "rehearsal_included" as const, label: "리허설 포함" },
                { name: "travel_fee_included" as const, label: "출장비 포함" },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...register(name)} /> {label}
                </label>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quote_included_services">포함 서비스 설명</Label>
              <Input id="quote_included_services" placeholder="리허설 1회, 대본 수정 2회 포함" {...register("included_services")} />
              {errors.included_services && <p className="text-xs text-destructive">{errors.included_services.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">제안 메시지</CardTitle></CardHeader>
          <CardContent>
            <Textarea rows={4} placeholder="고객에게 전달할 메시지를 작성해 주세요" {...register("message")} />
            {errors.message && <p className="text-xs text-destructive mt-2">{errors.message.message}</p>}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-navy text-white hover:bg-navy-light" size="lg" disabled={mutation.isPending || !requestId}>
          {mutation.isPending ? "제출 중..." : "견적 제안하기"}
        </Button>
      </form>
    </div>
  );
}


export default function FreelancerQuoteNewPage() {
  return (
    <Suspense fallback={<div className="animate-fade-in max-w-lg">로딩 중...</div>}>
      <FreelancerQuoteNewContent />
    </Suspense>
  );
}
