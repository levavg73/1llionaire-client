"use client";

import { useMutation } from "@tanstack/react-query";
import { aiApi } from "@/lib/api";
import type { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventRequest, PricingAnalysis, PricingMarketData } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Sparkles } from "lucide-react";

function getDurationHours(start?: string, end?: string) {
  if (!start || !end) return undefined;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((v) => Number.isNaN(v))) return undefined;
  const startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (endMin <= startMin) endMin += 24 * 60;
  return Number(((endMin - startMin) / 60).toFixed(1));
}

type PricingAnalysisPayload = {
  analysis: PricingAnalysis;
  market_data?: PricingMarketData | null;
};

function ConfidenceLabel({ value }: { value: PricingAnalysis["confidence"] }) {
  const map = {
    high: "높음",
    medium: "보통",
    low: "낮음",
  } as const;
  return <span>{map[value]}</span>;
}

export function PricingAnalysisCard({ request }: { request: EventRequest }) {
  const mutation = useMutation({
    mutationFn: () =>
      aiApi.analyzePricing({
        event_type: request.event_type,
        region: request.region,
        categories: request.preferred_freelancer_type?.length
          ? request.preferred_freelancer_type
          : [request.event_type],
        budget_min: request.budget_min,
        budget_max: request.budget_max,
        duration_hours: getDurationHours(request.start_time, request.end_time),
        request_id: request.id,
      }),
  });

  const result = mutation.data?.data?.data as PricingAnalysisPayload | undefined;
  const analysis = result?.analysis;
  const errorMessage =
    (mutation.error as ApiError<{ error: { message: string } }> | null)?.response?.data?.error?.message ||
    "AI 단가 분석을 불러오지 못했습니다.";

  return (
    <Card className="border-lavender/30 bg-lavender-light/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-lavender" />
          AI 단가 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {!analysis && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              행사 조건과 플랫폼 데이터를 바탕으로 적정 섭외 단가를 분석합니다.
            </p>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "분석 중..." : "AI 단가 분석하기"}
            </Button>
          </div>
        )}

        {mutation.isError && (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive">
            {errorMessage}
          </p>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-card p-4">
              <p className="text-xs text-muted-foreground">추천 중심 단가</p>
              <p className="mt-1 text-2xl font-extrabold text-navy">
                {formatPrice(analysis.recommended_center)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                권장 범위 {formatPrice(analysis.recommended_min)} ~ {formatPrice(analysis.recommended_max)} · 신뢰도 <ConfidenceLabel value={analysis.confidence} />
              </p>
            </div>

            <div>
              <p className="font-semibold">분석 근거</p>
              <p className="mt-1 text-muted-foreground">{analysis.rationale}</p>
            </div>

            <div>
              <p className="font-semibold">시장 맥락</p>
              <p className="mt-1 text-muted-foreground">{analysis.market_context}</p>
              {result?.market_data && (
                <p className="mt-1 text-xs text-muted-foreground">
                  유사 프리랜서 {result.market_data.sample_count}명 기준 · 평균 {formatPrice(result.market_data.avg_price_min)} ~ {formatPrice(result.market_data.avg_price_max)}
                </p>
              )}
            </div>

            {analysis.factors.length > 0 && (
              <div>
                <p className="font-semibold">가격 영향 요인</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  {analysis.factors.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}

            {analysis.risk_notes.length > 0 && (
              <div>
                <p className="font-semibold">주의사항</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  {analysis.risk_notes.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              다시 분석하기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
