"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aiApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventRequest, PricingAnalysis, PricingAnalysisLineItem, PricingMarketData } from "@/types";
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
  diagnostic?: {
    analysis_source?: PricingMarketData["analysis_source"];
    gemini_status?: number;
    gemini_provider_status?: string;
    gemini_error_message?: string;
  } | null;
};

function ConfidenceLabel({ value }: { value: PricingAnalysis["confidence"] }) {
  const map = {
    high: "높음",
    medium: "보통",
    low: "낮음",
  } as const;
  return <span>{map[value] ?? "보통"}</span>;
}

function BudgetRealismLabel({ value }: { value: NonNullable<PricingAnalysis["budget_realism"]>["status"] }) {
  const map = {
    below_market: "예산 낮음",
    within_market: "현실적",
    above_market: "예산 여유",
    unknown: "판단 보류",
  } as const;

  return <span>{map[value] ?? "판단 보류"}</span>;
}

function getAnalysisSourceLabel(source?: PricingMarketData["analysis_source"]) {
  if (source === "gemini") return "Gemini 분석";
  if (source === "market_fallback") return "시장 데이터 산식";
  return "분석 대기";
}

function normalizeLineItem(item: unknown): PricingAnalysisLineItem | null {
  if (!item || typeof item !== "object") return null;

  const source = item as Record<string, unknown>;
  const estimatedPrice = source.estimated_price;

  return {
    name: typeof source.name === "string" ? source.name : "단가 항목",
    description: typeof source.description === "string" ? source.description : "",
    estimated_price: typeof estimatedPrice === "number" && Number.isFinite(estimatedPrice) ? estimatedPrice : 0,
    reason: typeof source.reason === "string" ? source.reason : "",
  };
}

function normalizePricingPayload(payload?: PricingAnalysisPayload): PricingAnalysisPayload | undefined {
  if (!payload?.analysis) return undefined;

  const analysis = payload.analysis;
  const lineItems = Array.isArray(analysis.line_items)
    ? analysis.line_items.map(normalizeLineItem).filter((item): item is PricingAnalysisLineItem => item !== null)
    : [];

  return {
    analysis: {
      event_summary: typeof analysis.event_summary === "string" ? analysis.event_summary : "",
      line_items: lineItems,
      recommended_min: Number(analysis.recommended_min) || 0,
      recommended_max: Number(analysis.recommended_max) || 0,
      recommended_center: Number(analysis.recommended_center) || 0,
      confidence: ["high", "medium", "low"].includes(analysis.confidence) ? analysis.confidence : "medium",
      budget_realism: analysis.budget_realism && typeof analysis.budget_realism === "object"
        ? {
            status: ["below_market", "within_market", "above_market", "unknown"].includes(analysis.budget_realism.status)
              ? analysis.budget_realism.status
              : "unknown",
            message: typeof analysis.budget_realism.message === "string" ? analysis.budget_realism.message : "",
            recommended_action: typeof analysis.budget_realism.recommended_action === "string" ? analysis.budget_realism.recommended_action : "",
          }
        : undefined,
      assumptions: Array.isArray(analysis.assumptions) ? analysis.assumptions.filter((item): item is string => typeof item === "string") : [],
      caution_notes: Array.isArray(analysis.caution_notes) ? analysis.caution_notes.filter((item): item is string => typeof item === "string") : [],
      generated_at: typeof analysis.generated_at === "string" ? analysis.generated_at : new Date().toISOString(),
    },
    market_data: payload.market_data ?? null,
    diagnostic: payload.diagnostic ?? null,
  };
}

export function PricingAnalysisCard({ request }: { request: EventRequest }) {
  const queryClient = useQueryClient();

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
        event_date: request.event_date,
        start_time: request.start_time,
        end_time: request.end_time,
        venue: request.venue || undefined,
        description: request.description || undefined,
        preferred_styles: request.preferred_styles,
        required_language: request.required_language || undefined,
        script_required: request.script_required,
        rehearsal_required: request.rehearsal_required,
        travel_required: request.travel_required,
        request_id: request.id,
      }),
  });

  const result = normalizePricingPayload(mutation.data?.data?.data);
  const analysis = result?.analysis;
  const analysisSource = result?.market_data?.analysis_source;
  const lineItemsTotal = analysis?.line_items.reduce((sum, item) => sum + item.estimated_price, 0) ?? 0;

  const applyBudgetMutation = useMutation({
    mutationFn: () => {
      if (!analysis) {
        throw new Error("반영할 AI 단가 분석 결과가 없습니다.");
      }

      const recommendedMin = Math.max(0, Math.floor(analysis.recommended_min || analysis.recommended_center));
      const recommendedMax = Math.max(
        recommendedMin,
        Math.floor(analysis.recommended_max || analysis.recommended_center || recommendedMin)
      );

      return aiApi.applyRequestBudget(request.id, {
        budget_min: recommendedMin,
        budget_max: recommendedMax,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerRequest(request.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customerRequests });
    },
  });

  const errorMessage =
    (mutation.error as ApiError<{ error: { message: string } }> | null)?.response?.data?.error?.message ||
    "AI 단가 분석을 불러오지 못했습니다.";
  const applyErrorMessage =
    (applyBudgetMutation.error as ApiError<{ error: { message: string } }> | null)?.response?.data?.error?.message ||
    (applyBudgetMutation.error as Error | null)?.message ||
    "추천 예산 반영에 실패했습니다.";

  return (
    <Card className="border-lavender/30 bg-lavender-light/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3 text-base">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-lavender" />
            AI 단가 분석
          </span>
          {analysis && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {getAnalysisSourceLabel(analysisSource)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {!analysis && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              행사 조건과 플랫폼 데이터를 바탕으로 항목별 적정 섭외 단가를 분석합니다.
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
            {analysisSource === "market_fallback" && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 space-y-1">
                <p>현재 결과는 Gemini 응답이 아니라 플랫폼 시장 데이터 기반 임시 산식입니다.</p>
                {result?.diagnostic?.gemini_error_message && (
                  <p className="font-medium">
                    원인: {result.diagnostic.gemini_error_message}
                    {result.diagnostic.gemini_status ? ` (HTTP ${result.diagnostic.gemini_status})` : ""}
                    {result.diagnostic.gemini_provider_status ? ` [${result.diagnostic.gemini_provider_status}]` : ""}
                  </p>
                )}
                <p>관리자용 <code>/api/ai/health</code>로 Gemini 연결 상태를 확인해 주세요.</p>
              </div>
            )}

            <div className="rounded-xl border border-line bg-card p-4">
              <p className="text-xs text-muted-foreground">추천 중심 단가</p>
              <p className="mt-1 text-2xl font-extrabold text-navy">
                {formatPrice(analysis.recommended_center)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                권장 범위 {formatPrice(analysis.recommended_min)} ~ {formatPrice(analysis.recommended_max)} · 신뢰도 <ConfidenceLabel value={analysis.confidence} />
              </p>
            </div>

            {analysis.budget_realism && (
              <div className="rounded-xl border border-line bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">예산 현실성 판단</p>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <BudgetRealismLabel value={analysis.budget_realism.status} />
                  </span>
                </div>
                {analysis.budget_realism.message && (
                  <p className="mt-2 text-muted-foreground">{analysis.budget_realism.message}</p>
                )}
                {analysis.budget_realism.recommended_action && (
                  <p className="mt-1 text-xs text-muted-foreground">권장: {analysis.budget_realism.recommended_action}</p>
                )}
              </div>
            )}

            {analysis.event_summary && (
              <div>
                <p className="font-semibold">행사 조건 요약</p>
                <p className="mt-1 text-muted-foreground">{analysis.event_summary}</p>
              </div>
            )}

            {result?.market_data && (
              <div>
                <p className="font-semibold">시장 데이터</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getAnalysisSourceLabel(result.market_data.analysis_source)} · 유사 프리랜서 {result.market_data.sample_count}명 기준 · 평균 {formatPrice(result.market_data.avg_price_min)} ~ {formatPrice(result.market_data.avg_price_max)}
                  {result.market_data.market_min > 0 || result.market_data.market_max > 0
                    ? ` · 전체 범위 ${formatPrice(result.market_data.market_min)} ~ ${formatPrice(result.market_data.market_max)}`
                    : ""}
                </p>
              </div>
            )}

            {analysis.line_items.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">항목별 예상 단가</p>
                  {lineItemsTotal > 0 && <p className="text-xs text-muted-foreground">항목 합계 {formatPrice(lineItemsTotal)}</p>}
                </div>
                <div className="mt-2 overflow-hidden rounded-xl border border-line bg-card">
                  {analysis.line_items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="border-b border-line p-3 last:border-b-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-navy">{item.name}</p>
                          {item.description && <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>}
                        </div>
                        <p className="shrink-0 font-semibold">{formatPrice(item.estimated_price)}</p>
                      </div>
                      {item.reason && <p className="mt-2 text-xs text-muted-foreground">근거: {item.reason}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.assumptions.length > 0 && (
              <div>
                <p className="font-semibold">분석 가정</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  {analysis.assumptions.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}

            {analysis.caution_notes.length > 0 && (
              <div>
                <p className="font-semibold">주의사항</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  {analysis.caution_notes.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}

            {applyBudgetMutation.isError && (
              <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive">
                {applyErrorMessage}
              </p>
            )}

            {applyBudgetMutation.isSuccess && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                추천 단가가 요청서 예산 범위에 반영되었습니다.
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={() => applyBudgetMutation.mutate()}
                disabled={applyBudgetMutation.isPending || mutation.isPending}
              >
                {applyBudgetMutation.isPending ? "반영 중..." : "추천 예산 반영"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || applyBudgetMutation.isPending}
              >
                다시 분석하기
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
