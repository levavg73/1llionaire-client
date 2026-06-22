"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api";
import { aiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, AlertTriangle, Loader2, Table2 } from "lucide-react";
import { ConfirmModal } from "@/components/common/ConfirmModal";

// ── 타입 ────────────────────────────────────────────────────

type Confidence = "high" | "medium" | "low";

interface LineItem {
  name: string;
  description: string;
  estimated_price: number;
  reason: string;
}

interface PricingResult {
  event_summary: string;
  line_items: LineItem[];
  recommended_min: number;
  recommended_max: number;
  recommended_center: number;
  confidence: Confidence;
  assumptions: string[];
  caution_notes: string[];
  market_data: {
    sample_count: number;
    market_min: number;
    avg_price_min: number;
    market_max: number;
  };
}

// ── 상수 ────────────────────────────────────────────────────

const CONFIDENCE_LABEL: Record<Confidence, { label: string; color: string }> = {
  high:   { label: "높음", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  medium: { label: "보통", color: "text-amber-600 bg-amber-50 border-amber-200"      },
  low:    { label: "낮음", color: "text-red-600 bg-red-50 border-red-200"            },
};

const CATEGORIES = [
  "기업행사 MC", "웨딩 사회자", "쇼호스트",
  "컨퍼런스 MC", "라이브커머스", "아나운서",
];

// ── 응답 정규화 ──────────────────────────────────────────────
// 서버가 { analysis: {...}, market_data: {...} } 구조로 반환
function normalize(raw: unknown): PricingResult | null {
  if (!raw || typeof raw !== "object") return null;

  const root = raw as Record<string, unknown>;
  const a    = (root.analysis ?? root) as Record<string, unknown>;
  const md   = (root.market_data ?? {}) as Record<string, unknown>;

  const n = (obj: Record<string, unknown>, ...keys: string[]): number => {
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === "number" && isFinite(v)) return v;
    }
    return 0;
  };

  const s = (obj: Record<string, unknown>, ...keys: string[]): string => {
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === "string" && v.trim()) return v;
    }
    return "";
  };

  const arr = (obj: Record<string, unknown>, ...keys: string[]): string[] => {
    for (const k of keys) {
      const v = obj[k];
      if (Array.isArray(v)) {
        const strs = v.filter((x): x is string => typeof x === "string");
        if (strs.length) return strs;
      }
    }
    return [];
  };

  // line_items 파싱
  const rawItems = Array.isArray(a.line_items) ? a.line_items : [];
  const line_items: LineItem[] = rawItems
    .filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null)
    .map((item) => ({
      name:            s(item, "name", "항목"),
      description:     s(item, "description", "desc", ""),
      estimated_price: n(item, "estimated_price", "price", "amount"),
      reason:          s(item, "reason", "rationale", ""),
    }));

  const center = n(a, "recommended_center", "recommended_price") ||
    n(root, "recommended_center", "recommended_price");

  return {
    event_summary:     s(a, "event_summary", "summary"),
    line_items,
    recommended_min:   n(a, "recommended_min")   || n(root, "recommended_min"),
    recommended_max:   n(a, "recommended_max")   || n(root, "recommended_max"),
    recommended_center: center,
    confidence:        (s(a, "confidence") || "medium") as Confidence,
    assumptions:       arr(a, "assumptions"),
    caution_notes:     arr(a, "caution_notes", "risk_notes"),
    market_data: {
      sample_count: n(md, "sample_count"),
      market_min:   n(md, "market_min"),
      avg_price_min: n(md, "avg_price_min"),
      market_max:   n(md, "market_max"),
    },
  };
}

// ── 폼 스키마 ────────────────────────────────────────────────

const schema = z.object({
  event_type:       z.string().min(1, "행사 유형을 입력해 주세요."),
  region:           z.string().min(1, "지역을 입력해 주세요."),
  categories:       z.array(z.string()).min(1, "분야를 하나 이상 선택해 주세요."),
  budget_min:       z.number().int().min(0).optional(),
  budget_max:       z.number().int().min(0).optional(),
  duration_hours:   z.number().min(0.5).max(24).optional(),
  career_years_min: z.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

// ── 페이지 컴포넌트 ─────────────────────────────────────────

export default function AdminAiPage() {
  const [result,            setResult]            = useState<PricingResult | null>(null);
  const [applyConfirm,      setApplyConfirm]      = useState(false);
  const [bookingIdForApply, setBookingIdForApply] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { region: "서울", categories: [] },
  });

  const analysisMutation = useMutation({
    mutationFn: (data: FormValues) => aiApi.analyzePricing(data),
    onSuccess: (res) => {
      const parsed = normalize(res.data.data);
      setResult(parsed);
    },
  });

  const applyMutation = useMutation({
    mutationFn: ({ bookingId, price }: { bookingId: string; price: number }) =>
      aiApi.applyRecommendation({ booking_id: bookingId, recommended_price: price }),
    onSuccess: () => { setApplyConfirm(false); setBookingIdForApply(""); },
  });

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(next);
    setValue("categories", next, { shouldValidate: true });
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI 단가 분석</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          행사 조건과 플랫폼 데이터를 바탕으로 적정 섭외 단가를 분석합니다.
        </p>
      </div>

      {/* ── 입력 폼 ───────────────────────────────────────── */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">분석 조건 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((v) =>
              analysisMutation.mutate({ ...v, categories: selectedCategories })
            )}
            noValidate
            className="space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>행사 유형 *</Label>
                <Input placeholder="기업 시상식" {...register("event_type")} />
                {errors.event_type && (
                  <p className="text-xs text-destructive">{errors.event_type.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>지역 *</Label>
                <Input placeholder="서울" {...register("region")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>분야 * (복수 선택)</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                      selectedCategories.includes(cat)
                        ? "border-navy bg-navy text-white"
                        : "border-border text-muted-foreground hover:border-navy/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.categories && (
                <p className="text-xs text-destructive">{errors.categories.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>예산 최소 (원)</Label>
                <Input
                  type="number"
                  placeholder="300000"
                  {...register("budget_min", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>예산 최대 (원)</Label>
                <Input
                  type="number"
                  placeholder="1000000"
                  {...register("budget_max", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>진행 시간 (h)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="2"
                  {...register("duration_hours", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>최소 경력 (년)</Label>
              <Input
                type="number"
                placeholder="0"
                className="max-w-[120px]"
                {...register("career_years_min", { valueAsNumber: true })}
              />
            </div>

            {analysisMutation.isError && (
              <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {(analysisMutation.error as ApiError<{ error: { message: string } }>)
                  ?.response?.data?.error?.message || "분석 중 오류가 발생했습니다. GEMINI_API_KEY 환경변수를 확인해 주세요."}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-navy text-white hover:bg-navy-light"
              disabled={analysisMutation.isPending}
            >
              {analysisMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 분석 중...
                </span>
              ) : "단가 분석 시작"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── 분석 결과 ──────────────────────────────────────── */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">분석 결과</CardTitle>
                  {result.event_summary && (
                    <CardDescription className="mt-1 text-xs">
                      {result.event_summary}
                    </CardDescription>
                  )}
                  <CardDescription className="mt-0.5 text-xs">
                    시장 데이터 {result.market_data.sample_count}개 기반
                  </CardDescription>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    CONFIDENCE_LABEL[result.confidence].color
                  }`}
                >
                  신뢰도 {CONFIDENCE_LABEL[result.confidence].label}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 추천 단가 요약 */}
              <div className="rounded-xl bg-muted/50 p-5 text-center">
                <p className="text-sm text-muted-foreground mb-1">추천 단가</p>
                <p className="text-3xl font-bold text-navy">
                  {formatPrice(result.recommended_center)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  범위: {formatPrice(result.recommended_min)} ~{" "}
                  {formatPrice(result.recommended_max)}
                </p>
              </div>

              <Separator />

              {/* 단위 항목별 견적표 */}
              {result.line_items.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Table2 className="h-4 w-4 text-navy" />
                    단위 항목별 예상 단가
                  </div>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 text-left">
                          <th className="px-3 py-2 font-semibold text-xs">항목</th>
                          <th className="px-3 py-2 font-semibold text-xs">설명</th>
                          <th className="px-3 py-2 font-semibold text-xs text-right">예상 금액</th>
                          <th className="px-3 py-2 font-semibold text-xs hidden sm:table-cell">산정 근거</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.line_items.map((item, i) => (
                          <tr
                            key={i}
                            className="border-t hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                              {item.name}
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground">
                              {item.description}
                            </td>
                            <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">
                              {formatPrice(item.estimated_price)}
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground text-xs hidden sm:table-cell">
                              {item.reason}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t bg-navy/5">
                          <td className="px-3 py-2.5 font-bold" colSpan={2}>
                            합계
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-navy whitespace-nowrap">
                            {formatPrice(
                              result.line_items.reduce(
                                (sum, item) => sum + item.estimated_price,
                                0
                              )
                            )}
                          </td>
                          <td className="hidden sm:table-cell" />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <Separator />

              {/* 시장 현황 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4 text-navy" />
                  시장 현황
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "시장 최저", value: result.market_data.market_min },
                    { label: "평균 단가", value: result.market_data.avg_price_min },
                    { label: "시장 최고", value: result.market_data.market_max },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold mt-0.5">{formatPrice(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 가정 사항 */}
              {result.assumptions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold">분석 가정</p>
                  <ul className="space-y-1">
                    {result.assumptions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 주의사항 */}
              {result.caution_notes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    주의사항
                  </div>
                  <ul className="space-y-1">
                    {result.caution_notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* 예약 단가 반영 */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">예약에 단가 반영</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="예약 ID 입력"
                    value={bookingIdForApply}
                    onChange={(e) => setBookingIdForApply(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setApplyConfirm(true)}
                    disabled={!bookingIdForApply || applyMutation.isPending}
                  >
                    반영
                  </Button>
                </div>
                {applyMutation.isSuccess && (
                  <p className="text-sm text-emerald-600">✅ 예약에 단가가 반영되었습니다.</p>
                )}
                {applyMutation.isError && (
                  <p className="text-sm text-destructive">
                    {(applyMutation.error as ApiError<{ error: { message: string } }>)
                      ?.response?.data?.error?.message || "반영에 실패했습니다."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmModal
        open={applyConfirm}
        onOpenChange={(o) => !o && setApplyConfirm(false)}
        title="AI 추천 단가 반영"
        description={`예약에 ${result ? formatPrice(result.recommended_center) : ""}을 적용하시겠습니까? 양측에 알림이 발송됩니다.`}
        confirmLabel="반영"
        onConfirm={() => {
          if (bookingIdForApply && result) {
            applyMutation.mutate({
              bookingId: bookingIdForApply,
              price: result.recommended_center,
            });
          }
        }}
        isLoading={applyMutation.isPending}
      />
    </div>
  );
}